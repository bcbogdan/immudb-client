package main

import (
	"fmt"
	"log"
	"os"
	"testing"

	"github.com/joho/godotenv"
)

func init() {
	fmt.Println("init")
	if err := godotenv.Load(".env.test"); err != nil {
		log.Printf("No .env file found or failed to load: %v", err)
	}
}

func TestMain(m *testing.M) {
	fmt.Println("TestMain")
	code := m.Run()

	os.Exit(code)
}
