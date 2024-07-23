import {
  TableHeader,
  TableRow,
  Table,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/Table";
import { SearchQuery } from "@/lib/types";
import { useMemo, useCallback, useState } from "react";
import { getAccountingInformation } from "@/lib/api";
import { SearchAccountingInformationQueryKey } from "@/lib/constants";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Button } from "./ui/Button";
import { AddAccountingInformationDialogTrigger } from "./AddAccountingInformationDialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
} from "./ui/Pagination";
import { formatCurrency } from "@/lib/utils";

export const AccountingInformationTable = ({
  filters,
}: {
  filters?: SearchQuery["filters"];
}) => {
  const [pagination, setPagination] = useState<SearchQuery["pagination"]>({
    page: 1,
    // limit: 20,
    limit: 10,
  });
  const query = useMemo(() => {
    const searchQuery: SearchQuery = { pagination };
    if (filters) {
      searchQuery.filters = filters;
    }
    return searchQuery;
  }, [pagination, filters]);

  const { status, data, isLoading, refetch } = useQuery({
    queryFn: () => getAccountingInformation(query),
    queryKey: [
      SearchAccountingInformationQueryKey,
      `${SearchAccountingInformationQueryKey}-${JSON.stringify(query)}`,
    ],
    initialData: { count: 0, rows: [] },
    placeholderData: keepPreviousData,
  });
  return (
    <div className="flex flex-1 flex-col">
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
          {status !== "error" && data.rows.length
            ? data.rows.map((row) => (
                <TableRow key={row.accountNumber}>
                  <TableCell>{row.accountNumber}</TableCell>
                  <TableCell className="overflow-hidden max-w-20 whitespace-nowrap overflow-ellipsis">
                    {row.accountName}
                  </TableCell>
                  <TableCell className="overflow-hidden max-w-20 whitespace-nowrap overflow-ellipsis">
                    {row.iban}
                  </TableCell>
                  <TableCell className="overflow-hidden max-w-20 whitespace-nowrap overflow-ellipsis">
                    {row.address}
                  </TableCell>
                  <TableCell className="uppercase">{row.type}</TableCell>
                  <TableCell>{formatCurrency(row.amount)}</TableCell>
                </TableRow>
              ))
            : null}
        </TableBody>
      </Table>
      {status === "error" ? (
        <div className="flex flex-1 min-h-[50vh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Oops, something went wrong!
            </h2>
            <p className="mt-4 text-muted-foreground">
              We're sorry, but there was an error fetching the data for this
              table. Please try again later or contact support if the issue
              persists.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => refetch()}
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      {status !== "error" &&
      !isLoading &&
      !query?.filters &&
      !query?.filters?.length &&
      !data.rows.length ? (
        <div className="flex flex-1 min-h-[50vh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              No data available
            </h2>
            <p className="mt-4 text-muted-foreground">
              Start by adding some accounting information in order to populate
              the table.
            </p>
            <div className="mt-6">
              <AddAccountingInformationDialogTrigger>
                <Button className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  Add Accounting Information
                </Button>
              </AddAccountingInformationDialogTrigger>
            </div>
          </div>
        </div>
      ) : null}
      {status !== "error" ? (
        <div className="mt-auto align-center flex flex-row justify-between">
          <span className="text-muted-foreground flex items-center">
            {data.count < pagination.limit
              ? `Showing ${data.count} rows`
              : `Showing ${pagination.limit} out of ${data.count} rows`}
          </span>
          <TablePagination
            onChangePagination={setPagination}
            page={pagination.page}
            limit={pagination.limit}
            count={data.count}
          />
        </div>
      ) : null}
    </div>
  );
};

const TablePagination = ({
  onChangePagination,
  page,
  limit,
  count,
}: {
  onChangePagination: (pagination: SearchQuery["pagination"]) => void;
  page: number;
  limit: number;
  count: number;
}) => {
  const hasNextPage = useMemo(() => {
    return page * limit < count;
  }, [page, limit, count]);
  const hasPreviousPage = useMemo(() => {
    return page > 1;
  }, [page]);

  const onChangePage = useCallback(
    (page: number) => {
      onChangePagination({ page, limit });
    },
    [onChangePagination],
  );
  return (
    <Pagination>
      <PaginationContent>
        {hasPreviousPage && (
          <PaginationItem>
            <PaginationPrevious onClick={() => onChangePage(page - 1)} />
          </PaginationItem>
        )}
        {hasNextPage && (
          <PaginationItem>
            <PaginationNext onClick={() => onChangePage(page + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};
