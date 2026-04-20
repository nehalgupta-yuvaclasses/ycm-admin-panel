import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessagesTable } from './MessagesTable';
import { SubscribersTable } from './SubscribersTable';
import { ContactMessage, Subscriber, MessageStatus } from '../types';
import { Mail, Users } from 'lucide-react';

interface MessageTabsProps {
  messages: ContactMessage[];
  subscribers: Subscriber[];
  isLoadingMessages: boolean;
  isLoadingSubscribers: boolean;
  onViewMessage: (message: ContactMessage) => void;
  onUpdateMessageStatus: (id: string, status: MessageStatus) => void;
  onDeleteMessage: (id: string) => void;
  onUnsubscribeSubscriber: (id: string) => void;
  onDeleteSubscriber: (id: string) => void;
}

export function MessageTabs({
  messages,
  subscribers,
  isLoadingMessages,
  isLoadingSubscribers,
  onViewMessage,
  onUpdateMessageStatus,
  onDeleteMessage,
  onUnsubscribeSubscriber,
  onDeleteSubscriber,
}: MessageTabsProps) {
  const newMessagesCount = React.useMemo(
    () => messages.filter((message) => message.status === 'new').length,
    [messages],
  );

  const activeSubscribersCount = React.useMemo(
    () => subscribers.filter((subscriber) => subscriber.status === 'active').length,
    [subscribers],
  );

  return (
    <Tabs defaultValue="messages" className="w-full space-y-6">
      <div className="overflow-x-auto pb-1">
        <TabsList variant="line" className="inline-flex min-w-full justify-start gap-1 rounded-xl border border-white/10 bg-white/5 p-1 text-zinc-400 shadow-sm">
          <TabsTrigger value="messages" className="gap-2 rounded-lg px-4 py-2 text-sm font-medium data-active:bg-white/10 data-active:text-white">
            <Mail className="w-4 h-4" />
            <span>Messages</span>
            {newMessagesCount > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-[10px] font-bold text-zinc-900">
                {newMessagesCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="subscribers" className="gap-2 rounded-lg px-4 py-2 text-sm font-medium data-active:bg-white/10 data-active:text-white">
            <Users className="w-4 h-4" />
            <span>Subscribers</span>
            {activeSubscribersCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/90 px-1.5 text-[10px] font-bold text-zinc-900">
                {activeSubscribersCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="messages" className="mt-0 space-y-4 outline-none focus-visible:outline-none focus-visible:ring-0">
        <MessagesTable 
          messages={messages}
          isLoading={isLoadingMessages}
          onView={onViewMessage}
          onUpdateStatus={onUpdateMessageStatus}
          onDelete={onDeleteMessage}
        />
      </TabsContent>

      <TabsContent value="subscribers" className="mt-0 space-y-4 outline-none focus-visible:outline-none focus-visible:ring-0">
        <SubscribersTable 
          subscribers={subscribers}
          isLoading={isLoadingSubscribers}
          onUnsubscribe={onUnsubscribeSubscriber}
          onDelete={onDeleteSubscriber}
        />
      </TabsContent>
    </Tabs>
  );
}
