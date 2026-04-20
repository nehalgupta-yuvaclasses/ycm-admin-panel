import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  Download,
  Filter,
  MoreHorizontal,
  Search,
  XCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { testService, type ResolvedAttempt } from "@/services/testService";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

type AttemptFilter = "all" | "completed" | "failed" | "ongoing";

const STATUS_FILTERS: Array<{ label: string; value: AttemptFilter }> = [
  { label: "All", value: "all" },
  { label: "Passed", value: "completed" },
  { label: "Failed", value: "failed" },
  { label: "In Progress", value: "ongoing" },
];

export default function TestAttempts() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<ResolvedAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AttemptFilter>("all");

  useEffect(() => {
    if (!testId) {
      setAttempts([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadAttempts = async () => {
      setIsLoading(true);
      try {
        const data = (await testService.getAttempts(testId)) as ResolvedAttempt[];
        if (isMounted) {
          setAttempts(data);
        }
      } catch (error) {
        console.error("Failed to load attempts:", error);
        if (isMounted) {
          setAttempts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAttempts();

    const channel = supabase
      .channel(`admin-test-attempts-${testId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attempts", filter: `test_id=eq.${testId}` },
        () => {
          void loadAttempts();
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      void supabase.removeChannel(channel);
    };
  }, [testId]);

  const visibleAttempts = useMemo(() => {
    return attempts.filter((attempt) => {
      const matchesSearch = (attempt.student_name || "Unknown Student")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || attempt.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [attempts, searchQuery, statusFilter]);

  const completedAttempts = attempts.filter((attempt) => attempt.status !== "ongoing");
  const totalAttempts = attempts.length;
  const averageScore =
    completedAttempts.length > 0
      ? completedAttempts.reduce((accumulator, attempt) => accumulator + attempt.score, 0) / completedAttempts.length
      : 0;
  const passRate =
    completedAttempts.length > 0
      ? (completedAttempts.filter((attempt) => attempt.status === "completed").length / completedAttempts.length) * 100
      : 0;

  const getStatusBadge = (status: ResolvedAttempt["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Passed
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" /> Failed
          </Badge>
        );
      case "ongoing":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" /> In Progress
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <PageContainer className="animate-in fade-in duration-500">
      <PageHeader title="Test Attempts" description={`Live results for Test ID: ${testId ?? "unknown"}`}>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" /> Export Results
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 bg-card shadow-sm">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Total Attempts</div>
            <div className="mt-3 text-3xl font-bold tracking-tight">{isLoading ? "..." : totalAttempts}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card shadow-sm">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Average Score</div>
            <div className="mt-3 text-3xl font-bold tracking-tight">{isLoading ? "..." : `${averageScore.toFixed(1)}%`}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card shadow-sm">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Pass Rate</div>
            <div className="mt-3 text-3xl font-bold tracking-tight">{isLoading ? "..." : `${passRate.toFixed(0)}%`}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-card shadow-sm">
        <CardContent className="space-y-5 p-4 md:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search students..."
                className="h-11 pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" /> Filter
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setStatusFilter("all")} className={cn(statusFilter === "all" && "bg-muted")}>
                All
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setStatusFilter("completed")} className={cn(statusFilter === "completed" && "bg-muted")}>
                Passed
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setStatusFilter("failed")} className={cn(statusFilter === "failed" && "bg-muted")}>
                Failed
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setStatusFilter("ongoing")} className={cn(statusFilter === "ongoing" && "bg-muted")}>
                In Progress
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
              Loading live attempts...
            </div>
          ) : visibleAttempts.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No attempts found"
              description={
                searchQuery || statusFilter !== "all"
                  ? "Try a different search term or clear the active filter."
                  : "No one has started this test yet. Attempts will appear here in real time."
              }
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-border/60">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleAttempts.map((attempt) => (
                    <TableRow key={attempt.id} className="h-14 hover:bg-muted/30">
                      <TableCell className="font-medium">{attempt.student_name || "Unknown Student"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {attempt.status === "ongoing" ? "—" : attempt.score}
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "font-semibold",
                          attempt.score >= 70 ? "text-emerald-600" : attempt.score > 0 ? "text-red-600" : "",
                        )}>
                          {attempt.status === "ongoing" ? "In progress" : `${attempt.score}%`}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(attempt.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {attempt.status === "ongoing" ? "Started recently" : new Date(attempt.submitted_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            nativeButton={true}
                            render={
                              <button className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8") }>
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            }
                          />
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Full Response</DropdownMenuItem>
                            <DropdownMenuItem>Re-evaluate</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Invalidate Attempt</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
