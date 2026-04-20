import * as React from 'react';
import { DataTable } from '@/components/shared/data-table';
import { ContactMessage, MessageStatus } from '../types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  Eye, 
  CheckCircle2, 
  Trash2, 
  MoreHorizontal,
  Mail,
  User,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MessagesTableProps {
  messages: ContactMessage[];
  isLoading: boolean;
  onView: (message: ContactMessage) => void;
  onUpdateStatus: (id: string, status: MessageStatus) => void;
  onDelete: (id: string) => void;
}

export function MessagesTable({
  messages,
  isLoading,
  onView,
  onUpdateStatus,
  onDelete,
}: MessagesTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const filteredMessages = React.useMemo(() => {
    return messages.filter((msg) => {
      const matchesSearch = 
        msg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [messages, searchTerm, statusFilter]);

  const emptyState = (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <Mail className="h-10 w-10 text-muted-foreground/60" />
      <p className="text-sm font-medium text-foreground">No messages found</p>
      <p className="text-sm text-muted-foreground">
        Try a different search term or clear the status filter.
      </p>
    </div>
  );

  const getStatusBadgeVariant = (status: MessageStatus) => {
    if (status === 'new') return 'default';
    if (status === 'read') return 'secondary';
    return 'outline';
  };

  const getNextAction = (status: MessageStatus) => {
    if (status === 'new') return 'read' as const;
    if (status === 'read') return 'replied' as const;
    return 'read' as const;
  };

  const columns = [
    {
      header: 'Name',
      cell: (msg: ContactMessage) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-muted/60 text-muted-foreground">
            <User className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{msg.full_name}</p>
            <p className="text-xs text-muted-foreground sm:hidden">{msg.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Email',
      className: 'hidden sm:table-cell',
      cell: (msg: ContactMessage) => (
        <span className="text-sm text-muted-foreground">{msg.email}</span>
      ),
    },
    {
      header: 'Subject',
      cell: (msg: ContactMessage) => (
        <span className="block max-w-[240px] truncate font-medium text-foreground">
          {msg.subject}
        </span>
      ),
    },
    {
      header: 'Date',
      cell: (msg: ContactMessage) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs">
            {format(new Date(msg.created_at), 'MMM dd, yyyy')}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (msg: ContactMessage) => (
        <Badge 
          variant={getStatusBadgeVariant(msg.status)}
          className="capitalize text-[10px] px-2 py-0"
        >
          {msg.status}
        </Badge>
      ),
    },
    {
      header: '',
      className: 'w-[50px]',
      cell: (msg: ContactMessage) => (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(msg)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus(msg.id, getNextAction(msg.status))}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {msg.status === 'new' ? 'Mark as Read' : msg.status === 'read' ? 'Mark as Replied' : 'Reopen'}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(msg.id)}
              className="text-red-600 focus:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search messages..." 
            className="pl-10 h-10 bg-background/80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px] h-10">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Sorted by latest</span>
        <span>{filteredMessages.length} message{filteredMessages.length === 1 ? '' : 's'}</span>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredMessages} 
        isLoading={isLoading}
        onRowClick={onView}
        emptyState={emptyState}
      />
    </div>
  );
}
