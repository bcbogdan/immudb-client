package services

import (
	"api/common"
	"fmt"
	"os"

	"github.com/mitchellh/mapstructure"
)

var (
	API_KEY         = os.Getenv("IMMUDB_API_KEY")
	COLLECTION_NAME = os.Getenv("IMMUDB_COLLECTION_NAME")
)

type AccountService interface {
	AddAccountingInformation(*common.AccountingInformation) error
	GetAccountingInformation(*common.SearchAccountingInformationQuery) (*common.SearchAccountingInformationResult, error)
}

type accountService struct{}

func NewAccountService() AccountService {
	return &accountService{}
}

func (s *accountService) AddAccountingInformation(accountingInformation *common.AccountingInformation) error {
	ledgerName := "default"
	collectionName := "test"

	apiKey := os.Getenv("IMMUDB_API_KEY")
	immudbClient := common.NewImmudbVaultClient(apiKey)
	_, err := immudbClient.AddDocument(ledgerName, collectionName, accountingInformation)
	if err != nil {
		fmt.Println(err)
		return fmt.Errorf("failed to add accounting information: %v", err)
	}
	return nil
}

func (s *accountService) GetAccountingInformation(query *common.SearchAccountingInformationQuery) (*common.SearchAccountingInformationResult, error) {
	ledgerName := "default"
	collectionName := "test"

	apiKey := os.Getenv("IMMUDB_API_KEY")
	immudbClient := common.NewImmudbVaultClient(apiKey)

	parsedQuery := parseQuery(query)
	searchPayload := common.SearchDocumentsPayload{
		Query:   *parsedQuery,
		Page:    query.Pagination.Page,
		PerPage: query.Pagination.Limit,
	}
	getDocumentsResponse, err := immudbClient.GetDocuments(ledgerName, collectionName, searchPayload)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("failed to search documents: %v", err)
	}

	countPayload := common.CountDocumentsPayload{
		Query: *parsedQuery,
	}
	countDocumentsResponse, err := immudbClient.CountDocuments(ledgerName, collectionName, countPayload)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("failed to count documents: %v", err)
	}

	var searchResults []common.AccountingInformation
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
	immudbSearchQuery := common.SearchQuery{
		Limit: query.Pagination.Limit,
	}

	if query.Filters != nil && len(query.Filters) > 0 {
		immudbSearchQuery.Expressions = []common.QueryExpression{
			{
				FieldComparisons: make([]common.FieldComparison, len(query.Filters)),
			},
		}
	}

	for i, filter := range query.Filters {
		immudbSearchQuery.Expressions[0].FieldComparisons[i] = common.FieldComparison{
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