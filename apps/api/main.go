package main

import (
	"api/common"
	"api/infrastructure"
	"api/services"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

type FileObject struct {
	Name string `json:"name"`
}

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
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, int64(30<<20))
		// single file
		file, _ := c.FormFile("file")
		log.Println(file.Filename)

		// Upload the file to specific dst.
		// c.SaveUploadedFile(file, "./tmp")

		c.String(http.StatusOK, fmt.Sprintf("'%s' uploaded!", file.Filename))
	})

	r.GET("/file", func(c *gin.Context) {
		// Upload the file to specific dst.
		// c.SaveUploadedFile(file, "./tmp")
		files, err := ioutil.ReadDir("./tmp")
		if err != nil {
			log.Fatal(err)
		}

		filesResult := []FileObject{}

		for i, v := range files {
			fmt.Println(i, v)
			fileResult := FileObject{
				Name: v.Name(),
			}
			filesResult = append(filesResult, fileResult)
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
