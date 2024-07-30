import { addAccountingInformation, uploadFile } from "@/lib/api";
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
import {
  FilesQueryKey,
  SearchAccountingInformationQueryKey,
} from "@/lib/constants";

export const FileUploadModalTrigger = ({
  children,
}: React.PropsWithChildren<{}>) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (file) => {
      return uploadFile(file);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [FilesQueryKey],
      }),
  });
  const onChange = useCallback(async (e) => {
    const { files } = e.target;
    if (!files || files.length === 0) {
      return;
    }
    const file = files[0];
    try {
      const result = await mutateAsync(file);
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  }, []);
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col my-8 gap-4">
            <input onChange={onChange} type="file" />
          </div>
          <DialogFooter>
            {error && (
              <span className="text-destructive">Unable to upload file</span>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
