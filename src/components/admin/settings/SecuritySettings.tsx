import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock3, Loader2, LogOut, Shield, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { passwordSchema, type PasswordFormValues, type SettingsActivityLog, type SettingsSession } from "./types";

type SecurityProps = {
  profile: {
    name: string;
    email: string;
    lastLoginAt: string;
    createdAt: string;
  };
  sessions: SettingsSession[];
  activityLogs: SettingsActivityLog[];
  onChangePassword: (values: PasswordFormValues) => Promise<void>;
  onLogoutAllDevices: () => Promise<void>;
  isChangingPassword: boolean;
  isLoggingOutAll: boolean;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function SecuritySettings({
  profile,
  sessions,
  activityLogs,
  onChangePassword,
  onLogoutAllDevices,
  isChangingPassword,
  isLoggingOutAll,
}: SecurityProps) {
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    form.reset({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }, [form]);

  async function handleSubmit(values: PasswordFormValues) {
    await onChangePassword(values);
    form.reset({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }

  return (
    <div className="grid gap-6">
      <Card className="rounded-xl border-border/60">
        <CardHeader className="space-y-4 border-b border-border/60">
          <div>
            <CardTitle className="text-xl font-semibold">Security</CardTitle>
            <CardDescription>Manage password changes, active sessions, and recent admin activity.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Admin</div>
              <div className="mt-2 text-sm font-medium">{profile.name}</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</div>
              <div className="mt-2 text-sm font-medium">{profile.email}</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last login</div>
              <div className="mt-2 text-sm font-medium">{formatDate(profile.lastLoginAt)}</div>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Created</div>
              <div className="mt-2 text-sm font-medium">{formatDate(profile.createdAt)}</div>
            </div>
          </div>

          <Separator />

          <Form {...form}>
            <form className="grid gap-5" onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">Change password</div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Current password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" autoComplete="current-password" placeholder="Current password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" autoComplete="new-password" placeholder="At least 8 characters" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" autoComplete="new-password" placeholder="Repeat the new password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="h-10 rounded-lg px-5" disabled={isChangingPassword}>
                  {isChangingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Update password
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/60">
        <CardHeader className="space-y-4 border-b border-border/60">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl font-semibold">Active sessions</CardTitle>
              <CardDescription>Devices currently signed in with the admin account.</CardDescription>
            </div>
            <Button
              type="button"
              variant="destructive"
              className="h-10 gap-2 rounded-lg"
              onClick={onLogoutAllDevices}
              disabled={isLoggingOutAll}
            >
              {isLoggingOutAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              Logout all devices
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">{session.title}</div>
                    {session.current && (
                      <Badge variant="outline" className="rounded-md border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-700">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{session.device}</div>
                  <div className="text-xs text-muted-foreground">{session.location}</div>
                </div>
                <div className="text-sm text-muted-foreground">Last active {formatDate(session.lastActive)}</div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
              Active sessions are not currently available from the client-side auth API.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/60">
        <CardHeader className="space-y-1 border-b border-border/60">
          <CardTitle className="text-xl font-semibold">Access logs</CardTitle>
          <CardDescription>Recent settings actions captured in this session.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          {activityLogs.length > 0 ? (
            activityLogs.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-4">
                <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="text-sm font-medium">{entry.title}</div>
                  <div className="text-sm text-muted-foreground">{entry.detail}</div>
                </div>
                <div className="text-xs text-muted-foreground">{formatDate(entry.timestamp)}</div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
              No admin actions recorded yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}