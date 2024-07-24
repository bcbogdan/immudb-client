import { resetAccountingInformation } from "@/lib/api";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/Dialog";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { Button } from "./ui/Button";
import { DialogHeader, DialogFooter } from "./ui/Dialog";
import { SearchAccountingInformationQueryKey } from "@/lib/constants";

export const ResetAccountingDataConfirmationModalTrigger = ({
  children,
}: React.PropsWithChildren<{}>) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mutation = useMutation({
    mutationFn: resetAccountingInformation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [SearchAccountingInformationQueryKey],
      });
    },
  });
  const onSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await mutation.mutateAsync();
    } catch (error) {
      console.log(error);
    }
    setIsModalOpen(false);
  }, []);
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Reset Accounting Information</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset the accounting information? This
              will delete all the current data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={mutation.isPending}
              type="submit"
              onClick={() => onSubmit}
            >
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
