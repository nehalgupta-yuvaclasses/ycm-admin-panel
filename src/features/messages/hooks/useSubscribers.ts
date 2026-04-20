import { useState, useEffect, useCallback } from 'react';
import { Subscriber } from '../types';
import * as api from '../api';
import { toast } from 'sonner';

export function useSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscribers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getSubscribers();
      setSubscribers(data);
    } catch (error: any) {
      toast.error(`Failed to fetch subscribers: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unsubscribeSubscriber = async (id: string) => {
    if (!confirm('Mark this subscriber as unsubscribed?')) return;
    try {
      const updatedSubscriber = await api.unsubscribeSubscriber(id);
      setSubscribers(prev => prev.map(s => s.id === id ? updatedSubscriber : s));
      toast.success('Subscriber marked as unsubscribed');
    } catch (error: any) {
      toast.error(`Failed to update subscriber: ${error.message}`);
    }
  };

  const deleteSubscriber = async (id: string) => {
    if (!confirm('Delete this subscriber permanently?')) return;
    try {
      await api.removeSubscriber(id);
      setSubscribers(prev => prev.filter(s => s.id !== id));
      toast.success('Subscriber deleted');
    } catch (error: any) {
      toast.error(`Failed to delete subscriber: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  return {
    subscribers,
    isLoading,
    fetchSubscribers,
    unsubscribeSubscriber,
    deleteSubscriber,
  };
}
