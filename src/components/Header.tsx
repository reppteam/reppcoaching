
import React from "react";
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from "../contexts/NavigationContext";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { LogOut, ArrowLeft, Home, Edit } from "lucide-react";

interface HeaderProps {
  onEditProfile?: () => void;
  showEditProfile?: boolean;
}

function hasRole(user: any, role: string) {
  const roles = user?.['https://api.8base.com/roles'] || user?.roles || [];
  return roles.includes(role);
}

export function RoleBasedMenu() {
  const { user } = useAuth();
  return (
    <nav>
      <ul>
        {hasRole(user, 'Administrator') && <li>Admin Dashboard</li>}
        {hasRole(user, 'Coach') && <li>Coach Dashboard</li>}
        {hasRole(user, 'Student') && <li>Student Dashboard</li>}
      </ul>
    </nav>
  );
}

export function Header({
  onEditProfile,
  showEditProfile = false,
}: HeaderProps) {
  const { user, originalUser, logout } = useAuth();
  const { currentView, navigateToDashboard } = useNavigation();

  if (!user) return null;

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Coach";
      case "user":
        return "Student";
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin":
        return "default";
      case "admin":
        return "secondary";
      case "user":
        return "outline";
      default:
        return "outline";
    }
  };

  const showHomeButton = currentView !== "dashboard";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur dark:supports-[backdrop-filter]:bg-black">
      <div className="max-w-[90%] mx-auto px-4">
        {/* Unified Responsive Layout */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-2 md:flex-nowrap">
          {/* Left: Logo + Brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <img src="/hedderlogo.png" alt="Logo" className="h-10" />
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-brand-gray">
                REAL <span className="text-brand-blue">ESTATE</span>
              </h1>
              <p className="text-sm text-brand-blue font-medium -mt-1">
                PHOTOGRAPHER PRO
              </p>
            </div>
          </div>

          {/* Center: Role + Edit (mobile/tablet inline) */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto">
            <Badge variant={getRoleBadgeVariant(user.role ?? 'user')}>
              {getRoleDisplayName(user.role ?? 'user')}
            </Badge>
            {showEditProfile && user.role === "user" && onEditProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditProfile}
                className="text-xs px-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Edit className="h-4 w-4 mr-1" /> Edit Profile
              </Button>
            )}
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-3">
            {/* Hide on small screens */}
            {originalUser && (
              <div className="hidden lg:flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                >
                  Viewing as: {user.firstName} {user.lastName}
                </Badge>
                <Button variant="ghost" size="sm" onClick={logout} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ArrowLeft className="mr-2 h-3 w-3" />
                  Return to Super Admin
                </Button>
                <Separator orientation="vertical" className="h-6 bg-gray-200 dark:bg-gray-700" />
              </div>
            )}

            {/* User Info */}
            <div className="hidden md:block text-right truncate max-w-[160px]">
              <p className="text-sm font-medium truncate text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>

            <ThemeToggle />

            <Button variant="ghost" size="sm" onClick={logout} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
