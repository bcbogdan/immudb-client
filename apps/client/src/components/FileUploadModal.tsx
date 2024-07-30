import { uploadFile } from "@/lib/api";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import { FilesQueryKey } from "@/lib/constants";
import { Slot } from "@radix-ui/react-slot";

export const FileUploadModalTrigger = ({
  children,
}: React.PropsWithChildren<{}>) => {
  const queryClient = useQueryClient();
  const ref = useRef<HTMLInputElement>(null);
  const { mutateAsync } = useMutation({
    mutationFn: (file) => {
      // @ts-expect-error
      return uploadFile(file);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [FilesQueryKey],
      }),
  });
  // @ts-expect-error
  const onChange = useCallback(async (e) => {
    const { files } = e.target;
    if (!files || files.length === 0) {
      return;
    }
    const file = files[0];
    try {
      await mutateAsync(file);
    } catch (error) {
      console.error(error);
    }
  }, []);
  const onClick = useCallback(() => {
    if (!ref.current) return;
    ref.current.click();
  }, []);

  return (
    <>
      <input onChange={onChange} ref={ref} type="file" hidden />
      <Slot onClick={onClick}>{children}</Slot>
    </>
  );
};
