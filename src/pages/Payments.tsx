import { useState, useEffect, useMemo } from "react";
import {
  Download,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";

import { paymentService } from "@/services/paymentService";
import { RefundDialog } from "@/features/payments/components/RefundDialog";

interface Transaction {
  id: string;
  student_id: string;
  course_id: string;
  amount: number;
  status: string;
  method: string;
  created_at: string;
  students?: { name: string; email: string };
  courses?: { title: string };
}

export default function Payments() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Refund dialog state
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [refundTransaction, setRefundTransaction] = useState<Transaction | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const payments = await paymentService.getPayments();
      // @ts-ignore
      setData(payments);
    } catch (error) {
      toast.error("Failed to fetch payments");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((txn) => {
      const studentName = (txn as any).student_id || "";
      const studentEmail = "";
      const matchesSearch =
        studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        studentEmail.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        txn.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesCourse =
        courseFilter === "all" || txn.course_id === courseFilter;

      return (matchesSearch || !searchQuery) && matchesStatus && matchesCourse;
    });
  }, [data, searchQuery, statusFilter, courseFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await paymentService.updatePaymentStatus(id, newStatus);
      toast.success(`Transaction status updated to ${newStatus}`);
      fetchPayments();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleRefundConfirm = async () => {
    if (!refundTransaction) return;
    setIsRefunding(true);
    try {
      await paymentService.updatePaymentStatus(refundTransaction.id, "refunded");
      toast.success("Refund processed successfully");
      setIsRefundOpen(false);
      fetchPayments();
    } catch (error) {
      toast.error("Failed to process refund");
    } finally {
      setIsRefunding(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      "Order ID",
      "Student",
      "Email",
      "Course",
      "Amount",
      "Status",
      "Method",
      "Date",
    ];
    const rows = filteredData.map((txn) => [
      txn.id,
      txn.students?.name || "N/A",
      txn.students?.email || "N/A",
      txn.courses?.title || "N/A",
      txn.amount,
      txn.status,
      txn.method,
      new Date(txn.created_at).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `transactions_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported successfully");
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "successful":
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
            Successful
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20"
          >
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="destructive"
            className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
          >
            Failed
          </Badge>
        );
      case "refunded":
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20"
          >
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Payments & Transactions"
        description="Monitor and manage all financial transactions on the platform."
      >
        <Button variant="outline" onClick={exportCSV} className="h-11 gap-2 px-4">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </PageHeader>

      <PageToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by ID, name, or email..."
        actions={
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger
              nativeButton={true}
              render={
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Filter className="h-4 w-4" />
                </Button>
              }
            />
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Transactions</SheetTitle>
                <SheetDescription>
                  Narrow down the transaction list by status or course.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="successful">Successful</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Select value={courseFilter} onValueChange={setCourseFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      <SelectItem value="C1">Complete Web Development</SelectItem>
                      <SelectItem value="C2">Advanced Python Mastery</SelectItem>
                      <SelectItem value="C3">UI/UX Design Fundamentals</SelectItem>
                      <SelectItem value="C4">Mobile App Dev with Flutter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SheetFooter>
                <Button className="w-full" onClick={() => setIsFilterOpen(false)}>
                  Apply Filters
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        }
      />

      <DataTable
        columns={[
          {
            header: "Transaction ID",
            className: "font-mono text-xs font-medium",
            cell: (txn: Transaction) => txn.id.slice(0, 8),
          },
          {
            header: "Student",
            cell: (txn: Transaction) => (
              <div className="flex flex-col">
                <span className="font-medium">{txn.students?.name || "N/A"}</span>
                <span className="text-xs text-muted-foreground">{txn.students?.email || "N/A"}</span>
              </div>
            ),
          },
          {
            header: "Course",
            className: "max-w-[200px] truncate",
            cell: (txn: Transaction) => txn.courses?.title || "N/A",
          },
          {
            header: "Amount",
            className: "font-semibold",
            cell: (txn: Transaction) => `₹${txn.amount.toLocaleString()}`,
          },
          {
            header: "Date",
            className: "text-sm text-muted-foreground",
            cell: (txn: Transaction) =>
              new Date(txn.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
          },
          {
            header: "Status",
            cell: (txn: Transaction) => getStatusBadge(txn.status),
          },
          {
            header: "Method",
            className: "text-muted-foreground text-xs uppercase font-medium",
            cell: (txn: Transaction) => txn.method,
          },
          {
            header: "Actions",
            className: "text-right",
            cell: (txn: Transaction) => (
              <DropdownMenu>
                <DropdownMenuTrigger
                  nativeButton={true}
                  render={
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedTransaction(txn);
                        setIsDetailOpen(true);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" /> View Details
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  {txn.status === "pending" && (
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => handleStatusChange(txn.id, "successful")}>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Mark Successful
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(txn.id, "failed")}>
                        <XCircle className="mr-2 h-4 w-4 text-red-500" /> Mark Failed
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  )}
                  {txn.status === "successful" && (
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        setRefundTransaction(txn);
                        setIsRefundOpen(true);
                      }}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" /> Refund
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
        data={filteredData}
        isLoading={isLoading}
        emptyState={
          <EmptyState
            icon={Download}
            title="No transactions found"
            description="Payments will appear here once students begin purchasing courses."
          />
        }
      />

      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Transaction Details</SheetTitle>
            <SheetDescription>
              Full information for transaction {selectedTransaction?.id}
            </SheetDescription>
          </SheetHeader>
          {selectedTransaction && (
            <div className="space-y-6 py-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Status
                  </p>
                  {getStatusBadge(selectedTransaction.status)}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Amount
                  </p>
                  <p className="text-lg font-bold">
                    ₹{selectedTransaction.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="h-px bg-border w-full" />

              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Student Information</h4>
                <div className="grid gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">
                      {selectedTransaction.students?.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">
                      {selectedTransaction.students?.email}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Student ID</span>
                    <span className="font-mono text-xs">
                      {selectedTransaction.student_id}
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border w-full" />

              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Course Information</h4>
                <div className="grid gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Course Name</span>
                    <span className="font-medium">
                      {selectedTransaction.courses?.title}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Course ID</span>
                    <span className="font-mono text-xs">
                      {selectedTransaction.course_id}
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border w-full" />

              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Payment Details</h4>
                <div className="grid gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Method</span>
                    <span className="font-medium uppercase">
                      {selectedTransaction.method}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date & Time</span>
                    <span className="font-medium">
                      {new Date(selectedTransaction.created_at).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Transaction ID
                    </span>
                    <span className="font-mono text-xs">
                      {selectedTransaction.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <SheetFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsDetailOpen(false)}
            >
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <RefundDialog
        open={isRefundOpen}
        onOpenChange={setIsRefundOpen}
        onConfirm={handleRefundConfirm}
        isSubmitting={isRefunding}
        amount={refundTransaction?.amount || 0}
        studentName={refundTransaction?.students?.name || ""}
      />

    </PageContainer>
  );
}
