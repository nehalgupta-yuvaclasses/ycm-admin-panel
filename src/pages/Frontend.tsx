import { useNavigate } from "react-router-dom";
import { ArrowRight, HelpCircle, ImageIcon, Share2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { BannerManager } from "@/components/admin/frontend/BannerManager";
import { FAQManager } from "@/components/admin/frontend/FAQManager";
import { ResultsManager } from "@/components/admin/frontend/ResultsManager";
import { SocialsPage } from "@/modules/frontend/socials/SocialsPage";

const sections = [
  { value: "banners", label: "Hero Banners", icon: ImageIcon },
  { value: "socials", label: "Socials", icon: Share2 },
  { value: "faqs", label: "FAQs", icon: HelpCircle },
  { value: "results", label: "Results", icon: Trophy },
];

export default function Frontend() {
  const navigate = useNavigate();

  return (
    <PageContainer className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Frontend Management"
        description="Control the public-facing experience from one structured CMS surface."
      >
        <Button variant="outline" className="gap-2" onClick={() => navigate("/admin/blogs") }>
          Open blog CMS
          <ArrowRight className="h-4 w-4" />
        </Button>
      </PageHeader>

      <Tabs defaultValue="banners" className="space-y-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex min-w-full justify-start gap-1 rounded-xl border border-border/60 bg-muted/40 p-1">
            {sections.map((section) => (
              (() => {
                const Icon = section.icon;
                return (
              <TabsTrigger
                key={section.value}
                value={section.value}
                className="gap-2 whitespace-nowrap px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </TabsTrigger>
                );
              })()
            ))}
          </TabsList>
        </div>

        <TabsContent value="banners" className="mt-0 outline-none">
          <BannerManager />
        </TabsContent>

        <TabsContent value="socials" className="mt-0 outline-none">
          <SocialsPage />
        </TabsContent>

        <TabsContent value="faqs" className="mt-0 outline-none">
          <FAQManager />
        </TabsContent>

        <TabsContent value="results" className="mt-0 outline-none">
          <ResultsManager />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
