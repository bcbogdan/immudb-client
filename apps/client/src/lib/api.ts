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
  if (!response.ok) {
    throw new Error("Failed to add accounting information");
  }
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
  if (!response.ok) {
    throw new Error("Failed to add accounting information");
  }
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
  if (!response.ok) {
    throw new Error("Failed to add accounting information");
  }
  return response.json();
};

export const listFiles = async () => {
  const response = await fetch(`http://localhost:3000/file`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to add accounting information");
  }
  return response.json();
};

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`http://localhost:3000/file/upload`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Failed to upload file");
  }
  return response.json();
};
