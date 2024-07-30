package main

import (
	"api/common"
	"api/infrastructure"
	"api/services"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

func setupRouter() *gin.Engine {
	// Disable Console Color
	// gin.DisableConsoleColor()
	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173"}
	r.Use(cors.New(config))
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "ok")
	})

	apiKey := os.Getenv("IMMUDB_API_KEY")
	collectionName := os.Getenv("IMMUDB_COLLECTION_NAME")
	ledgerName := os.Getenv("IMMUDB_LEDGER_NAME")
	immudbVaultClient := common.NewImmudbVaultClient(apiKey)
	accountService := services.NewAccountService(immudbVaultClient, collectionName, ledgerName)

	r.MaxMultipartMemory = 8 << 20
	accountController := infrastructure.NewAccountController(accountService)

	r.POST("/account", accountController.AddAccountingInformation())
	r.POST("/account/search", accountController.GetAccountingInformation())
	r.POST("/account/reset", accountController.ResetAccountingInformation())

	r.POST("/file/upload", func(c *gin.Context) {
		// single file
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No file is received"})
			return
		}
		fileName := filepath.Base(file.Filename)
		log.Println(file.Filename)

		fileId := uuid.New().String()
		destinationDirectory := filepath.Join("./tmp", fileId)
		if err := os.MkdirAll(destinationDirectory, os.ModePerm); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to create uploads directory"})
			return
		}

		filePath := filepath.Join(destinationDirectory, fileName)
		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to save the file"})
			return
		}
		fileHeader, err := file.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to open the file"})
			return
		}
		defer fileHeader.Close()
		buffer := make([]byte, 512)
		_, err = fileHeader.Read(buffer)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to read the file"})
			return
		}
		mimeType := http.DetectContentType(buffer)
		fileObject := common.FileObject{
			Path:     filePath,
			Name:     fileName,
			Size:     file.Size,
			MimeType: mimeType,
		}

		metadataPath := filepath.Join(destinationDirectory, "metadata.json")
		metadataFile, err := os.Create(metadataPath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to create metadata file"})
			return
		}
		defer metadataFile.Close()

		encoder := json.NewEncoder(metadataFile)
		if err := encoder.Encode(fileObject); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to encode metadata to JSON"})
			return
		}
		c.JSON(200, gin.H{
			"file": fileObject,
		})
	})

	r.GET("/file", func(c *gin.Context) {
		filesResult := []common.FileObject{}
		err := filepath.Walk("./tmp", func(path string, info os.FileInfo, err error) error {
			fmt.Println(path)
			if err != nil {
				return err
			}

			// Skip if not a directory or root directory
			if !info.IsDir() || path == "./tmp" {
				return nil
			}

			metadataPath := filepath.Join(path, "metadata.json")
			metadataFile, err := os.Open(metadataPath)
			if err != nil {
				return err
			}
			defer metadataFile.Close()

			var metadata common.FileObject
			if err := json.NewDecoder(metadataFile).Decode(&metadata); err != nil {
				return err
			}

			filesResult = append(filesResult, metadata)
			return nil
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to list files"})
			return
		}
		c.JSON(200, gin.H{
			"files": filesResult,
		})
	})
	return r
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	r := setupRouter()
	// remove proxy warnings
	r.ForwardedByClientIP = true
	r.SetTrustedProxies([]string{"127.0.0.1"})
	// Listen and Server in 0.0.0.0:8080
	r.Run(":8080")
}
