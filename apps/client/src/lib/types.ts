export type AccountingInformation = {
  accountNumber: string;
  accountName: string;
  iban: string;
  address: string;
  type: "sending" | "receiving";
  amount: number;
};

export type SearchQuery = {
  filters?: {
    fields: string;
    operator: "LE" | "LT" | "GE" | "GT" | "EQ" | "NEQ" | "LIKE";
    value: unknown;
  }[];
  sorting?: {
    field: string;
    order: "asc" | "desc";
  }[];
  pagination: {
    page: number;
    limit: number;
  };
};
