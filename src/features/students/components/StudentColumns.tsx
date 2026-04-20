import * as React from "react"
import { MoreHorizontal, Mail, Phone, Edit, Eye, Trash2, XCircle, CheckCircle2, Clock, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Student } from "../types"
import { cn } from "@/lib/utils"

interface ColumnProps {
  onView: (student: Student) => void
  onEdit: (student: Student) => void
  onDelete: (id: string) => void
  onToggleStatus: (student: Student) => void
  onBan: (student: Student) => void
  onUnban: (student: Student) => void
  onAssignCourse: (student: Student) => void
}

export const getStudentColumns = ({
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onBan,
  onUnban,
  onAssignCourse,
}: ColumnProps) => [
  {
    header: "Student",
    cell: (student: Student) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 border border-border/50 shadow-sm">
          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.full_name}`} />
          <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold uppercase">
            {(student.full_name || "??").slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-bold text-foreground leading-none mb-1">{student.full_name}</span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">ID: {student.id.slice(0, 8)}</span>
        </div>
      </div>
    ),
  },
  {
    header: "Batch",
    cell: (student: Student) => (
      <Badge variant="outline" className="font-semibold bg-muted/20 border-muted-foreground/20 px-2 py-0.5 text-xs">
        {student.batch || "No Batch"}
      </Badge>
    ),
  },
  {
    header: "Contact",
    cell: (student: Student) => (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group">
          <div className="p-1 rounded bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <Mail className="h-3 w-3" />
          </div>
          <span className="truncate max-w-[150px]">{student.email}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70 tracking-tight">
          <Phone className="h-3 w-3" />
          <span>{student.phone || "No phone"}</span>
        </div>
      </div>
    ),
  },
  {
    header: "Status",
    cell: (student: Student) => {
      const status = student.status || "inactive"
      return (
        <Badge 
          variant="outline"
          className={cn(
            "gap-1.5 pl-1.5 pr-2.5 py-1 font-bold text-[11px] uppercase tracking-wide border-2",
            status === "active" && "bg-emerald-50 text-emerald-600 border-emerald-200/50",
            status === "inactive" && "bg-slate-50 text-slate-500 border-slate-200/50",
            status === "pending" && "bg-amber-50 text-amber-600 border-amber-200/50"
          )}
        >
          {status === "active" ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : status === "pending" ? (
            <Clock className="h-3.5 w-3.5" />
          ) : (
            <XCircle className="h-3.5 w-3.5" />
          )}
          {status}
        </Badge>
      )
    },
  },
  {
    header: "",
    className: "text-right w-[80px]",
    cell: (student: Student) => (
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted transition-colors">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </Button>
        } />
        <DropdownMenuContent align="end" className="w-52 p-1.5 shadow-xl border-border/40 backdrop-blur-md animate-in fade-in zoom-in duration-200">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Student Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onView(student)} className="rounded-md gap-2 py-2 cursor-pointer">
              <Eye className="h-4 w-4 text-muted-foreground" /> 
              <span className="font-medium">View Full Details</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(student)} className="rounded-md gap-2 py-2 cursor-pointer">
              <Edit className="h-4 w-4 text-muted-foreground" /> 
              <span className="font-medium">Edit Information</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onAssignCourse(student)}
              className="rounded-md gap-2 py-2 cursor-pointer"
            >
              <BookOpen className="h-4 w-4 text-muted-foreground" /> 
              <span className="font-medium">Manage Courses</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleStatus(student)} className="rounded-md gap-2 py-2 cursor-pointer">
              {student.status === "active" ? (
                <><XCircle className="h-4 w-4 text-rose-500" /> <span className="text-rose-600 font-bold">Deactivate Account</span></>
              ) : (
                <><CheckCircle2 className="h-4 w-4 text-emerald-500" /> <span className="text-emerald-600 font-bold">Activate Account</span></>
              )}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator className="opacity-50" />
          
          <DropdownMenuGroup>
            {student.status === "inactive" ? (
              <DropdownMenuItem onClick={() => onUnban(student)} className="rounded-md gap-2 py-2 cursor-pointer text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 font-bold">
                <CheckCircle2 className="h-4 w-4" /> Reactivate Student
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                className="rounded-md gap-2 py-2 cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50 font-bold"
                onClick={() => onBan(student)}
              >
                <XCircle className="h-4 w-4" /> Suspend Student Account
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              className="rounded-md gap-2 py-2 cursor-pointer text-destructive focus:bg-destructive/10 font-bold"
              onClick={() => onDelete(student.id)}
            >
              <Trash2 className="h-4 w-4" /> Delete Student
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]
