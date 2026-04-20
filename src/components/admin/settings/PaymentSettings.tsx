import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { paymentSchema, type PaymentFormValues } from "./types";

type PaymentProps = {
  settings: {
    provider: "razorpay" | "stripe";
    apiKey: string;
    apiSecret?: string;
    currency: string;
    gstRate: number;
    enablePayments: boolean;
  };
  onSave: (values: PaymentFormValues) => Promise<void>;
  isSaving: boolean;
};

export function PaymentSettings({ settings, onSave, isSaving }: PaymentProps) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as Resolver<PaymentFormValues>,
    defaultValues: {
      provider: settings.provider,
      apiKey: settings.apiKey,
      apiSecret: settings.apiSecret || "",
      currency: settings.currency,
      gstRate: settings.gstRate,
      enablePayments: settings.enablePayments,
    },
  });

  useEffect(() => {
    form.reset({
      provider: settings.provider,
      apiKey: settings.apiKey,
      apiSecret: settings.apiSecret || "",
      currency: settings.currency,
      gstRate: settings.gstRate,
      enablePayments: settings.enablePayments,
    });
  }, [form, settings]);

  async function handleSubmit(values: PaymentFormValues) {
    await onSave(values);
  }

  return (
    <Card className="rounded-xl border-border/60">
      <CardHeader className="space-y-4 border-b border-border/60">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Payments</CardTitle>
            <CardDescription>Set the gateway, secret credentials, and billing defaults.</CardDescription>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "rounded-md border-border/60 px-2.5 py-1 text-xs font-medium",
              settings.enablePayments
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                : "border-amber-500/30 bg-amber-500/10 text-amber-700"
            )}
          >
            {settings.enablePayments ? "Payments enabled" : "Payments disabled"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        <Form {...form}>
          <form className="grid gap-5" onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment provider</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="razorpay">Razorpay</SelectItem>
                          <SelectItem value="stripe">Stripe</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">INR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>API key</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" autoComplete="off" placeholder="Enter public API key" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiSecret"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>API secret</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" autoComplete="off" placeholder="Leave blank to keep the current server secret" />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Secret values are handled server-side and are never reloaded into the browser.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gstRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST rate</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min={0} max={100} step="0.1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enablePayments"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-4 md:col-span-2">
                    <div className="space-y-1">
                      <FormLabel className="text-sm font-medium">Enable payments</FormLabel>
                      <div className="text-sm text-muted-foreground">Turn the checkout layer on or off without touching keys.</div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              Store the public key here and keep the secret blank unless you are rotating credentials. The backend function persists secrets without exposing them back to the UI.
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="h-10 rounded-lg px-5" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save payment settings
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}