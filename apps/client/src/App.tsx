import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { addAccountingInformation, getAccountingInformation } from "./lib/api";
import { AccountingInformation, SearchQuery } from "./lib/types";
import { Button } from "./components/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/Table";
import { Plus, PlusCircleIcon, Trash } from "lucide-react";
import { Input } from "./components/Input";
import { Popover, PopoverContent, PopoverTrigger } from "./components/Popover";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "./components/Dialog";
import { Label } from "./components/Label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/Select";

const SearchAccountingInformationQueryKey = "accountingInformation";
function App() {
  const [query, setQuery] = useState<SearchQuery>({
    pagination: { page: 1, limit: 10 },
  });
  const { status, data, error } = useQuery({
    queryFn: () => getAccountingInformation(query),
    queryKey: [SearchAccountingInformationQueryKey],
    initialData: { count: 0, rows: [] },
    placeholderData: keepPreviousData,
  });

  console.log(data, status, error);
  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Accounting Information
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="destructive">
            <Trash className="mr-2 h-4 w-4" /> Reset
          </Button>
          <AddAccountingInformationDialogTrigger>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </AddAccountingInformationDialogTrigger>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Search by account name..."
              value=""
              onChange={console.log}
              className="h-8 w-[150px] lg:w-[250px]"
            />
            <TextFilterPil />
          </div>
        </div>
        <div className="flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Number</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>IBAN</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((row) => (
                <TableRow key={row.accountNumber}>
                  <TableCell>{row.accountNumber}</TableCell>
                  <TableCell>{row.accountName}</TableCell>
                  <TableCell>{row.iban}</TableCell>
                  <TableCell>{row.address}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

const TextFilterPil = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          IBAN
        </Button>
      </PopoverTrigger>
      <PopoverContent>asdasdsa</PopoverContent>
    </Popover>
  );
};

const NumberFilterPil = () => {};

const AddAccountingInformationDialogTrigger = ({ children }) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutateAsync, status, error } = useMutation({
    mutationFn: (accountingInformation: AccountingInformation) => {
      return addAccountingInformation(accountingInformation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [SearchAccountingInformationQueryKey],
      });
    },
  });
  const onSubmit = useCallback(async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const accountingInformation = {} as AccountingInformation;
    for (let [name, value] of formData.entries()) {
      if (name === "amount") {
        // @ts-expect-error
        accountingInformation[name] = parseFloat(value);
      } else {
        // @ts-expect-error
        accountingInformation[name] = value;
      }
    }
    console.log(accountingInformation);
    const result = await mutateAsync(accountingInformation);
    if (!("error" in result)) {
      setIsModalOpen(false);
    }
  }, []);
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Add Accounting Information</DialogTitle>
            <DialogDescription>
              Fill in the required fields and submit the form.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col my-8 gap-4">
            <div className="flex flex-row gap-5 flex-1">
              <div className="flex flex-1 flex-col gap-2 align-start">
                <Label htmlFor="name" className="text-muted-foreground">
                  Account Number
                </Label>
                <Input name="accountNumber" className="col-span-3" required />
              </div>
              <div className="flex flex-1 flex-col gap-2 align-start">
                <Label htmlFor="username" className="text-muted-foreground">
                  Account Name
                </Label>
                <Input name="accountName" className="col-span-3" required />
              </div>
            </div>

            <div className="flex flex-row gap-5 flex-1">
              <div className="flex flex-1 flex-col gap-2 align-start">
                <Label htmlFor="name" className="text-muted-foreground">
                  IBAN
                </Label>
                <Input name="iban" className="col-span-3" required />
              </div>
            </div>
            <div className="flex flex-row gap-5 flex-1">
              <div className="flex flex-1 flex-col gap-2 align-start">
                <Label htmlFor="name" className="text-muted-foreground">
                  Address
                </Label>
                <Input name="address" className="col-span-3" required />
              </div>
            </div>
            <div className="flex flex-row gap-5 flex-1">
              <div className="flex flex-1 flex-col gap-2 align-start">
                <Label htmlFor="name" className="text-muted-foreground">
                  Type
                </Label>
                <Select name="type" defaultValue="sending">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sending">Sending</SelectItem>
                    <SelectItem value="receiving">Receiving</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-1 flex-col gap-2 align-start">
                <Label htmlFor="username" className="text-muted-foreground">
                  Amount
                </Label>
                <Input
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="col-span-3"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default App;
