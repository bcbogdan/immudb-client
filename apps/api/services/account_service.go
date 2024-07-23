package services

import (
	"api/common"
	"fmt"

	"github.com/mitchellh/mapstructure"
)

type AccountService interface {
	AddAccountingInformation(*common.AccountingInformation) error
	GetAccountingInformation(*common.SearchAccountingInformationQuery) (*common.SearchAccountingInformationResult, error)
	ResetAccountingInformation() error
}

type accountService struct {
	immudbVaultClient common.ImmudbVaultClient
	collectionName    string
	ledgerName        string
}

func NewAccountService(immudbVaultCient common.ImmudbVaultClient, collectionName string, ledgerName string) AccountService {
	return &accountService{
		immudbVaultClient: immudbVaultCient,
		collectionName:    collectionName,
		ledgerName:        ledgerName,
	}
}

func (s *accountService) AddAccountingInformation(accountingInformation *common.AccountingInformation) error {
	_, err := s.immudbVaultClient.AddDocument(s.ledgerName, s.collectionName, accountingInformation)
	if err != nil {
		fmt.Println(err)
		return fmt.Errorf("failed to add accounting information: %v", err)
	}
	return nil
}

func (s *accountService) GetAccountingInformation(query *common.SearchAccountingInformationQuery) (*common.SearchAccountingInformationResult, error) {
	parsedQuery := parseQuery(query)
	searchPayload := common.SearchDocumentsPayload{
		Query:   *parsedQuery,
		Page:    query.Pagination.Page,
		PerPage: query.Pagination.Limit,
	}
	getDocumentsResponse, err := s.immudbVaultClient.GetDocuments(s.ledgerName, s.collectionName, searchPayload)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("failed to search documents: %v", err)
	}

	countPayload := common.CountDocumentsPayload{
		Query: *parsedQuery,
	}
	countDocumentsResponse, err := s.immudbVaultClient.CountDocuments(s.ledgerName, s.collectionName, countPayload)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("failed to count documents: %v", err)
	}

	searchResults := make([]common.AccountingInformation, 0)
	for _, revision := range getDocumentsResponse.Revisions {
		var accountingInformation common.AccountingInformation
		mapstructure.Decode(revision.Document, &accountingInformation)
		searchResults = append(searchResults, accountingInformation)
	}

	result := common.SearchAccountingInformationResult{
		Count: countDocumentsResponse.Count,
		Rows:  searchResults,
	}

	return &result, nil
}

func parseQuery(query *common.SearchAccountingInformationQuery) *common.SearchQuery {
	immudbSearchQuery := common.SearchQuery{}

	if query.Filters != nil && len(query.Filters) > 0 {
		immudbSearchQuery.Expressions = make([]common.QueryExpression, len(query.Filters))
	}

	for i, filter := range query.Filters {
		immudbSearchQuery.Expressions[i] = common.QueryExpression{
			Value:    filter.Value,
			Field:    filter.Field,
			Operator: filter.Operator,
		}
	}

	if query.Sorting != nil && len(query.Sorting) > 0 {
		immudbSearchQuery.OrderBy = make([]common.QueryOrderBy, len(query.Sorting))
	}

	for i, sorting := range query.Sorting {
		immudbSearchQuery.OrderBy[i] = common.QueryOrderBy{
			Field: sorting.Field,
			Desc:  sorting.Order == "desc",
		}
	}

	return &immudbSearchQuery
}

func (s *accountService) ResetAccountingInformation() error {
	err := s.immudbVaultClient.DeleteCollection(s.ledgerName, s.collectionName)
	if err != nil {
		return fmt.Errorf("failed to delete collection: %v", err)
	}
	createPayload := common.CreateCollectionPayload{
		IdFieldName: "id",
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
	err = s.immudbVaultClient.CreateCollection(s.ledgerName, s.collectionName, createPayload)
	if err != nil {
		return fmt.Errorf("failed to create collection: %v", err)
	}
	return nil
}
