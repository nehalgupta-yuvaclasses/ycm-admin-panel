import { GraduationCap, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { DataTableProps } from '@/components/shared/data-table';
import { cn } from '@/lib/utils';
import type { InstructorRecord } from '../types';

export interface InstructorActions {
  onEdit: (instructor: InstructorRecord) => void;
  onToggleStatus: (instructor: InstructorRecord) => void;
  onDelete: (instructor: InstructorRecord) => void;
}

function formatExperience(years: number) {
  if (years === 1) return '1 year';
  return `${years} years`;
}

function formatInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'IN';
}

export function getInstructorColumns(actions: InstructorActions): DataTableProps<InstructorRecord>['columns'] {
  return [
    {
      header: 'Profile',
      className: 'min-w-[340px] max-w-[340px]',
      cell: (instructor) => (
        <div className="flex min-w-0 items-start gap-3">
          <Avatar className="h-11 w-11 shrink-0 border border-border/60" size="default">
            <AvatarImage src={instructor.profileImage || undefined} alt={instructor.fullName} />
            <AvatarFallback>{formatInitials(instructor.fullName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1">
            <div className="truncate font-medium text-foreground">{instructor.fullName}</div>
            <div className="line-clamp-2 max-w-[280px] text-sm leading-5 text-muted-foreground">
              {instructor.bio || 'No bio added'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact',
      className: 'min-w-[220px] max-w-[220px]',
      cell: (instructor) => (
        <div className="space-y-1">
          <div className="truncate text-sm text-foreground">{instructor.email}</div>
          <div className="truncate text-sm text-muted-foreground">{instructor.phone || '—'}</div>
        </div>
      ),
    },
    {
      header: 'Expertise',
      className: 'min-w-[260px] max-w-[260px]',
      cell: (instructor) => (
        <div className="flex flex-wrap gap-1.5">
          {instructor.expertise.length ? (
            instructor.expertise.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-md px-2 py-0.5 text-xs">
                {tag}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">Not set</span>
          )}
          {instructor.expertise.length > 3 && (
            <Badge variant="outline" className="rounded-md px-2 py-0.5 text-xs">
              +{instructor.expertise.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Details',
      className: 'min-w-[180px] max-w-[180px]',
      cell: (instructor) => (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">{formatExperience(instructor.experienceYears)}</div>
          <Badge
            variant="outline"
            className={cn(
              'rounded-md border-border/60 px-2 py-0.5 text-xs',
              instructor.isActive
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                : 'border-zinc-500/30 bg-zinc-500/10 text-zinc-600',
            )}
          >
            {instructor.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (instructor) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => actions.onEdit(instructor)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              nativeButton={true}
              render={
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-48 p-2">
              <DropdownMenuItem onClick={() => actions.onEdit(instructor)} className="rounded-lg">
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => actions.onToggleStatus(instructor)} className="rounded-lg">
                <GraduationCap className="mr-2 h-4 w-4" /> {instructor.isActive ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive"
                onClick={() => actions.onDelete(instructor)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
