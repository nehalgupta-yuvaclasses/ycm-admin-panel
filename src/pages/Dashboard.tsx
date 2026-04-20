import * as React from "react";
import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { studentService } from "@/services/studentService";
import { courseService } from "@/services/courseService";
import { paymentService } from "@/services/paymentService";
import { dashboardService } from "@/services/dashboardService";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

// --- Components ---

const EnrollmentChart = ({ data }: { data: number[] }) => {
  const maxValue = Math.max(...data, 5);
  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - (val / maxValue) * 80,
  }));

  const pathData = React.useMemo(() => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 2;
      const cp2x = curr.x + (next.x - curr.x) / 2;
      d += ` C ${cp1x} ${curr.y}, ${cp2x} ${next.y}, ${next.x} ${next.y}`;
    }
    return d;
  }, [points]);

  const areaData = `${pathData} L 100 100 L 0 100 Z`;

  return (
    <div className="w-full h-full relative group">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="hsl(var(--primary))"
              stopOpacity="0.2"
            />
            <stop
              offset="100%"
              stopColor="hsl(var(--primary))"
              stopOpacity="0.01"
            />
          </linearGradient>
        </defs>

        <path d={areaData} fill="url(#chartGradient)" />

        <path
          d={pathData}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="absolute inset-x-0 bottom-0 flex justify-between px-2 text-[10px] text-muted-foreground font-mono opacity-50">
        <span>30d ago</span>
        <span>Today</span>
      </div>
    </div>
  );
};

// StatCard component definition

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  color,
  trend,
  delay,
}: any) => (
  <div>
    <Card className="overflow-hidden border-border/50 relative">
      <div
        className={cn(
          "absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-[0.03] rounded-full blur-2xl transition-all duration-500",
          color.split(" ")[0].replace("text-", "bg-"),
        )}
      />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground transition-colors">
          {title}
        </CardTitle>
        <div
          className={cn(
            "p-2 rounded-xl transition-colors duration-300",
            color.replace("text-", "bg-") + "/10",
            color,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          {trend !== undefined && (
            <div
              className={cn(
                "flex items-center text-[10px] font-bold",
                trend > 0 ? "text-emerald-500" : "text-rose-500",
              )}
            >
              {trend > 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          {description}
        </p>
      </CardContent>
    </Card>
  </div>
);

// --- Main Page ---

export default function Dashboard() {
  const [statsData, setStatsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollmentTrend, setEnrollmentTrend] = useState<number[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      const safeFetch = async (promise: Promise<any>, fallback: any = []) => {
        try {
          return await promise;
        } catch (err) {
          console.error("Dashboard partial fetch failed:", err);
          return fallback;
        }
      };

      const [students, courses, payments, trend, activity] = await Promise.all([
        safeFetch(studentService.getStudents()),
        safeFetch(courseService.getCourses()),
        safeFetch(paymentService.getPayments()),
        safeFetch(dashboardService.getEnrollmentTrend(), [0, 0, 0, 0, 0]),
        safeFetch(dashboardService.getRecentActivity()),
      ]);

      const successfulPayments = payments.filter(
        (p: any) => p.status === "success",
      );
      const totalRevenue = successfulPayments.reduce(
        (acc: any, curr: any) => acc + (Number(curr.amount) || 0),
        0,
      );
      const activeCourses = courses.filter(
        (c: any) => c.status === "Published",
      ).length;
      const totalStudents = students.length;

      setEnrollmentTrend(trend);
      setRecentActivity(activity);

      setStatsData([
        {
          title: "Total Students",
          value: totalStudents.toLocaleString(),
          description: "Live student account count",
          icon: Users,
          color: "text-blue-600",
          delay: 0.1,
        },
        {
          title: "Published Courses",
          value: activeCourses.toString(),
          description: "Courses visible to students",
          icon: BookOpen,
          color: "text-emerald-600",
          delay: 0.2,
        },
        {
          title: "Total Revenue",
          value: formatCurrency(totalRevenue),
          description: "Collected from successful payments",
          icon: TrendingUp,
          color: "text-violet-600",
          delay: 0.3,
        },
        {
          title: "Success Payments",
          value: successfulPayments.length.toString(),
          description: "Total completed transactions",
          icon: Activity,
          color: "text-orange-600",
          delay: 0.4,
        },
      ]);
    } catch (error) {
      console.error("Dashboard critical error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card
                key={i}
                className="border-border/50 shadow-sm overflow-hidden"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-8 w-8 rounded-xl" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-[80px] mb-2" />
                  <Skeleton className="h-3 w-[120px]" />
                </CardContent>
              </Card>
            ))
          : statsData.map((stat) => <StatCard key={stat.title} {...stat} />)}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-border/50 shadow-md bg-card/30 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">
                  Enrollment Trends
                </CardTitle>
                <CardDescription>
                  Visual distribution of student sign-ups over the last 30 days.
                </CardDescription>
              </div>
              <div className="bg-primary/5 px-3 py-1 rounded-full text-[10px] font-bold text-primary border border-primary/10">
                LIVE METRICS
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[320px] pt-10 pb-6">
            {isLoading ? (
              <Skeleton className="w-full h-full rounded-2xl" />
            ) : (
              <EnrollmentChart data={enrollmentTrend} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-border/50 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
            <CardDescription>
              Real-time monitoring of system transactions and enrollments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="ml-4 space-y-2">
                      <Skeleton className="h-4 w-[180px]" />
                      <Skeleton className="h-3 w-[80px]" />
                    </div>
                  </div>
                ))
              ) : recentActivity.length > 0 ? (
                recentActivity.map((item, i) => (
                  <div
                    key={item.id}
                    className="flex items-center group cursor-pointer"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary/10 transition-colors">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium leading-none">
                        <span className="font-bold text-foreground">
                          {item.user}
                        </span>
                        <span className="mx-1 text-muted-foreground">
                          {item.action}
                        </span>
                        <span className="text-primary font-bold">
                          {item.target}
                        </span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-wider">
                        {formatDistanceToNow(new Date(item.time), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground italic">
                  No recent activity detected.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
