import { GraduationCap, Mail, MoreVertical, Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import type { InstructorRecord } from '../types';
import { getInstructorColumns, type InstructorActions } from './InstructorColumns';

interface InstructorTableProps extends InstructorActions {
  instructors: InstructorRecord[];
  isLoading: boolean;
}

function formatInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'IN';
}

function formatExperience(years: number) {
  if (years === 1) return '1 year';
  return `${years} years`;
}

export function InstructorTable({ instructors, isLoading, onEdit, onToggleStatus, onDelete }: InstructorTableProps) {
  const columns = getInstructorColumns({ onEdit, onToggleStatus, onDelete });

  return (
    <div className="space-y-4">
      <div className="hidden overflow-hidden rounded-xl border border-border/60 bg-card md:block">
        <DataTable
          columns={columns}
          data={instructors}
          isLoading={isLoading}
          emptyState={
            <EmptyState
              icon={GraduationCap}
              title="No instructors found"
              description="Add teaching staff to assign them to courses and manage profiles."
            />
          }
        />
      </div>

      <div className="grid gap-3 md:hidden">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-border/60 bg-card p-4">
              <div className="h-5 w-2/3 rounded bg-muted/40" />
              <div className="mt-3 h-4 w-1/2 rounded bg-muted/30" />
              <div className="mt-4 h-16 rounded bg-muted/30" />
            </div>
          ))
        ) : instructors.length ? (
          instructors.map((instructor) => (
            <div key={instructor.id} className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 border border-border/60" size="default">
                  <AvatarImage src={instructor.profileImage || undefined} alt={instructor.fullName} />
                  <AvatarFallback>{formatInitials(instructor.fullName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-foreground">{instructor.fullName}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{instructor.bio || 'No bio added'}</div>
                    </div>
                    <Badge
                      variant="outline"
                      className={instructor.isActive ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700' : 'border-zinc-500/30 bg-zinc-500/10 text-zinc-600'}
                    >
                      {instructor.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {instructor.email}</span>
                    <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {instructor.phone || '—'}</span>
                    <span>{formatExperience(instructor.experienceYears)}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {instructor.expertise.length ? instructor.expertise.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="rounded-md px-2 py-0.5 text-xs">
                        {tag}
                      </Badge>
                    )) : <span className="text-sm text-muted-foreground">No expertise tags</span>}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Button type="button" variant="outline" className="h-9 gap-2" onClick={() => onEdit(instructor)}>
                      <GraduationCap className="h-4 w-4" /> Edit
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        nativeButton={true}
                        render={
                          <Button variant="outline" size="icon" className="h-9 w-9">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-44 p-2">
                        <DropdownMenuItem onClick={() => onToggleStatus(instructor)} className="rounded-lg">
                          {instructor.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(instructor)} className="rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={GraduationCap}
            title="No instructors found"
            description="Add teaching staff to assign them to courses and manage profiles."
          />
        )}
      </div>
    </div>
  );
}
