import { Button } from "./components/ui/Button";
import { UploadIcon } from "lucide-react";
import { FileUploadModalTrigger } from "./components/FileUploadModal";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  Table,
  TableCell,
} from "./components/ui/Table";
import { listFiles } from "./lib/api";
import { useQuery } from "@tanstack/react-query";
import { FilesQueryKey } from "./lib/constants";

function App() {
  const { data } = useQuery({
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
              <UploadIcon className="mr-2 h-4 w-4" />
              Upload
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
              {/* @ts-expect-error */}
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

export default App;
