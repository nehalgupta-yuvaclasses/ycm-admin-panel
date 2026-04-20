import * as React from 'react';
import { DataTable } from '@/components/shared/data-table';
import { Subscriber } from '../types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  Trash2, 
  MoreHorizontal,
  Mail,
  Clock,
  Search,
  Download
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface SubscribersTableProps {
  subscribers: Subscriber[];
  isLoading: boolean;
  onUnsubscribe: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SubscribersTable({
  subscribers,
  isLoading,
  onUnsubscribe,
  onDelete,
}: SubscribersTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredSubscribers = React.useMemo(() => {
    return subscribers.filter((sub) => {
      return sub.email.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [subscribers, searchTerm]);

  const emptyState = (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <Mail className="h-10 w-10 text-muted-foreground/60" />
      <p className="text-sm font-medium text-foreground">No subscribers found</p>
      <p className="text-sm text-muted-foreground">
        Try a different email search term.
      </p>
    </div>
  );

  const escapeCsvValue = (value: string) => `"${value.replace(/"/g, '""')}"`;

  const handleExportCSV = () => {
    if (filteredSubscribers.length === 0) {
      toast.error('No subscribers to export');
      return;
    }

    const headers = ['Email', 'Date Subscribed', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredSubscribers.map((sub) => [
        escapeCsvValue(sub.email),
        escapeCsvValue(format(new Date(sub.created_at), 'yyyy-MM-dd HH:mm:ss')),
        escapeCsvValue(sub.status),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `subscribers_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Subscribers list exported successfully');
  };

  const columns = [
    {
      header: 'Email Address',
      cell: (sub: Subscriber) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 bg-muted/60 text-muted-foreground">
            <Mail className="w-4 h-4" />
          </div>
          <span className="min-w-0 truncate font-medium text-foreground">{sub.email}</span>
        </div>
      ),
    },
    {
      header: 'Subscribed On',
      cell: (sub: Subscriber) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs">
            {format(new Date(sub.created_at), 'PPP')}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (sub: Subscriber) => (
        <Badge 
          variant={sub.status === 'active' ? 'default' : 'secondary'}
          className="capitalize text-[10px] px-2 py-0"
        >
          {sub.status}
        </Badge>
      ),
    },
    {
      header: '',
      className: 'w-[50px]',
      cell: (sub: Subscriber) => (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {sub.status === 'active' ? (
              <DropdownMenuItem onClick={() => onUnsubscribe(sub.id)}>
                <Mail className="mr-2 h-4 w-4" />
                Unsubscribe
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem 
              onClick={() => onDelete(sub.id)}
              className="text-red-600 focus:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Permanently
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
            placeholder="Search email..." 
            className="pl-10 h-10 bg-background/80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          onClick={handleExportCSV}
          className="gap-2 h-10 w-full sm:w-auto"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredSubscribers} 
        isLoading={isLoading}
        emptyState={emptyState}
      />
    </div>
  );
}
