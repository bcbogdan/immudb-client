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
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* @ts-expect-error */}
              {rows.map((row) => (
                <TableRow key={row.path}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.mimeType}</TableCell>
                  <TableCell>{formatFileSize(row.size)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number) {
  const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  if (bytes === 0) return "0 B";

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = parseFloat((bytes / Math.pow(1024, i)).toFixed(2));

  return `${size} ${units[i]}`;
}

export default App;
