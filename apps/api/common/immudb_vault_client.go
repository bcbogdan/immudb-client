package common

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

type CreateCollectionField struct {
	Name string `json:"name"`
	Type string `json:"type"`
}
type CreateCollectionIndex struct {
	Fields   []string `json:"fields"`
	IsUnique bool     `json:"isUnique"`
}

type CreateCollectionPayload struct {
	IdFieldName string                  `json:"idFieldName"`
	Fields      []CreateCollectionField `json:"fields"`
	Indexes     []CreateCollectionIndex `json:"indexes"`
}

type FieldComparison struct {
	Value    interface{} `json:"value"`
	Field    string      `json:"field"`
	Operator string      `json:"operator"`
}

type QueryExpression struct {
	FieldComparisons []FieldComparison `json:"fieldComparisions"`
}
type QueryOrderBy struct {
	Field string `json:"field"`
	Desc  bool   `json:"desc"`
}

type SearchQuery struct {
	Expressions []QueryExpression `json:"expressions,omitempty"`
	OrderBy     []QueryOrderBy    `json:"orderBy,omitempty"`
	Limit       int               `json:"limit"`
}

type SearchDocumentsPayload struct {
	Query   SearchQuery `json:"query,omitempty"`
	Page    int         `json:"page"`
	PerPage int         `json:"perPage"`
}

type CountDocumentsPayload struct {
	Query SearchQuery `json:"query"`
}

type SearchDocumentsResult struct {
	SearchId  string `json:"searchId"`
	Revisions []struct {
		Document      map[string]interface{} `json:"document"`
		TransactionId string                 `json:"transactionId"`
		Revision      string                 `json:"revision"`
	} `json:"revisions"`
	Page    int `json:"page"`
	PerPage int `json:"perPage"`
}

type CountDocumentsResult struct {
	Collection string `json:"collection"`
	Count      int    `json:"count"`
}

type ImmudbVaultClient interface {
	AddDocument(ledgerName string, collectionName string, document interface{}) (map[string]interface{}, error)
	CreateCollection(ledgerName string, collectionName string, collectionPayload CreateCollectionPayload) error
	GetDocuments(ledgerName string, collectionName string, searchPayload SearchDocumentsPayload) (*SearchDocumentsResult, error)
	CountDocuments(ledgerName string, collectionName string, query CountDocumentsPayload) (*CountDocumentsResult, error)
}

type immudbVaultClient struct {
	ApiKey string
}

func NewImmudbVaultClient(apiKey string) ImmudbVaultClient {
	return &immudbVaultClient{
		ApiKey: apiKey,
	}
}

func (ic *immudbVaultClient) AddDocument(ledgerName string, collectionName string, document interface{}) (map[string]interface{}, error) {
	url := fmt.Sprintf("https://vault.immudb.io/ics/api/v1/ledger/%s/collection/%s/document", ledgerName, collectionName)
	client := &http.Client{
		Timeout: time.Second * 10,
	}
	log.Println(url)
	out, err := json.Marshal(document)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal the request body: %v", err)
	}
	req, err := http.NewRequest("PUT", url, bytes.NewBuffer(out))
	if err != nil {
		return nil, fmt.Errorf("failed to create a new request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	fmt.Printf("API_KEY %s \n", ic.ApiKey)
	req.Header.Set("X-API-KEY", ic.ApiKey)
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send the request: %v", err)
	}
	defer resp.Body.Close()
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read the response body: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("request failed with status code: %v", resp.Status)
	}
	var result map[string]interface{}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal the response body: %v", err)
	}
	fmt.Println(result)
	return result, nil
}

func (ic *immudbVaultClient) CreateCollection(ledgerName string, collectionName string, createPayload CreateCollectionPayload) error {
	url := fmt.Sprintf("https://vault.immudb.io/ics/api/v1/ledger/%s/collection/%s", ledgerName, collectionName)
	client := &http.Client{
		Timeout: time.Second * 10,
	}
	out, err := json.Marshal(createPayload)
	if err != nil {
		return fmt.Errorf("failed to marshal the request body: %v", err)
	}

	req, err := http.NewRequest("PUT", url, bytes.NewBuffer(out))
	if err != nil {
		return fmt.Errorf("failed to create a new request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-KEY", ic.ApiKey)
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to create the request: %v", err)
	}
	defer resp.Body.Close()
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read the response body: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		fmt.Println(resp.Status)
		fmt.Println(string(respBody))
		return fmt.Errorf("failed to get accounting information: %v", resp.Status)
	}
	fmt.Println(string(respBody))

	return err
}

func (ic *immudbVaultClient) GetDocuments(ledgerName string, collectionName string, payload SearchDocumentsPayload) (*SearchDocumentsResult, error) {
	url := fmt.Sprintf("https://vault.immudb.io/ics/api/v1/ledger/%s/collection/%s/documents/search", ledgerName, collectionName)
	client := &http.Client{
		Timeout: time.Second * 10,
	}
	out, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal the request body: %v", err)
	}
	fmt.Println(string(out))
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(out))
	if err != nil {
		return nil, fmt.Errorf("failed to create a new request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-KEY", ic.ApiKey)
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send the request: %v", err)
	}
	defer resp.Body.Close()
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read the response body: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		fmt.Println(resp.Status)
		fmt.Println(string(respBody))
		return nil, fmt.Errorf("failed to add accounting information: %v", resp.Status)
	}
	var result SearchDocumentsResult
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal the response body: %v", err)
	}
	return &result, nil
}

func (ic *immudbVaultClient) CountDocuments(ledgerName string, collectionName string, query CountDocumentsPayload) (*CountDocumentsResult, error) {
	url := fmt.Sprintf("https://vault.immudb.io/ics/api/v1/ledger/%s/collection/%s/documents/count", ledgerName, collectionName)
	client := &http.Client{
		Timeout: time.Second * 10,
	}
	out, err := json.Marshal(query)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal the request body: %v", err)
	}
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(out))
	if err != nil {
		return nil, fmt.Errorf("failed to create a new request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-KEY", ic.ApiKey)
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send the request: %v", err)
	}
	defer resp.Body.Close()
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read the response body: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		fmt.Println(resp.Status)
		fmt.Println(string(respBody))
		return nil, fmt.Errorf("failed to add accounting information: %v", resp.Status)
	}
	fmt.Println(string(respBody))
	var result CountDocumentsResult
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal the response body: %v", err)
	}
	return &result, nil
}
