import React, { useState, useCallback } from "react";
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from "../contexts/NavigationContext";
import { getPrimaryRole } from "../utils/roleUtils";
import { Header } from "./Header";
import LoadingScreen from "./LoadingScreen";
import { DateAndWeekDisplay } from "./DateAndWeekDisplay";
import { EditOwnProfile } from "./EditOwnProfile";
import { WeeklyReports } from "./WeeklyReports";
import { Goals } from "./Goals";
import { Pricing } from "./Pricing";
import { CoachPricing } from "./CoachPricing";
import { KPIDashboard } from "./KPIDashboard";
import { Leads } from "./Leads";
import { StudentLead } from "./StudentLead";
import { ProfitMarginCalculator } from "./ProfitMarginCalculator";
import ProfitCalculator from "./ProfitCalculator";
import { AdminDashboard } from "./AdminDashboard";
import { SuperAdminDashboard } from "./SuperAdminDashboard";
import { CoachManagerDashboard } from "./CoachManagerDashboard";
import { EnhancedCoachDashboard } from "./EnhancedCoachDashboard";
import { EnhancedStudentDashboard } from "./EnhancedStudentDashboard";
import { SuperAdminUserPanel } from "./SuperAdminUserPanel";
import { SuperAdminList } from "./SuperAdminList";
import { SuperAdminDataManagement } from "./SuperAdminDataManagement";
import { UserManagement } from "./UserManagement";
import { StudentProfile } from "./StudentProfile";
import { CoachCallLog } from "./CoachCallLog";
import { CoachNotes } from "./CoachNotes";
import { StudentCallLog } from "./StudentCallLog";
import { StudentNotes } from "./StudentNotes";
import { RolePermissionsManager } from "./RolePermissionsManager";
import { RoleImplementationStatus } from "./RoleImplementationStatus";
import { SubscriptionInfo } from "./SubscriptionInfo";
import { UserTypes } from "./UserTypes";
import { RoleTest } from "./RoleTest";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { eightbaseService } from "../services/8baseService";
import { User } from "../types";
import {
  Home,
  Target,
  FileText,
  DollarSign,
  Users,
  Calculator,
  Shield,
  Crown,
  Phone,
  GraduationCap,
  ShieldCheck,
  BarChart3,
  CheckCircle,
  CreditCard,
  X,
  Settings,
  Heart,
  Quote,
  User as UserIcon,
  UserCircle2,
  Database,
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

export function Dashboard() {
  const { user } = useAuth();
  const { currentView, currentStudentId, navigateToDashboard, navigateToStudentProfile } =
    useNavigation();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] =
    useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("home");

  // Get user's primary role for display purposes
  const userRoleDisplay = user ? getPrimaryRole(user) : 'User';
  // Use the internal role value for logic - ensure consistency
  const userRole = user?.role || 'user';
  
  // Debug logging to help identify role issues


  const loadStudent = useCallback(async (studentId: string) => {
    try {
      const users = await eightbaseService.getUsers();
      const student = users.find((u: User) => u.id === studentId);
      setCurrentStudent(student || null);
    } catch (error) {
      console.error("Failed to load student:", error);
    }
  }, []);

  React.useEffect(() => {
    if (currentView === "student-profile" && currentStudentId) {
      loadStudent(currentStudentId);
    }
  }, [currentView, currentStudentId, loadStudent]);


  const getSidebarItems = (): SidebarItem[] => {
    const baseItems: SidebarItem[] = [
      { id: "home", label: "Home", icon: Home },
    ];

    // Student: Clean UI with only accessible features
    if (userRole === "user") {
      return [
        ...baseItems,
        { id: "goals", label: "Goals", icon: Target },
        {
          id: "reports",
          label: "Weekly Reports",
          icon: FileText,
        },
        { id: "leads", label: "My Leads", icon: Users },
        {
          id: "calculator",
          label: "Profit Calculator",
          icon: Calculator,
        },
        {
          id: "student-calls",
          label: "My Call Logs",
          icon: Phone,
        },
        {
          id: "student-notes",
          label: "My Notes",
          icon: FileText,
        },
      ];
    }

    // Coach: Clean UI with only accessible features
    if (userRole === "coach") {
      return [
        ...baseItems,
        { id: "goals", label: "Goals", icon: Target },
        { id: "leads", label: "Leads", icon: Users },
        {
          id: "calculator",
          label: "Profit Calculator",
          icon: Calculator,
        },
        {
          id: "user-management",
          label: "My Assigned Students",
          icon: GraduationCap,
        },
        {
          id: "coach-calls",
          label: "Call Logs",
          icon: Phone,
        },
        {
          id: "coach-notes",
          label: "Notes",
          icon: FileText,
        },
      ];
    }

    // Coach Manager: Clean UI with management features + coach features
    if (userRole === "coach_manager") {
      return [
        ...baseItems,
        {
          id: "coach-manager",
          label: "Coach Manager Panel",
          icon: ShieldCheck,
        },
        {
          id: "coach-dashboard",
          label: "Coach Dashboard",
          icon: Shield,
        },
        { id: "goals", label: "Goals", icon: Target },
        { id: "leads", label: "All Leads", icon: Users },
        {
          id: "coach-calls",
          label: "Call Logs",
          icon: Phone,
        },
        {
          id: "coach-notes",
          label: "Notes",
          icon: FileText,
        },
        {
          id: "coach-pricing",
          label: "Pricing Management",
          icon: DollarSign,
        },
        { id: "kpis", label: "KPI Dashboard", icon: BarChart3 },
        {
          id: "calculator",
          label: "Profit Calculator",
          icon: Calculator,
        },
        {
          id: "user-management",
          label: "User Management",
          icon: Users,
        },
      ];
    }

    // Super Admin: Access to everything
    if (userRole === "super_admin") {
      return [
        ...baseItems,
        {
          id: "super-admin-panel",
          label: "Super Admin Panel",
          icon: Crown,
        },
        {
          id: "coach-manager",
          label: "Coach Manager Data",
          icon: ShieldCheck,
        },
        { id: "leads", label: "All Leads", icon: Users },
        {
          id: "coach-pricing",
          label: "Pricing Management",
          icon: DollarSign,
        },
        { id: "kpis", label: "KPI Dashboard", icon: BarChart3 },
        // {
        //   id: "calculator",
        //   label: "Profit Calculator",
        //   icon: Calculator,
        // },
        {
          id: "user-management",
          label: "User Management",
          icon: Users,
        },
        {
          id: "data-management",
          label: "Data Management",
          icon: Database,
        },
        // {
        //   id: "role-permissions",
        //   label: "Role Permissions",
        //   icon: Crown,
        // },
        {
          id: "user-types",
          label: "User Types Overview",
          icon: Users,
        },
        // {
        //   id: "role-test",
        //   label: "Role Test",
        //   icon: Users,
        // },
      ];
    }

    return baseItems;
  };

  const handleTabChange = async (tabId: string) => {
    setActiveTab(tabId);
    
    // Log navigation activity for Recent Activity feed (only for non-home pages)
    if (user?.id && tabId !== 'home') {
      try {
        const { NotificationUtils } = await import('../utils/notificationUtils');
        NotificationUtils.logActivity(user.id, 'login', { 
          page: tabId,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error logging navigation activity:', error);
      }
    }
  };
  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        if (userRole === "super_admin") {
          return <SuperAdminDashboard />;
        } else if (userRole === "coach_manager") {
          return <CoachManagerDashboard />;
        } else if (userRole === "coach") {
          return <EnhancedCoachDashboard />;
        } else {
          return (
            <EnhancedStudentDashboard
              onEditProfile={() => setEditProfileOpen(true)}
              onNavigate={handleTabChange}
            />
          );
        }
      case "goals":
        return <Goals />;
      case "reports":
        return <WeeklyReports />;
      case "subscription":
        return <SubscriptionInfo user={user} />;
      case "pricing":
        return <Pricing />;
      case "coach-pricing":
        return <CoachPricing />;
      case "leads":
        if (userRole === "user") {
          return <StudentLead />;
        } else {
          return <Leads />;
        }
      case "calculator":
        return <ProfitCalculator />;
      case "kpis":
        return <KPIDashboard />;
      case "user-management":
        return <UserManagement />;
      case "data-management":
        return <SuperAdminDataManagement />;
      case "coach-calls":
        return <CoachCallLog />;
      case "coach-notes":
        return <CoachNotes />;
      case "student-calls":
        return <StudentCallLog />;
      case "student-notes":
        return <StudentNotes />;
      case "coach-manager":
        return <CoachManagerDashboard />;
      case "coach-dashboard":
        return <EnhancedCoachDashboard />;
      case "super-admin-panel":
        return <SuperAdminUserPanel />;
      case "super-admin-list":
        return <SuperAdminList />;
      case "admin-dashboard":
        // Only allow super_admin to access AdminDashboard
        if (userRole === "super_admin") {
          return <AdminDashboard />;
        } else {
          return <div>Access denied. Admin dashboard is only available for administrators.</div>;
        }
      case "role-permissions":
        return <RolePermissionsManager />;
      case "user-types":
        return <UserTypes />;
      case "role-test":
        return <RoleTest />;
      default:
        return <div>Page not found</div>;
    }
  };

  if (!user) return null;

  // Show student profile view
  if (currentView === "student-profile" && currentStudent) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          showEditProfile={
            userRole === "user" &&
            user.id === currentStudent.id
          }
          onEditProfile={() => setEditProfileOpen(true)}
        />
        <main className="container mx-auto px-4 py-6">
          <StudentProfile
            student={currentStudent}
          />
        </main>
        {userRole === "user" &&
          user.id === currentStudent.id && (
            <EditOwnProfile />
          )}
      </div>
    );
  }

  const sidebarItems = getSidebarItems();

  // Don't render if user is not loaded
  if (!user) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        showEditProfile={userRole === "user"}
        onEditProfile={() => setEditProfileOpen(true)}
      />
      <main className="max-w-[90%] mx-auto px-4 py-6">
        <div className="space-y-6">
          <DateAndWeekDisplay user={user} />

          {/* Clean role-based navigation */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                    <Shield className="h-5 w-5" />
                    Navigation
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge
                      className={
                        userRole === "super_admin"
                          ? "bg-purple-100 text-purple-800"
                          : userRole === "coach_manager"
                            ? "bg-blue-100 text-blue-800"
                            : userRole === "coach"
                              ? "bg-green-100 text-green-800"
                              : "bg-muted text-muted-foreground"
                      }
                    >
                      {userRoleDisplay}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-1">
                    {sidebarItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;

                      return (
                        <Button
                          key={item.id}
                          variant={
                            isActive ? "default" : "ghost"
                          }
                          className="w-full justify-start"
                          onClick={() =>
                            handleTabChange(item.id)
                          }
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </Button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Profile Button - Only for students */}
      {userRole === "user" && (
        <Button
          onClick={() => setSubscriptionModalOpen(true)}
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg bg-brand-blue hover:bg-brand-blue/90 text-white z-40 group"
          size="icon"
          title="Profile & Account Settings"
        >
          <UserIcon className="h-5 w-5" />
          <span className="absolute right-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Profile & Settings
          </span>
        </Button>
      )}

      {/* Edit Profile Modal/Overlay */}
      {editProfileOpen && userRole === "user" && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setEditProfileOpen(false)}
        >
          <div 
            className="bg-white dark:bg-[#1A1A1A] rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Your Profile</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditProfileOpen(false)}
                  className="h-8 w-8 p-0 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <EditOwnProfile onClose={() => setEditProfileOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Subscription Settings Modal */}
      {subscriptionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Profile & Account Settings</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSubscriptionModalOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <SubscriptionInfo user={user} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}