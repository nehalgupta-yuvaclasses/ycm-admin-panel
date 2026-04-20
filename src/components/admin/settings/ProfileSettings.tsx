import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, PencilLine, Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { profileSchema, type ProfileFormValues } from "./types";

type ProfileProps = {
  profile: {
    name: string;
    fullName: string;
    email: string;
    role: string;
    bio: string;
    avatarUrl: string;
    createdAt: string;
    lastLoginAt: string;
  };
  onSave: (values: ProfileFormValues) => Promise<void>;
  onAvatarUpload: (file: File) => Promise<void>;
  isSaving: boolean;
  isUploadingAvatar: boolean;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ProfileSettings({
  profile,
  onSave,
  onAvatarUpload,
  isSaving,
  isUploadingAvatar,
}: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      bio: profile.bio || "",
    },
  });

  const initials = profile.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    form.reset({
      name: profile.name,
      bio: profile.bio || "",
    });
  }, [form, profile.name, profile.bio]);

  async function handleSubmit(values: ProfileFormValues) {
    await onSave(values);
    setIsEditing(false);
  }

  async function handleAvatarSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await onAvatarUpload(file);
    event.target.value = "";
  }

  return (
    <Card className="rounded-xl border-border/60">
      <CardHeader className="space-y-4 border-b border-border/60">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Profile</CardTitle>
            <CardDescription>Manage the admin identity shown across the platform.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2 rounded-lg"
              onClick={() => setIsEditing((value) => !value)}
            >
              {isEditing ? <X className="h-4 w-4" /> : <PencilLine className="h-4 w-4" />}
              {isEditing ? "Cancel edit" : "Edit mode"}
            </Button>
            {isEditing && (
              <Button
                type="button"
                className="h-10 gap-2 rounded-lg"
                onClick={form.handleSubmit(handleSubmit)}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save profile
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <Avatar className="h-28 w-28 rounded-full border border-border/60">
                  <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                  <AvatarFallback className="text-xl font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="absolute -right-1 -bottom-1 h-9 w-9 rounded-full border-border/60 bg-background"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </Button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                />
              </div>

              <div className="space-y-2">
                <div>
                  <div className="text-lg font-semibold">{profile.name}</div>
                  <div className="text-sm text-muted-foreground">{profile.email}</div>
                </div>
                <Badge variant="outline" className={cn("rounded-md border-border/60 px-2.5 py-1 text-xs font-medium")}>{profile.role}</Badge>
              </div>

              <div className="text-sm text-muted-foreground">
                Avatar uploads are stored in Supabase and can be reused across admin screens.
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last login</div>
                <div className="mt-2 text-sm font-medium">{formatDate(profile.lastLoginAt)}</div>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Account created</div>
                <div className="mt-2 text-sm font-medium">{formatDate(profile.createdAt)}</div>
              </div>
            </div>

            {isEditing ? (
              <Form {...form}>
                <form className="grid gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Admin name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <Input value={profile.email} readOnly className="bg-muted/30" />
                  </FormItem>

                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Input value={profile.role} readOnly className="bg-muted/30" />
                  </FormItem>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={5} placeholder="Optional admin bio" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" className="h-10 rounded-lg px-5" disabled={isSaving}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save profile
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="grid gap-4">
                <div className="rounded-xl border border-border/60 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</div>
                  <div className="mt-2 text-sm font-medium">{profile.name}</div>
                </div>
                <div className="rounded-xl border border-border/60 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bio</div>
                  <div className="mt-2 text-sm leading-6 text-muted-foreground">
                    {profile.bio || "No bio added yet."}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}