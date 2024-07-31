package services

import (
	"api/common"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"

	"github.com/google/uuid"
)

const (
	tmpDirectory     = "./tmp"
	metadataFileName = "metadata.json"
)

type LocalFileService interface {
	common.FileService
}

type localFileService struct {
	filesDestionation string
}

func NewFileService(projectRoot string) LocalFileService {
	filesDestionation := filepath.Join(projectRoot, tmpDirectory)
	return &localFileService{
		filesDestionation: filesDestionation,
	}
}

func (lfs *localFileService) Upload(file *multipart.FileHeader) (*common.FileObject, error) {
	fileName := filepath.Base(file.Filename)
	fileData, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %v", err)
	}
	defer fileData.Close()

	fileId := uuid.New().String()
	destinationDirectory := filepath.Join(lfs.filesDestionation, fileId)
	if err := os.MkdirAll(destinationDirectory, os.ModePerm); err != nil {
		return nil, fmt.Errorf("failed to create file directory: %v", err)
	}

	filePath := filepath.Join(destinationDirectory, fileName)
	destinationFile, err := os.Create(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to create file: %v", err)
	}
	defer destinationFile.Close()

	buffer := make([]byte, 512)
	_, err = fileData.Read(buffer)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %v", err)
	}

	if _, err := io.Copy(destinationFile, fileData); err != nil {
		return nil, fmt.Errorf("failed to save file: %v", err)
	}

	mimeType := http.DetectContentType(buffer)
	fileObject := common.FileObject{
		Path:     filePath,
		Name:     fileName,
		Size:     file.Size,
		MimeType: mimeType,
	}

	metadataPath := filepath.Join(destinationDirectory, metadataFileName)
	metadataFile, err := os.Create(metadataPath)
	if err != nil {
		return nil, fmt.Errorf("failed to write metadata file: %v", err)
	}
	defer metadataFile.Close()

	encoder := json.NewEncoder(metadataFile)
	if err := encoder.Encode(fileObject); err != nil {
		return nil, fmt.Errorf("failed to write metadata file: %v", err)
	}

	return &fileObject, nil
}

func (s *localFileService) Download(filePath string) (common.FileObject, error) {
	return common.FileObject{}, nil
}

func (lfs *localFileService) List() ([]common.FileObject, error) {
	filesResult := []common.FileObject{}

	err := filepath.Walk(lfs.filesDestionation, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() || path == lfs.filesDestionation {
			return nil
		}

		metadataPath := filepath.Join(path, metadataFileName)
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
		return nil, fmt.Errorf("failed to list files: %v", err)
	}
	return filesResult, nil
}
