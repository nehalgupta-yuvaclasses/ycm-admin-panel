import { useCallback, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Upload, 
  X, 
  Globe, 
  Search, 
  Tag, 
  FileText, 
  Image as ImageIcon, 
  Settings2,
  Share2,
  ChevronDown,
  Layout
} from "lucide-react";
import type { BlogFormData } from "@/features/blogs/types";
import { blogService } from "@/services/blogService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface BlogSidebarProps {
  formData: BlogFormData;
  onChange: (updates: Partial<BlogFormData>) => void;
  isNew: boolean;
}

function SidebarSection({
  icon: Icon,
  label,
  children,
  defaultOpen = true,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/40 last:border-0 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-5 py-4 hover:bg-muted/30 transition-colors group"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-muted/50 text-muted-foreground group-hover:text-foreground transition-colors">
            <Icon className="h-3.5 w-3.5" />
          </div>
          <span className="text-[13px] font-semibold tracking-tight">{label}</span>
        </div>
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-muted-foreground/50 transition-transform duration-300",
            isOpen ? "rotate-0" : "-rotate-90"
          )} 
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-5 pb-5 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BlogSidebar({ formData, onChange, isNew }: BlogSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [keywordInput, setKeywordInput] = useState("");

  const handleCoverUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const url = await blogService.uploadBlogImage(file);
        onChange({ cover_image: url });
        toast.success("Cover image uploaded!");
      } catch {
        toast.error("Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  const addKeyword = useCallback(() => {
    const trimmed = keywordInput.trim();
    if (!trimmed) return;
    if (formData.keywords.includes(trimmed)) {
      setKeywordInput("");
      return;
    }
    onChange({ keywords: [...formData.keywords, trimmed] });
    setKeywordInput("");
  }, [keywordInput, formData.keywords, onChange]);

  const removeKeyword = useCallback(
    (keyword: string) => {
      onChange({ keywords: formData.keywords.filter((k) => k !== keyword) });
    },
    [formData.keywords, onChange]
  );

  return (
    <ScrollArea className="h-full bg-background/50">
      <div className="flex flex-col min-h-full">
        {/* Status Card */}
        <div className="p-5">
          <div className={cn(
            "rounded-2xl border border-border/40 p-4 space-y-3 transition-all duration-500 shadow-sm",
            formData.status === "published" 
              ? "bg-emerald-500/[0.03] border-emerald-500/20 shadow-emerald-500/5" 
              : "bg-muted/10 border-border/40"
          )}>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold">Visibility</span>
              <AnimatePresence mode="wait">
                <motion.div
                  key={formData.status}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Badge
                    className={cn(
                      "h-5 text-[10px] font-bold uppercase border-none shadow-none",
                      formData.status === "published"
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {formData.status === "published" ? "Live" : "Draft"}
                  </Badge>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-[11px] leading-relaxed text-muted-foreground/80 font-medium">
                {formData.status === "published" 
                  ? "This post is currently visible to all visitors on your site." 
                  : "Private story. Only collaborators and admins can read this draft."}
              </p>
              <Switch
                checked={formData.status === "published"}
                onCheckedChange={(checked) =>
                  onChange({ status: checked ? "published" : "draft" })
                }
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        <SidebarSection icon={Layout} label="General Settings">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">URL Slug</Label>
              <div className="relative group">
                <Globe className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  value={formData.slug}
                  onChange={(e) => onChange({ slug: e.target.value })}
                  placeholder="post-slug-here"
                  className="pl-9 font-mono text-[12px] h-9 rounded-xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                />
              </div>
              {formData.slug && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 opacity-70 truncate hover:opacity-100 transition-opacity">
                  <Share2 className="h-2.5 w-2.5" />
                  yuvaandclasses.com/blog/{formData.slug}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Cover Image</Label>
              {formData.cover_image ? (
                <div className="relative group rounded-2xl overflow-hidden border border-border/20 shadow-sm aspect-video">
                  <img
                    src={formData.cover_image}
                    alt="Cover"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => onChange({ cover_image: "" })}
                      className="h-8 w-8 rounded-full bg-white text-black hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full h-32 border-2 border-dashed border-border/40 rounded-2xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/20 hover:border-primary/20 hover:text-primary transition-all duration-300 group"
                >
                  <div className="p-3 rounded-full bg-muted/50 group-hover:bg-primary/5 transition-colors">
                    <Upload className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold">
                    {isUploading ? "Uploading..." : "Upload Cover"}
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
            </div>
          </div>
        </SidebarSection>

        <SidebarSection icon={Search} label="Search Engine (SEO)">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Meta Title</Label>
              <Input
                value={formData.meta_title}
                onChange={(e) => onChange({ meta_title: e.target.value })}
                placeholder="Defaults to post title"
                className="text-sm h-9 rounded-xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
              />
              <div className="flex justify-end pt-1">
                <span className={cn(
                  "text-[10px] font-mono",
                  formData.meta_title.length > 60 ? "text-red-500" : "text-muted-foreground/50"
                )}>
                  {formData.meta_title.length}/60
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Meta Description</Label>
              <Textarea
                value={formData.meta_description}
                onChange={(e) => onChange({ meta_description: e.target.value })}
                placeholder="Description for search results..."
                rows={3}
                className="text-sm rounded-xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20 resize-none leading-relaxed"
              />
              <div className="flex justify-end pt-1">
                <span className={cn(
                  "text-[10px] font-mono",
                  formData.meta_description.length > 160 ? "text-red-500" : "text-muted-foreground/50"
                )}>
                  {formData.meta_description.length}/160
                </span>
              </div>
            </div>
          </div>
        </SidebarSection>

        <SidebarSection icon={Tag} label="Keywords & Tags">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
                placeholder="Type and press enter..."
                className="text-sm h-9 flex-1 rounded-xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={addKeyword}
                disabled={!keywordInput.trim()}
                className="h-9 px-4 rounded-xl font-bold"
              >
                Add
              </Button>
            </div>
            
            <motion.div layout className="flex flex-wrap gap-1.5 min-h-[32px]">
              <AnimatePresence>
                {formData.keywords.map((keyword) => (
                  <motion.div
                    key={keyword}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    layout
                  >
                    <Badge
                      variant="secondary"
                      className="gap-1 pr-1 pl-2.5 py-1 text-xs font-medium rounded-lg bg-muted/50 hover:bg-muted transition-colors border-none"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="h-4 w-4 rounded-md inline-flex items-center justify-center hover:bg-foreground/10 text-muted-foreground/50 hover:text-foreground transition-all"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
              {formData.keywords.length === 0 && (
                <p className="text-[11px] text-muted-foreground/40 italic py-2">No tags added yet</p>
              )}
            </motion.div>
          </div>
        </SidebarSection>
        
        {/* Fill empty space */}
        <div className="flex-1" />
        
        {/* Footer info */}
        <div className="p-5 border-t border-border/40">
           <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/[0.03] border border-blue-500/10">
              <Settings2 className="h-4 w-4 text-blue-500/60" />
              <div>
                <p className="text-[11px] font-bold text-blue-500/80 uppercase tracking-tight">Pro Tip</p>
                <p className="text-[10px] text-blue-500/60 leading-tight">Use keywords consistently for better search engine ranking.</p>
              </div>
           </div>
        </div>
      </div>
    </ScrollArea>
  );
}
