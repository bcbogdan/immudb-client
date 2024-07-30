package common

type TransactionType string

const (
	Sending   TransactionType = "sending"
	Receiving TransactionType = "receiving"
)

type AccountingInformation struct {
	AccountNumber string          `json:"accountNumber" binding:"required"`
	AccountName   string          `json:"accountName" binding:"required"`
	IBAN          string          `json:"iban" binding:"required"`
	Address       string          `json:"address" binding:"required"`
	Type          TransactionType `json:"type" binding:"required,oneof=sending receiving"`
	Amount        float64         `json:"amount" binding:"required,gt=0"`
}

type SearchAccountingInformationSorting struct {
	Field string `json:"field" binding:"required,oneof=accountNumber accountName iban address type amount"`
	Order string `json:"order" binding:"required,oneof=asc desc"`
}

type SearchAccountingInformationPagination struct {
	Page  int `json:"page" binding:"gte=1"`
	Limit int `json:"limit" binding:"gte=10,lte=100"`
}

type SearchAccountingInformationFilters struct {
	Field    string `json:"field" binding:"required,oneof=accountNumber accountName iban address type amount"`
	Operator string `json:"operator" binding:"required,oneof=EQ NEQ GE GT LT LE LIKE"`
	Value    string `json:"value" binding:"required"`
}

type SearchAccountingInformationQuery struct {
	Filters    []SearchAccountingInformationFilters  `json:"filters"`
	Sorting    []SearchAccountingInformationSorting  `json:"sorting"`
	Pagination SearchAccountingInformationPagination `json:"pagination"`
}

type SearchAccountingInformationResult struct {
	Rows  []AccountingInformation `json:"rows"`
	Count int                     `json:"count"`
}

type FileObject struct {
	MimeType string `json:"mimeType"`
	Path     string `json:"id"`
	Name     string `json:"name"`
	Size     int64  `json:"size"`
}
