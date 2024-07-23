import { AccountingInformation, SearchQuery } from "./types";

const API_ENDPOINT = import.meta.env.VITE_API_URL;
export const addAccountingInformation = async (
  accountingInformation: AccountingInformation,
) => {
  const response = await fetch(`${API_ENDPOINT}/account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(accountingInformation),
  });
  return response.json();
};

export const getAccountingInformation = async (query: SearchQuery) => {
  const response = await fetch(`${API_ENDPOINT}/account/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  });
  const body = (await response.json()) as {
    data: { rows: AccountingInformation[]; count: number };
  };
  return body.data;
};

export const resetAccountingInformation = async () => {
  const response = await fetch(`${API_ENDPOINT}/account/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};
