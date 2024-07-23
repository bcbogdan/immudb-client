package services

import (
	"api/common"
	"log"
	"os"
	"testing"

	"github.com/joho/godotenv"
)

func setup() {
	// TODO: Add steps to create and teardown a new collection in order to avoid collisions
	if err := godotenv.Load("../.env.test"); err != nil {
		log.Printf("No .env file found or failed to load: %v", err)
	}
}

func TestAccountNumberUniqueness(t *testing.T) {
	collectionName := os.Getenv("IMMUDB_COLLECTION_NAME")
	ledgerName := os.Getenv("IMMUDB_LEDGER_NAME")
	apiKey := os.Getenv("IMMUDB_API_KEY")
	immudbVaultClient := common.NewImmudbVaultClient(apiKey)
	accountService := NewAccountService(immudbVaultClient, collectionName, ledgerName)
	accountNumber := "123456789123"
	accountingInformation := common.AccountingInformation{
		AccountNumber: accountNumber,
		AccountName:   "Test Account",
		IBAN:          "IBAN",
		Address:       "123 Street",
		Type:          "sending",
		Amount:        100,
	}
	err := accountService.AddAccountingInformation(&accountingInformation)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	accountingInformation2 := common.AccountingInformation{
		AccountNumber: accountNumber,
		AccountName:   "Test Account 2",
		IBAN:          "IBAN",
		Address:       "123 Street",
		Type:          "sending",
		Amount:        100,
	}
	err = accountService.AddAccountingInformation(&accountingInformation2)
	if err == nil {
		t.Errorf("Expected error, got nil")
	}

	accountingInformation3 := common.AccountingInformation{
		AccountNumber: accountNumber,
		AccountName:   "Test Account 3",
		IBAN:          "IBAN2",
		Address:       "1234 Street",
		Type:          "receiving",
		Amount:        101,
	}
	err = accountService.AddAccountingInformation(&accountingInformation3)
	if err == nil {
		t.Errorf("Expected error, got nil")
	}
}

func TestMain(m *testing.M) {
	setup()
	code := m.Run()
	os.Exit(code)
}
