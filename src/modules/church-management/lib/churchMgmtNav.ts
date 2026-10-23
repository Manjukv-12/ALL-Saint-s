import {
  LayoutDashboard,
  Home,
  Users,
  UserSearch,
  IndianRupee,
  FileText,
  FileSpreadsheet,
  Cake,
  CalendarHeart,
  type LucideIcon,
} from 'lucide-react';

export type ChurchMgmtNavSegment =
  | 'dashboard'
  | 'families'
  | 'members'
  | 'people'
  | 'fees'
  | 'certificates'
  | 'reports';

export interface ChurchMgmtNavChild {
  label: string;
  /** Path under church mgmt, e.g. reports?tab=birthdays */
  to: string;
  icon?: LucideIcon;
  match?: (pathname: string, search: string) => boolean;
}

export interface ChurchMgmtNavItem {
  label: string;
  segment: ChurchMgmtNavSegment;
  icon: LucideIcon;
  description: string;
  /** Icon tile on light dashboard cards */
  accentCard: string;
  children?: ChurchMgmtNavChild[];
}

export const churchMgmtNavItems: ChurchMgmtNavItem[] = [
  {
    label: 'Dashboard',
    segment: 'dashboard',
    icon: LayoutDashboard,
    description: 'Overview and quick stats',
    accentCard: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  },
  {
    label: 'Families',
    segment: 'families',
    icon: Home,
    description: 'Family records and lineage',
    accentCard: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  },
  {
    label: 'Members',
    segment: 'members',
    icon: Users,
    description: 'All members across families',
    accentCard: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  {
    label: 'People',
    segment: 'people',
    icon: UserSearch,
    description: 'Search persons and life events',
    accentCard: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  },
  {
    label: 'Fees & Dues',
    segment: 'fees',
    icon: IndianRupee,
    description: 'Membership and church dues',
    accentCard: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  },
  {
    label: 'Certificates',
    segment: 'certificates',
    icon: FileText,
    description: 'Baptism, marriage, burial',
    accentCard: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  },
  {
    label: 'Reports',
    segment: 'reports',
    icon: FileSpreadsheet,
    description: 'Birthdays & anniversaries',
    accentCard: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
    children: [
      {
        label: 'Birthdays',
        to: 'reports?tab=birthdays',
        icon: Cake,
        match: (pathname, search) =>
          pathname.includes('/reports') &&
          (new URLSearchParams(search).get('tab') === 'birthdays' ||
            !new URLSearchParams(search).get('tab')),
      },
      {
        label: 'Wedding anniversaries',
        to: 'reports?tab=anniversaries',
        icon: CalendarHeart,
        match: (pathname, search) =>
          pathname.includes('/reports') &&
          new URLSearchParams(search).get('tab') === 'anniversaries',
      },
    ],
  },
];
