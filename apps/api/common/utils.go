package common

import (
	"fmt"
	"os"
	"path/filepath"
)

func FindProjectRoot() (string, error) {
	dir, err := os.Getwd()
	if err != nil {
		return "", fmt.Errorf("could not get current working directory: %v", err)
	}

	for {
		if fileExists(filepath.Join(dir, "go.mod")) || dirExists(filepath.Join(dir, ".git")) {
			return dir, nil // Project root found
		}

		parentDir := filepath.Dir(dir)
		if parentDir == dir {
			return "", fmt.Errorf("could not find project root")
		}
		dir = parentDir
	}
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return !os.IsNotExist(err)
}

// dirExists checks if the specified directory exists.
func dirExists(path string) bool {
	info, err := os.Stat(path)
	if os.IsNotExist(err) {
		return false
	}
	return info.IsDir()
}
