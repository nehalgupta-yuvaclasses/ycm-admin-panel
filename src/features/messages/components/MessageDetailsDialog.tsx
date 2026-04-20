import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ContactMessage } from '../types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Mail, User, Tag, Calendar, MessageSquare } from 'lucide-react';

interface MessageDetailsDialogProps {
  message: ContactMessage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MessageDetailsDialog({
  message,
  open,
  onOpenChange,
}: MessageDetailsDialogProps) {
  if (!message) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold">{message.subject}</DialogTitle>
              <DialogDescription>
                Message details and sender information
              </DialogDescription>
            </div>
            <Badge 
              variant={message.status === 'new' ? 'default' : message.status === 'read' ? 'secondary' : 'outline'}
              className="capitalize"
            >
              {message.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 border border-zinc-100">
              <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-500">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Full Name</p>
                <p className="text-sm font-semibold">{message.full_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 border border-zinc-100">
              <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-500">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Email Address</p>
                <p className="text-sm font-semibold">{message.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 border border-zinc-100">
              <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-500">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Subject</p>
                <p className="text-sm font-semibold">{message.subject}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 border border-zinc-100">
              <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-500">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Received On</p>
                <p className="text-sm font-semibold">
                  {format(new Date(message.created_at), 'PPP p')}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-zinc-400" />
              <h4 className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Message Content</h4>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 min-h-[120px]">
              <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
                {message.message}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
