package main

import (
	"api/infrastructure"
	"api/services"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func setupRouter() *gin.Engine {
	// Disable Console Color
	// gin.DisableConsoleColor()
	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "ok")
	})

	accountService := services.NewAccountService()
	// Ping test

	accountController := infrastructure.NewAccountController(accountService)
	r.POST("/account", accountController.AddAccountingInformation())
	r.POST("/account/search", accountController.GetAccountingInformation())

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
