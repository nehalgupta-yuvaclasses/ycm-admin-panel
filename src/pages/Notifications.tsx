import { useState, useEffect } from "react";
import {
  Send,
  Megaphone,
  Users,
  User,
  Calendar as CalendarIcon,
  Clock,
  Trash2,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { notificationService } from "@/services/notificationService";
import { courseService, Course } from "@/services/courseService";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { PageToolbar } from "@/components/shared/page-toolbar";

type TargetType = "all" | "course" | "batch";
type NotificationStatus = "sent" | "scheduled" | "failed";

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [batches] = useState([
    { id: "b1", name: "Morning Batch - A" },
    { id: "b2", name: "Evening Batch - B" },
  ]);

  // Form State
  const [targetType, setTargetType] = useState<TargetType>("all");
  const [targetId, setTargetId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sendMode, setSendMode] = useState<"now" | "schedule">("now");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    new Date(),
  );
  const [scheduledTime, setScheduledTime] = useState("10:00");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [notifs, coursesData] = await Promise.all([
        notificationService.getNotifications(),
        courseService.getCourses(),
      ]);
      setNotifications(notifs);
      setCourses(coursesData);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await notificationService.sendNotification({
        title,
        message,
        target_type: targetType,
      });
      toast.success("Announcement sent successfully!");
      setTitle("");
      setMessage("");
      setTargetId("");
      fetchData();
    } catch (error) {
      toast.error("Failed to send notification");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this notification?"))
      return;

    try {
      await notificationService.deleteNotification(id);
      toast.success("Notification deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleResend = (n: any) => {
    setTitle(n.title);
    setMessage(n.message);
    setTargetType(n.target_type as TargetType);
    setSendMode("now");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getStatusBadge = (status: NotificationStatus | string) => {
    // Basic mapping for statuses
    const s = ["sent", "scheduled", "failed"].includes(status)
      ? (status as NotificationStatus)
      : "sent";

    switch (s) {
      case "sent":
        return (
          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20 gap-1">
            <CheckCircle2 className="h-3 w-3" /> Sent
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20 gap-1">
            <Clock className="h-3 w-3" /> Scheduled
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" /> Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">Sent</Badge>;
    }
  };

  return (
    <PageContainer className="animate-in fade-in duration-700">
      <PageHeader
        title="Student Communications"
        description="Broadcast critical updates, event news, and session links to your student community."
      />

      <PageToolbar
        actions={
          <Button variant="outline" className="h-11 gap-2 px-4" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        }
      />

      <div className="grid lg:grid-cols-5 gap-10">
        {/* Smart Composer */}
        <div className="lg:col-span-2">
          <Card className="sticky top-6 border-border/50 bg-card/30 backdrop-blur-xl shadow-2xl shadow-primary/5 rounded-[2.5rem] overflow-hidden">
            <div className="bg-primary/10 p-8 border-b border-border/40">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <Megaphone className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    Smart Composer
                  </CardTitle>
                  <CardDescription className="text-primary/70 font-medium">
                    Draft and broadcast in seconds.
                  </CardDescription>
                </div>
              </div>
            </div>

            <CardContent className="p-8 space-y-8">
              <form onSubmit={handleSend} className="space-y-6">
                <div className="grid gap-4">
                  <Label
                    htmlFor="target"
                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                  >
                    Audience Targeting
                  </Label>
                  <div className="grid grid-cols-1 gap-4">
                    <Select
                      value={targetType}
                      onValueChange={(v: TargetType) => {
                        setTargetType(v);
                        setTargetId("");
                      }}
                    >
                      <SelectTrigger
                        id="target"
                        className="h-12 rounded-2xl bg-muted/50 border-border/40 focus:ring-primary/20"
                      >
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="all">
                          All Registered Students
                        </SelectItem>
                        <SelectItem value="course">
                          Direct Course Students
                        </SelectItem>
                        <SelectItem value="batch">
                          Specific Batch Members
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <div>
                      {targetType === "course" && (
                        <div className="space-y-2 overflow-hidden">
                          <Select value={targetId} onValueChange={setTargetId}>
                            <SelectTrigger
                              id="course"
                              className="h-12 rounded-2xl bg-muted/30 border-primary/20 focus:ring-primary/20"
                            >
                              <SelectValue placeholder="Choose a course" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              {courses.map((c) => (
                                <SelectItem key={c.id} value={c.id!}>
                                  {c.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {targetType === "batch" && (
                        <div className="space-y-2 overflow-hidden">
                          <Select value={targetId} onValueChange={setTargetId}>
                            <SelectTrigger
                              id="batch"
                              className="h-12 rounded-2xl bg-muted/30 border-primary/20 focus:ring-primary/20"
                            >
                              <SelectValue placeholder="Choose a batch" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              {batches.map((b) => (
                                <SelectItem key={b.id} value={b.id}>
                                  {b.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                    >
                      Message Header
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g. 🚨 New Study Material Released!"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="h-12 px-5 rounded-2xl bg-muted/50 border-border/40 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="message"
                      className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1"
                    >
                      Core Content
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Detailed announcement details..."
                      className="min-h-[160px] p-5 rounded-2xl bg-muted/50 border-border/40 focus:ring-primary/20 resize-none leading-relaxed"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                    Delivery Schedule
                  </Label>
                  <div className="flex p-1.5 bg-muted/50 rounded-[1.25rem] border border-border/40">
                    <button
                      type="button"
                      onClick={() => setSendMode("now")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-300",
                        sendMode === "now"
                          ? "bg-background shadow-sm text-foreground"
                          : "text-muted-foreground hover:bg-background/20",
                      )}
                    >
                      <Send className="h-3.5 w-3.5" /> Instant
                    </button>
                    <button
                      type="button"
                      onClick={() => setSendMode("schedule")}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-300",
                        sendMode === "schedule"
                          ? "bg-background shadow-sm text-foreground"
                          : "text-muted-foreground hover:bg-background/20",
                      )}
                    >
                      <Clock className="h-3.5 w-3.5" /> Scheduled
                    </button>
                  </div>
                </div>

                <div>
                  {sendMode === "schedule" && (
                    <div className="p-5 bg-primary/5 rounded-3xl border border-primary/10 space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
                            Pick Date
                          </Label>
                          <Popover>
                            <PopoverTrigger
                              nativeButton={true}
                              render={
                                <button
                                  type="button"
                                  className={cn(
                                    buttonVariants({ variant: "outline" }),
                                    "w-full justify-start text-left font-semibold h-10 px-4 rounded-xl bg-background border-primary/20",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                  {scheduledDate ? (
                                    format(scheduledDate, "PPP")
                                  ) : (
                                    <span className="text-xs">Select...</span>
                                  )}
                                </button>
                              }
                            />
                            <PopoverContent
                              className="w-auto p-0 rounded-2xl shadow-2xl border-border/40"
                              align="center"
                            >
                              <Calendar
                                mode="single"
                                selected={scheduledDate}
                                onSelect={setScheduledDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="w-28 space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
                            Time
                          </Label>
                          <Input
                            type="time"
                            className="h-10 rounded-xl bg-background border-primary/20 font-mono"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-primary/90 hover:scale-[1.01] active:scale-[0.99] transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />{" "}
                      Digitizing Announcement...
                    </>
                  ) : (
                    <>
                      <Send className="mr-3 h-5 w-5" />{" "}
                      {sendMode === "now"
                        ? "Broadcast To Students"
                        : "Queue For Release"}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Announcement History */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">
                Transmission History
              </h3>
              <p className="text-sm text-muted-foreground">
                Monitoring all outgoing communications.
              </p>
            </div>
            <div className="relative w-full md:w-72 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Filter by title..."
                className="pl-10 h-10 rounded-xl bg-card border-border/50 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              {isLoading ? (
                [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-28 w-full rounded-3xl border border-border/40 p-6 flex gap-4 animate-pulse bg-muted/20"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-muted/50" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 w-1/3 bg-muted/50 rounded-full" />
                      <div className="h-3 w-1/2 bg-muted/50 rounded-full opacity-50" />
                    </div>
                  </div>
                ))
              ) : notifications.length > 0 ? (
                notifications.map((n, idx) => (
                  <div
                    key={idx}
                    className="group relative flex items-center gap-6 p-6 rounded-[2rem] border border-border/50 bg-card/30 backdrop-blur-sm transition-all hover:shadow-2xl hover:border-primary/20 hover:bg-card/40"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner">
                      {n.target_type === "all" ? (
                        <Users className="h-6 w-6" />
                      ) : (
                        <User className="h-6 w-6" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold text-lg tracking-tight truncate group-hover:text-primary transition-colors">
                          {n.title}
                        </h4>
                        {getStatusBadge(n.status || "sent")}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2 leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-full border border-border/40">
                          <Users className="h-3 w-3" />{" "}
                          {n.target_type === "all"
                            ? "Whole School"
                            : n.target_type}
                        </span>
                        <span className="flex items-center gap-1.5 italic">
                          <Clock className="h-3 w-3" />
                          {n.created_at &&
                            format(new Date(n.created_at), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResend(n)}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-destructive/5 text-destructive opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-10 rounded-[2.5rem] border-2 border-dashed bg-muted/5 text-center">
                  <div className="h-24 w-24 rounded-3xl bg-muted fill-muted flex items-center justify-center mb-6">
                    <Megaphone className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-2xl font-bold">Silent Comm-Line</h3>
                  <p className="text-muted-foreground max-w-sm mt-3 leading-relaxed">
                    Broadcasts created on this panel will appear here in
                    chronological order for your analytics.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
