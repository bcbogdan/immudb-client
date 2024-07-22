package commands

import (
	"api/common"
	"os"
)

func CreateCollectionWithoutUserId() {
	apiKey := os.Getenv("IMMUDB_API_KEY")
	immudbClient := common.NewImmudbVaultClient(apiKey)
	collectionName := "only-accounts"
	createPayload := common.CreateCollectionPayload{
		IdFieldName: "accountNumber",
		Fields: []common.CreateCollectionField{
			{
				Name: "accountNumber",
				Type: "STRING",
			},
			{
				Name: "accountName",
				Type: "STRING",
			},
			{
				Name: "iban",
				Type: "STRING",
			},
			{
				Name: "address",
				Type: "STRING",
			},
			{
				Name: "type",
				Type: "STRING",
			},
			{
				Name: "amount",
				Type: "DOUBLE",
			},
		},
		Indexes: []common.CreateCollectionIndex{
			{
				Fields:   []string{"accountNumber"},
				IsUnique: true,
			},
		},
	}
	immudbClient.CreateCollection("default", collectionName, createPayload)
}
