import { NavLink, useLocation } from 'react-router-dom';
import { Building2, Users, Calendar, Stethoscope, Settings } from 'lucide-react';
import { NAV_SECTIONS } from '@/lib/constants';
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
  
  return (
    <aside className="fixed top-header right-0 bottom-0 w-sidebar border-l border-border overflow-y-auto bg-[#0a1a29]">
      <nav className="p-4 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-2">
            <h3 className="px-4 text-xs font-semibold uppercase tracking-wider text-[#f38729]">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = iconMap[item.icon];
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                      isActive
                        ? "bg-[rgba(243,135,41,0.2)] text-white"
                        : "text-white/80 hover:bg-[rgba(243,135,41,0.2)] hover:text-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 flex-shrink-0 transition-colors duration-200",
                        isActive
                          ? "text-[rgba(243,135,41,1)]"
                          : "text-[#494B74] group-hover:text-[rgba(243,135,41,1)]"
                      )}
                    />
                    <span>{item.title}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}