import { supabase } from '@/lib/supabase';
import {
  ContactMessage,
  ContactMessageInput,
  MessageStatus,
  Subscriber,
  SubscriberInput,
  contactMessageCreateSchema,
  subscriberCreateSchema,
} from './types';

// Contact Messages API
export const getMessages = async () => {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ContactMessage[];
};

export const createMessage = async (input: ContactMessageInput) => {
  const payload = contactMessageCreateSchema.parse({
    ...input,
    email: input.email.trim().toLowerCase(),
  });

  const { data, error } = await supabase
    .from('contact_messages')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data as ContactMessage;
};

export const updateMessageStatus = async (id: string, status: MessageStatus) => {
  const { data, error } = await supabase
    .from('contact_messages')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteMessage = async (id: string) => {
  const { error } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Subscribers API
export const getSubscribers = async () => {
  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Subscriber[];
};

export const addSubscriber = async (input: SubscriberInput) => {
  const payload = subscriberCreateSchema.parse({
    ...input,
    email: input.email.trim().toLowerCase(),
  });

  const { data, error } = await supabase
    .from('subscribers')
    .upsert([payload], { onConflict: 'email' })
    .select()
    .single();

  if (error) throw error;
  return data as Subscriber;
};

export const unsubscribeSubscriber = async (id: string) => {
  const { data, error } = await supabase
    .from('subscribers')
    .update({ status: 'unsubscribed' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Subscriber;
};

export const removeSubscriber = async (id: string) => {
  const { error } = await supabase
    .from('subscribers')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
