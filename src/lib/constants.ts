import { NavItem } from '@/types';

export const NAV_ITEMS: NavItem[] = [
  { title: 'لوحة التحكم', path: '/', icon: 'Building2' },
  { title: 'المرضى', path: '/patients', icon: 'Users' },
  { title: 'المواعيد', path: '/appointments', icon: 'Calendar' },
  { title: 'الأطباء', path: '/doctors', icon: 'Stethoscope' },
  { title: 'الإعدادات', path: '/settings', icon: 'Settings' },
];

export const APP_NAME = 'مركز الرعاية الصحية';
