package infrastructure

import (
	"api/common"
	"net/http"

	"github.com/gin-gonic/gin"
)

type FileController struct {
	fileService common.FileService
}

func NewFileController(fileService common.FileService) *FileController {
	return &FileController{
		fileService: fileService,
	}
}

func (fc *FileController) UploadFile() gin.HandlerFunc {
	return func(c *gin.Context) {
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No file is received"})
			return
		}
		fileObject, err := fc.fileService.Upload(file)
		if err != nil {
			c.JSON(400, gin.H{
				"error": err.Error(),
			})
		} else {
			c.JSON(200, gin.H{"file": fileObject})
		}
	}
}

func (fc *FileController) ListFiles() gin.HandlerFunc {
	return func(c *gin.Context) {
		result, err := fc.fileService.List()
		if err != nil {
			c.JSON(400, gin.H{
				"error": err.Error(),
			})
		} else {
			c.JSON(200, gin.H{
				"files": result,
			})
		}
	}
}
