import { addAccountingInformation } from "@/lib/api";
import { AccountingInformation } from "@/lib/types";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/Dialog";
import { Label } from "./ui/Label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/Select";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { Button } from "./ui/Button";
import { DialogHeader, DialogFooter } from "./ui/Dialog";
import { Input } from "./ui/Input";
import { SearchAccountingInformationQueryKey } from "@/lib/constants";

export const AddAccountingInformationDialogTrigger = ({
  children,
}: React.PropsWithChildren<{}>) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutateAsync, status } = useMutation({
    mutationFn: (accountingInformation: AccountingInformation) => {
      return addAccountingInformation(accountingInformation);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [SearchAccountingInformationQueryKey],
      }),
  });
  const onSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
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
            {status === "error" && (
              <span className="text-destructive">
                Unable to add accounting information.
              </span>
            )}
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
