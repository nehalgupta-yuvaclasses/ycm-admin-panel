import { useEffect, useRef, type ChangeEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Upload, Zap } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { platformSchema, type PlatformFormValues } from "./types";

type PlatformProps = {
  settings: {
    platformName: string;
    logoUrl: string;
    contactEmail: string;
    supportPhone: string;
    defaultLanguage: string;
    maintenanceMode: boolean;
  };
  onSave: (values: PlatformFormValues) => Promise<void>;
  onLogoUpload: (file: File) => Promise<void>;
  isSaving: boolean;
  isUploadingLogo: boolean;
};

export function PlatformSettings({
  settings,
  onSave,
  onLogoUpload,
  isSaving,
  isUploadingLogo,
}: PlatformProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PlatformFormValues>({
    resolver: zodResolver(platformSchema) as Resolver<PlatformFormValues>,
    defaultValues: {
      platformName: settings.platformName,
      contactEmail: settings.contactEmail,
      supportPhone: settings.supportPhone,
      defaultLanguage: settings.defaultLanguage,
      maintenanceMode: settings.maintenanceMode,
    },
  });

  useEffect(() => {
    form.reset({
      platformName: settings.platformName,
      contactEmail: settings.contactEmail,
      supportPhone: settings.supportPhone,
      defaultLanguage: settings.defaultLanguage,
      maintenanceMode: settings.maintenanceMode,
    });
  }, [form, settings]);

  const statusLabel = settings.maintenanceMode ? "Maintenance" : "Live";

  async function handleSubmit(values: PlatformFormValues) {
    await onSave(values);
  }

  async function handleLogoSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await onLogoUpload(file);
    event.target.value = "";
  }

  return (
    <Card className="rounded-xl border-border/60">
      <CardHeader className="space-y-4 border-b border-border/60">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Platform</CardTitle>
            <CardDescription>Configure the institution identity, contact points, and maintenance state.</CardDescription>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "rounded-md border-border/60 px-2.5 py-1 text-xs font-medium",
              settings.maintenanceMode
                ? "border-amber-500/30 bg-amber-500/10 text-amber-700"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
            )}
          >
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 p-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-background">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Platform logo" className="h-full w-full object-contain p-3" />
              ) : (
                <Zap className="h-9 w-9 text-muted-foreground" />
              )}
            </div>

            <div className="space-y-1">
              <div className="text-lg font-semibold">{settings.platformName}</div>
              <div className="text-sm text-muted-foreground">Logo and contact identity for the admin surface.</div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-10 w-full gap-2 rounded-lg"
              onClick={() => logoInputRef.current?.click()}
              disabled={isUploadingLogo}
            >
              {isUploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload logo
            </Button>
            <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={handleLogoSelect} />
          </div>
        </div>

        <Form {...form}>
          <form className="grid gap-5" onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="platformName"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Platform name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Yuva Classes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="support@yuvaclasses.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supportPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Support phone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+91 98765 43210" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default language</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                          <SelectItem value="bilingual">Bilingual</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="maintenanceMode"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-4">
                  <div className="space-y-1">
                    <FormLabel className="text-sm font-medium">Maintenance mode</FormLabel>
                    <div className="text-sm text-muted-foreground">Pause public access while you apply changes.</div>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" className="h-10 rounded-lg px-5" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save platform settings
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}