import React from "react";
import { useAuth } from '../hooks/useAuth';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { 
  Bell, 
  Plus, 
  Search, 
  User,
  ChevronDown,
  LogOut,
  ArrowLeft,
  Edit
} from "lucide-react";

interface AppHeaderProps {
  onSearch?: (query: string) => void;
  onAddNew?: () => void;
  onNotifications?: () => void;
  searchPlaceholder?: string;
  showEditProfile?: boolean;
  onEditProfile?: () => void;
}

export function AppHeader({
  onSearch,
  onAddNew,
  onNotifications,
  searchPlaceholder = "Search",
  showEditProfile = false,
  onEditProfile
}: AppHeaderProps) {
  const { user, originalUser, logout } = useAuth();

  if (!user) return null;

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    switch (role.toLowerCase()) {
      case 'coach':
        return 'Coach';
      case 'coach_manager':
        return 'Coach Manager';
      case 'super_admin':
        return 'Super Admin';
      case 'administrator':
        return 'Administrator';
      case 'user':
        return 'Student';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  const roleDisplayName = getRoleDisplayName(user.role);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur dark:supports-[backdrop-filter]:bg-black">
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
                placeholder={searchPlaceholder}
                className="pl-8 w-48"
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          </div>

          {/* Right: User Profile & Actions */}
          <div className="flex items-center gap-3">
            {/* Super Admin Viewing As */}
            {originalUser && (
              <div className="hidden lg:flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  Viewing as: {user.firstName} {user.lastName}
                </Badge>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <ArrowLeft className="mr-2 h-3 w-3" />
                  Return to Super Admin
                </Button>
                <Separator orientation="vertical" className="h-6" />
              </div>
            )}

            {/* Edit Profile Button */}
            {showEditProfile && onEditProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditProfile}
                className="text-xs px-2"
              >
                <Edit className="h-4 w-4 mr-1" /> Edit Profile
              </Button>
            )}

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{roleDisplayName}</span>
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

            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
