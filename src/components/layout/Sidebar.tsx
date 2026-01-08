import { NavLink, useLocation } from 'react-router-dom';
import { Building2, Users, Calendar, Stethoscope, Settings } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
const iconMap: Record<string, React.ElementType> = {
  Building2,
  Users,
  Calendar,
  Stethoscope,
  Settings
};
export function Sidebar() {
  const location = useLocation();
  return <aside className="fixed top-header right-0 bottom-0 w-sidebar border-l border-border overflow-y-auto bg-[#0a1a29]">
      <nav className="p-4 space-y-1">
        {NAV_ITEMS.map(item => {
        const Icon = iconMap[item.icon];
        const isActive = location.pathname === item.path;
        return <NavLink key={item.path} to={item.path} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200", isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              <Icon className="w-5 h-5 flex-shrink-0 text-[#f3882b]" />
              <span>{item.title}</span>
            </NavLink>;
      })}
      </nav>
    </aside>;
}