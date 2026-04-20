import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RefreshCcw, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageContainer } from '@/components/shared/page-container';
import { PageHeader } from '@/components/shared/page-header';
import { DEFAULT_SOCIALS, getSocials, type SocialsData, updateSocials } from './socials.service';
import { SocialsForm, type SocialsFormValues } from './SocialsForm';

const socialsQueryKey = ['site-settings', 'socials'];

export function SocialsPage() {
  const queryClient = useQueryClient();

  const socialsQuery = useQuery({
    queryKey: socialsQueryKey,
    queryFn: getSocials,
  });

  const updateMutation = useMutation({
    mutationFn: (values: SocialsFormValues) => updateSocials(values as SocialsData),
    onSuccess: (saved) => {
      queryClient.setQueryData(socialsQueryKey, saved);
      toast.success('Socials updated successfully');
    },
    onError: () => {
      toast.error('Failed to save socials');
    },
  });

  const handleSubmit = async (values: SocialsFormValues) => {
    await updateMutation.mutateAsync(values);
  };

  return (
    <PageContainer className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Socials"
        description="Manage the global contact and social identity used by the web, app, and future channels."
      >
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => socialsQuery.refetch()}
          disabled={socialsQuery.isFetching}
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </PageHeader>

      {socialsQuery.isError ? (
        <Card className="border-border/60">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">Unable to load socials</p>
                <p className="text-sm text-muted-foreground">Check the site settings table and Supabase permissions, then try again.</p>
              </div>
            </div>
            <Button type="button" variant="outline" onClick={() => socialsQuery.refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <SocialsForm
          socials={socialsQuery.data ?? DEFAULT_SOCIALS}
          isLoading={socialsQuery.isLoading}
          isSaving={updateMutation.isPending}
          lastSaved={socialsQuery.data?.updated_at ?? null}
          onSubmit={handleSubmit}
        />
      )}
    </PageContainer>
  );
}

export default SocialsPage;