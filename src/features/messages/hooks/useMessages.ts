import { useState, useEffect, useCallback } from 'react';
import { ContactMessage, MessageStatus } from '../types';
import * as api from '../api';
import { toast } from 'sonner';

export function useMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getMessages();
      setMessages(data);
    } catch (error: any) {
      toast.error(`Failed to fetch messages: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStatus = async (id: string, status: MessageStatus) => {
    try {
      await api.updateMessageStatus(id, status);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
      toast.success('Message status updated');
    } catch (error: any) {
      toast.error(`Failed to update status: ${error.message}`);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await api.deleteMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      toast.success('Message deleted');
    } catch (error: any) {
      toast.error(`Failed to delete message: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    isLoading,
    fetchMessages,
    updateStatus,
    deleteMessage,
  };
}
