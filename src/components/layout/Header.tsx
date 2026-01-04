import { Bell, Settings, Plus } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { APP_NAME } from '@/lib/constants';

export function Header() {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 h-header bg-card border-b border-border flex items-center justify-between px-6">
      {/* Right side - Logo and Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <Plus className="w-6 h-6 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold text-foreground">{APP_NAME}</h1>
      </div>

      {/* Left side - Actions */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>

        {/* Settings */}
        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* User Avatar */}
        <Avatar className="w-9 h-9 border-2 border-primary/20">
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            أ
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
