import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { debounce } from "remeda";
import { resetAccountingInformation } from "./lib/api";
import { SearchQuery } from "./lib/types";
import { Button } from "./components/ui/Button";
import { PlusCircleIcon, Trash } from "lucide-react";
import { AddAccountingInformationDialogTrigger } from "./components/AddAccountingInformationDialog";
import { SearchAccountingInformationQueryKey } from "./lib/constants";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/Tabs";
import { AccountingInformationTable } from "./components/AccountingInformationTable";
import { Input } from "./components/ui/Input";

function App() {
  const queryClient = useQueryClient();
  const [accountName, setAccountName] = useState("");
  const mutation = useMutation({
    mutationFn: resetAccountingInformation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [SearchAccountingInformationQueryKey],
      });
    },
  });
  const debouncedOnChangeAccountName = useCallback(
    debounce((e) => setAccountName(e.target.value), { waitMs: 300 }).call,
    [],
  );
  return (
    <div className="h-full flex flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Accounting Information
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => mutation.mutate()} variant="outline">
            <Trash className="mr-2 h-4 w-4" /> Reset
          </Button>
          <AddAccountingInformationDialogTrigger>
            <Button>
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Add
            </Button>
          </AddAccountingInformationDialogTrigger>
        </div>
      </div>
      <div className="flex flex-1 gap-4">
        <Tabs className="flex-1 flex flex-col" defaultValue="all">
          <div className="flex flex-row gap-5">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="sending">Sending</TabsTrigger>
              <TabsTrigger value="receiving">Receiving</TabsTrigger>
            </TabsList>
            <div className="flex flex-1 items-center space-x-2">
              <Input
                placeholder="Search by account name..."
                onChange={debouncedOnChangeAccountName}
                className="h-10 w-[150px] lg:w-[250px]"
              />
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <TabsContent
              className="data-[state=active]:flex-1 flex"
              value="all"
            >
              <AccountingInformationTable filters={parseFilters(accountName)} />
            </TabsContent>
            <TabsContent
              className="data-[state=active]:flex-1 flex"
              value="sending"
            >
              <AccountingInformationTable
                filters={parseFilters(accountName, [
                  { field: "type", operator: "EQ", value: "sending" },
                ])}
              />
            </TabsContent>
            <TabsContent
              className="data-[state=active]:flex-1 flex"
              value="receiving"
            >
              <AccountingInformationTable
                filters={parseFilters(accountName, [
                  { field: "type", operator: "EQ", value: "receiving" },
                ])}
              />
            </TabsContent>
          </div>
        </Tabs>
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
