import { NavItem } from '@/types';

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'المحتوى',
    items: [
      { title: 'لوحة التحكم', path: '/', icon: 'Building2' },
    ],
  },
  {
    title: 'العيادة',
    items: [
      { title: 'المرضى', path: '/patients', icon: 'Users' },
      { title: 'المواعيد', path: '/appointments', icon: 'Calendar' },
    ],
  },
  {
    title: 'المستخدمين',
    items: [
      { title: 'الأطباء', path: '/doctors', icon: 'Stethoscope' },
    ],
  },
  {
    title: 'أخرى',
    items: [
      { title: 'الإعدادات', path: '/settings', icon: 'Settings' },
    ],
  },
];

// Keep for backward compatibility
export const NAV_ITEMS: NavItem[] = [
  { title: 'لوحة التحكم', path: '/', icon: 'Building2' },
  { title: 'المرضى', path: '/patients', icon: 'Users' },
  { title: 'المواعيد', path: '/appointments', icon: 'Calendar' },
  { title: 'الأطباء', path: '/doctors', icon: 'Stethoscope' },
  { title: 'الإعدادات', path: '/settings', icon: 'Settings' },
];

export const APP_NAME = 'مركز الرعاية الصحي';
