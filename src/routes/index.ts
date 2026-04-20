import { lazy, LazyExoticComponent, ComponentType } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap,
  BookOpen, 
  FileText, 
  CreditCard, 
  Bell, 
  Settings, 
  Globe,
  Library,
  PenLine,
  Mail
} from 'lucide-react';

export interface RouteConfig {
  path: string;
  label: string;
  icon: any;
  component: LazyExoticComponent<ComponentType<any>>;
  permission?: string;
  showInSidebar?: boolean;
}

export const adminRoutes: RouteConfig[] = [
  {
    path: '/admin/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    component: lazy(() => import('@/pages/Dashboard')),
    permission: 'view_dashboard',
    showInSidebar: true
  },
  {
    path: '/admin/students',
    label: 'Students',
    icon: Users,
    component: lazy(() => import('@/pages/Students')),
    permission: 'manage_students',
    showInSidebar: true
  },
  {
    path: '/admin/instructors',
    label: 'Instructors',
    icon: GraduationCap,
    component: lazy(() => import('@/features/instructors/pages/InstructorsPage')),
    permission: 'manage_instructors',
    showInSidebar: true
  },
  {
    path: '/admin/courses',
    label: 'Courses',
    icon: BookOpen,
    component: lazy(() => import('@/pages/Courses')),
    permission: 'manage_courses',
    showInSidebar: true
  },
  {
    path: '/admin/courses/:courseId',
    label: 'Course Builder',
    icon: BookOpen,
    component: lazy(() => import('@/pages/CourseBuilder')),
    permission: 'manage_courses',
    showInSidebar: false
  },
  {
    path: '/admin/tests',
    label: 'Tests',
    icon: FileText,
    component: lazy(() => import('@/pages/Tests')),
    permission: 'manage_tests',
    showInSidebar: true
  },
  {
    path: '/admin/tests/builder/:testId',
    label: 'Test Builder',
    icon: FileText,
    component: lazy(() => import('@/pages/TestBuilder')),
    permission: 'manage_tests',
    showInSidebar: false
  },
  {
    path: '/admin/tests/attempts/:testId',
    label: 'Test Attempts',
    icon: FileText,
    component: lazy(() => import('@/pages/TestAttempts')),
    permission: 'manage_tests',
    showInSidebar: false
  },
  {
    path: '/admin/payments',
    label: 'Payments',
    icon: CreditCard,
    component: lazy(() => import('@/pages/Payments')),
    permission: 'manage_payments',
    showInSidebar: true
  },
  {
    path: '/admin/resources',
    label: 'Resources',
    icon: Library,
    component: lazy(() => import('@/pages/Resources')),
    permission: 'manage_resources',
    showInSidebar: true
  },
  {
    path: '/admin/blogs',
    label: 'Blogs',
    icon: PenLine,
    component: lazy(() => import('@/pages/Blogs')),
    permission: 'manage_blogs',
    showInSidebar: true
  },
  {
    path: '/admin/blogs/:blogId',
    label: 'Edit Blog',
    icon: PenLine,
    component: lazy(() => import('@/pages/BlogEditorPage')),
    permission: 'manage_blogs',
    showInSidebar: false
  },
  {
    path: '/admin/frontend',
    label: 'Frontend Management',
    icon: Globe,
    component: lazy(() => import('@/pages/Frontend')),
    permission: 'manage_frontend',
    showInSidebar: true
  },
  {
    path: '/admin/notifications',
    label: 'Notifications',
    icon: Bell,
    component: lazy(() => import('@/pages/Notifications')),
    permission: 'manage_notifications',
    showInSidebar: true
  },
  {
    path: '/admin/messages',
    label: 'Messages',
    icon: Mail,
    component: lazy(() => import('@/pages/Messages')),
    permission: 'manage_messages',
    showInSidebar: true
  },
  {
    path: '/admin/settings',
    label: 'Settings',
    icon: Settings,
    component: lazy(() => import('@/pages/Settings')),
    permission: 'manage_settings',
    showInSidebar: true
  }
];
