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
import { AdminDashboard } from "./AdminDashboard";
import { SuperAdminDashboard } from "./SuperAdminDashboard";
import { CoachManagerDashboard } from "./CoachManagerDashboard";
import { SuperAdminUserPanel } from "./SuperAdminUserPanel";
import { UserManagement } from "./UserManagement";
import { StudentProfile } from "./StudentProfile";
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
  GraduationCap,
  ShieldCheck,
  BarChart3,
  CheckCircle,
  CreditCard,
  X,
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
  const [currentStudent, setCurrentStudent] =
    useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("home");

  // Get user's primary role for display purposes
  const userRoleDisplay = user ? getPrimaryRole(user) : 'User';
  // Use the internal role value for logic
  const userRole = user?.role || 'user';

  console.log("🚀 ~ Dashboard ~ user:", user)
  console.log("User role:", user?.role)
  console.log("User role from getPrimaryRole:", user ? getPrimaryRole(user) : 'No user')
  console.log("userRole for sidebar:", userRole)
  console.log("userRoleDisplay for badge:", userRoleDisplay)

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
        {
          id: "subscription",
          label: "Subscription",
          icon: CreditCard,
        },
        { id: "leads", label: "My Leads", icon: Users },
      ];
    }

    // Coach: Clean UI with only accessible features
    if (userRole === "coach") {
      return [
        ...baseItems,
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
      ];
    }

    // Coach Manager: Clean UI with management features
    if (userRole === "coach_manager") {
      return [
        ...baseItems,
        {
          id: "coach-manager",
          label: "Coach Manager Panel",
          icon: ShieldCheck,
        },
        { id: "leads", label: "All Leads", icon: Users },
        {
          id: "calculator",
          label: "Profit Calculator",
          icon: Calculator,
        },
        {
          id: "coach-pricing",
          label: "Pricing Management",
          icon: DollarSign,
        },
        { id: "kpis", label: "KPI Dashboard", icon: BarChart3 },
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
          id: "calculator",
          label: "Profit Calculator",
          icon: Calculator,
        },
        {
          id: "coach-pricing",
          label: "Pricing Management",
          icon: DollarSign,
        },
        { id: "kpis", label: "KPI Dashboard", icon: BarChart3 },
        {
          id: "user-management",
          label: "User Management",
          icon: Users,
        },
        {
          id: "role-permissions",
          label: "Role Permissions",
          icon: Crown,
        },
        {
          id: "implementation-status",
          label: "Implementation Status",
          icon: CheckCircle,
        },
        {
          id: "admin-dashboard",
          label: "Admin Dashboard",
          icon: Shield,
        },
        {
          id: "user-types",
          label: "User Types Overview",
          icon: Users,
        },

        {
          id: "role-test",
          label: "Role Test",
          icon: Users,
        },
      ];
    }

    return baseItems;
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };
  console.log(user, "user name")
  console.log("User role:", user?.role)
  console.log("User role from getPrimaryRole:", user ? getPrimaryRole(user) : 'No user')

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        if (user?.role === "super_admin") {
          console.log("Rendering SuperAdminDashboard")
          return <SuperAdminDashboard />;
        } else if (user?.role === "coach_manager") {
          console.log("Rendering CoachManagerDashboard")
          return <CoachManagerDashboard />;
        } else if (user?.role === "coach") {
          console.log("Rendering AdminDashboard")
          return <AdminDashboard />;
        } else {
          console.log("Rendering Student Dashboard - user role:", user?.role)
          return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content - Student Dashboard */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-brand-gray">
                    Welcome back,{" "}
                    <span className="text-brand-blue">
                      {user?.name}
                    </span>
                  </h1>
                  <p className="text-muted-foreground mb-6">
                    Track your real estate photography business
                    progress
                  </p>
                </div>
                <WeeklyReports />
              </div>

              {/* Right Sidebar - Subscription Info */}
              <div className="lg:col-span-1">
                <SubscriptionInfo user={user} />
              </div>
            </div>
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
        if (user?.role === "user") {
          return <StudentLead />;
        } else {
          return <Leads />;
        }
      case "calculator":
        return <ProfitMarginCalculator />;
      case "kpis":
        return <KPIDashboard />;
      case "user-management":
        return <UserManagement />;
      case "coach-manager":
        return <CoachManagerDashboard />;
      case "super-admin-panel":
        return <SuperAdminUserPanel />;
      case "admin-dashboard":
        return <AdminDashboard />;
      case "role-permissions":
        return <RolePermissionsManager />;
      case "implementation-status":
        return <RoleImplementationStatus />;
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
            user.role === "user" &&
            user.id === currentStudent.id
          }
          onEditProfile={() => setEditProfileOpen(true)}
        />
        <main className="container mx-auto px-4 py-6">
          <StudentProfile
            student={currentStudent}
          />
        </main>
        {user.role === "user" &&
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
                  <CardTitle className="flex items-center gap-2">
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
                              : "bg-gray-100 text-gray-800"
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

                  {/* Clean access level info */}
                  <div className="mt-6 p-3 bg-muted rounded-lg">
                    <div className="text-xs font-medium mb-1">
                      Access Level
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {userRole === "super_admin" &&
                        "🔓 Full platform access + role management"}
                      {userRole === "coach_manager" &&
                        "🔓 Manage all coaches/students + KPIs + pricing"}
                      {userRole === "coach" &&
                        "🔓 View assigned students + coaching tools"}
                      {userRole === "user" &&
                        "🔓 Personal dashboard + learning resources"}
                    </div>
                  </div>
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

      {/* Edit Profile Modal/Overlay */}
      {editProfileOpen && userRole === "user" && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Edit Profile</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditProfileOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <EditOwnProfile />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}