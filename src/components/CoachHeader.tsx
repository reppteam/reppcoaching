import React from "react";
import { useAuth } from '../hooks/useAuth';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { 
  Bell, 
  Plus, 
  Search, 
  User,
  ChevronDown
} from "lucide-react";

interface CoachHeaderProps {
  onSearch?: (query: string) => void;
  onAddNew?: () => void;
  onNotifications?: () => void;
}

export function CoachHeader({
  onSearch,
  onAddNew,
  onNotifications
}: CoachHeaderProps) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-[90%] mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-blue-600">
              REAL ESTATE PHOTOGRAPHER PRO
            </h1>
          </div>

          {/* Center: Navigation */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Preview
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Code
            </Button>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Coach"
                className="pl-8 w-48"
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          </div>

          {/* Right: User Profile & Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Coach</span>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onNotifications}
              className="relative"
            >
              <Bell className="h-4 w-4" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddNew}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
