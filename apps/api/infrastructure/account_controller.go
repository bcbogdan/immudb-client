package infrastructure

import (
	"api/common"
	"api/services"

	"github.com/gin-gonic/gin"
)

type AccountController struct {
	accountService services.AccountService
}

func NewAccountController(accountService services.AccountService) *AccountController {
	return &AccountController{
		accountService: accountService,
	}
}

func (ac *AccountController) AddAccountingInformation() gin.HandlerFunc {
	return func(c *gin.Context) {
		var accountInformation common.AccountingInformation
		if err := c.ShouldBindJSON(&accountInformation); err != nil {
			c.JSON(400, gin.H{
				"error": err.Error(),
			})
			return
		}
		err := ac.accountService.AddAccountingInformation(&accountInformation)
		if err != nil {
			c.JSON(400, gin.H{
				"error": err.Error(),
			})
		} else {
			c.JSON(200, gin.H{
				"message": "ok",
			})
		}
	}
}

func (ac *AccountController) GetAccountingInformation() gin.HandlerFunc {
	return func(c *gin.Context) {
		var searchAccountingInformationQuery common.SearchAccountingInformationQuery
		if err := c.ShouldBindJSON(&searchAccountingInformationQuery); err != nil {
			c.JSON(400, gin.H{
				"error": err.Error(),
			})
			return
		}
		result, err := ac.accountService.GetAccountingInformation(&searchAccountingInformationQuery)
		if err != nil {
			c.JSON(400, gin.H{
				"error": err.Error(),
			})
		} else {
			c.JSON(200, gin.H{
				"data": result,
			})
		}
	}
}
