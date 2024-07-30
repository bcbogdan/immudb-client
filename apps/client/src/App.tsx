import { useCallback, useState } from "react";
import { debounce } from "remeda";
import { SearchQuery } from "./lib/types";
import { Button } from "./components/ui/Button";
import { PlusCircleIcon, Trash } from "lucide-react";
import { AddAccountingInformationDialogTrigger } from "./components/AddAccountingInformationDialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/Tabs";
import { AccountingInformationTable } from "./components/AccountingInformationTable";
import { Input } from "./components/ui/Input";
import { ResetAccountingDataConfirmationModalTrigger } from "./components/ResetAccountingDataConfirmationModal";
import { FileUploadModalTrigger } from "./components/FileUploadModal";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  Table,
  TableCell,
} from "./components/ui/Table";
import { formatCurrency } from "./lib/utils";
import { listFiles } from "./lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  FilesQueryKey,
  SearchAccountingInformationQueryKey,
} from "./lib/constants";

function App() {
  const [accountName, setAccountName] = useState("");

  const { status, data, isLoading, refetch } = useQuery({
    queryFn: () => listFiles(),
    retry: false,
    queryKey: [FilesQueryKey],
  });

  const rows = data?.files || [];
  return (
    <div className="h-full flex flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Uploaded Files</h1>
        </div>
        <div className="flex items-center space-x-2">
          <FileUploadModalTrigger>
            <Button>
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Add
            </Button>
          </FileUploadModalTrigger>
        </div>
      </div>
      <div className="flex flex-1 gap-4">
        <div className="flex flex-1 flex-col">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.name}>
                  <TableCell>{row.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

const parseFilters = (
  accountName: string,
  _baseFilters?: SearchQuery["filters"],
): SearchQuery["filters"] => {
  const baseFilters = _baseFilters ? _baseFilters : [];
  if (accountName) {
    baseFilters.push({
      field: "accountName",
      operator: "LIKE",
      value: accountName,
    });
  }

  return baseFilters;
};

export default App;
