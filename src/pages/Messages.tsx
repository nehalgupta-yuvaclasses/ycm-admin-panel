import * as React from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { PageContainer } from '@/components/shared/page-container';
import { MessageTabs } from '@/features/messages/components/MessageTabs';
import { MessageDetailsDialog } from '@/features/messages/components/MessageDetailsDialog';
import { useMessages } from '@/features/messages/hooks/useMessages';
import { useSubscribers } from '@/features/messages/hooks/useSubscribers';
import { ContactMessage } from '@/features/messages/types';
import { Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Messages() {
  const {
    messages,
    isLoading: isLoadingMessages,
    fetchMessages,
    updateStatus,
    deleteMessage,
  } = useMessages();

  const {
    subscribers,
    isLoading: isLoadingSubscribers,
    fetchSubscribers,
    unsubscribeSubscriber,
    deleteSubscriber,
  } = useSubscribers();

  const [selectedMessage, setSelectedMessage] = React.useState<ContactMessage | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message.status === 'new' ? { ...message, status: 'read' } : message);
    setIsDetailsOpen(true);
    if (message.status === 'new') {
      updateStatus(message.id, 'read');
    }
  };

  const handleRefresh = async () => {
    await Promise.all([fetchMessages(), fetchSubscribers()]);
    toast.success('Inbox refreshed');
  };

  const totalMessages = messages.length;
  const newMessages = messages.filter((message) => message.status === 'new').length;
  const activeSubscribers = subscribers.filter((subscriber) => subscriber.status === 'active').length;

  return (
    <PageContainer className="px-6 py-6 space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Messages"
        description="Manage user queries and subscribers"
        icon={<Mail className="h-5 w-5" />}
      >
        <Button variant="outline" onClick={handleRefresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Total messages', value: totalMessages },
          { label: 'New messages', value: newMessages },
          { label: 'Active subscribers', value: activeSubscribers },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border bg-card px-5 py-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <MessageTabs 
          messages={messages}
          subscribers={subscribers}
          isLoadingMessages={isLoadingMessages}
          isLoadingSubscribers={isLoadingSubscribers}
          onViewMessage={handleViewMessage}
          onUpdateMessageStatus={updateStatus}
          onDeleteMessage={deleteMessage}
          onUnsubscribeSubscriber={unsubscribeSubscriber}
          onDeleteSubscriber={deleteSubscriber}
        />
      </div>

      <MessageDetailsDialog 
        message={selectedMessage}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </PageContainer>
  );
}
