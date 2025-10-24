import { Suspense, lazy, useState, useEffect, ReactNode } from "react";
import LoadingScreen from "../components/LoadingScreen";

// ----------------------------------------------------------------------

interface LoadableProps {
  children?: ReactNode;
  [key: string]: any;
}

const Loadable = (Component: React.ComponentType<any>) => {
  const LoadableComponent = (props: LoadableProps) => {
    const [showFallback, setShowFallback] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setShowFallback(true), 300);
      return () => clearTimeout(timer);
    }, []);

    return (
      <Suspense fallback={showFallback ? <LoadingScreen /> : null}>
        <Component {...props} />
      </Suspense>
    );
  };

  return LoadableComponent;
};

// ----------------------------------------------------------------------

// Auth pages
export const LoginPage = Loadable(lazy(() => import("../components/Login").then(module => ({ default: module.Login }))));
export const AuthCallbackPage = Loadable(lazy(() => import("../components/AuthCallback").then(module => ({ default: module.AuthCallback }))));
export const StudentLoginPage = Loadable(lazy(() => import("../components/StudentLogin").then(module => ({ default: module.StudentLogin }))));
export const CoachLoginPage = Loadable(lazy(() => import("../components/CoachLogin").then(module => ({ default: module.CoachLogin }))));

// Main dashboard pages
export const Dashboard = Loadable(lazy(() => import("../components/Dashboard").then(module => ({ default: module.Dashboard }))));
export const Home = Loadable(lazy(() => import("../components/Dashboard").then(module => ({ default: module.Dashboard }))));

// User management
export const UserManagementPage = Loadable(lazy(() => import("../components/UserManagement").then(module => ({ default: module.UserManagement }))));
export const AddUserModal = Loadable(lazy(() => import("../components/AddUserModal").then(module => ({ default: module.AddUserModal }))));

// Student related
export const StudentProfile = Loadable(lazy(() => import("../components/StudentProfile").then(module => ({ default: module.StudentProfile }))));
export const StudentWeekOverview = Loadable(lazy(() => import("../components/StudentWeekOverview").then(module => ({ default: module.StudentWeekOverview }))));
export const StudentSignUpModal = Loadable(lazy(() => import("../components/StudentSignUpModal").then(module => ({ default: module.StudentSignUpModal }))));
export const StudentDashboard = Loadable(lazy(() => import("../components/Dashboard").then(module => ({ default: module.Dashboard }))));

// Coaching related
export const CoachDashboard = Loadable(lazy(() => import("../components/CoachInterface").then(module => ({ default: module.CoachInterface }))));
export const CoachManagerDashboard = Loadable(lazy(() => import("../components/CoachManagerDashboard").then(module => ({ default: module.CoachManagerDashboard }))));
export const CoachPricing = Loadable(lazy(() => import("../components/CoachPricing").then(module => ({ default: module.CoachPricing }))));
export const CoachingTermInfo = Loadable(lazy(() => import("../components/CoachingTermInfo").then(module => ({ default: module.CoachingTermInfo }))));
export const CoachManagement = Loadable(lazy(() => import("../components/CoachManagement").then(module => ({ default: module.CoachManagement }))));
export const CoachProfileDashboard = Loadable(lazy(() => import("../components/CoachProfileDashboard").then(module => ({ default: module.CoachProfileDashboard }))));
export const EnhancedCoachDashboard = Loadable(lazy(() => import("../components/EnhancedCoachDashboard").then(module => ({ default: module.EnhancedCoachDashboard }))));
export const StudentProfileView = Loadable(lazy(() => import("../components/StudentProfileView").then(module => ({ default: module.StudentProfileView }))));

// Admin related
export const AdminDashboard = Loadable(lazy(() => import("../components/AdminDashboard").then(module => ({ default: module.AdminDashboard }))));
export const SuperAdminDashboard = Loadable(lazy(() => import("../components/SuperAdminDashboard").then(module => ({ default: module.SuperAdminDashboard }))));
export const SuperAdminUserPanel = Loadable(lazy(() => import("../components/SuperAdminUserPanel").then(module => ({ default: module.SuperAdminUserPanel }))));
export const SuperAdminList = Loadable(lazy(() => import("../components/SuperAdminList").then(module => ({ default: module.SuperAdminList }))));

// Role management
export const RolePermissionsManager = Loadable(lazy(() => import("../components/RolePermissionsManager").then(module => ({ default: module.RolePermissionsManager }))));
export const RolePermissionsMatrix = Loadable(lazy(() => import("../components/RolePermissionsMatrix").then(module => ({ default: module.RolePermissionsMatrix }))));
export const RoleImplementationStatus = Loadable(lazy(() => import("../components/RoleImplementationStatus").then(module => ({ default: module.RoleImplementationStatus }))));
export const RoleSystemSummary = Loadable(lazy(() => import("../components/RoleSystemSummary").then(module => ({ default: module.RoleSystemSummary }))));

// Business related
export const Leads = Loadable(lazy(() => import("../components/Leads").then(module => ({ default: module.Leads }))));
export const Goals = Loadable(lazy(() => import("../components/Goals").then(module => ({ default: module.Goals }))));
export const WeeklyReports = Loadable(lazy(() => import("../components/WeeklyReports").then(module => ({ default: module.WeeklyReports }))));
export const WeekTracker = Loadable(lazy(() => import("../components/WeekTracker").then(module => ({ default: module.WeekTracker }))));
export const KPIDashboard = Loadable(lazy(() => import("../components/KPIDashboard").then(module => ({ default: module.KPIDashboard }))));
export const ProfitMarginCalculator = Loadable(lazy(() => import("../components/ProfitCalculator")));
export const Pricing = Loadable(lazy(() => import("../components/Pricing").then(module => ({ default: module.Pricing }))));

// User profile
export const Profile = Loadable(lazy(() => import("../components/StudentProfile").then(module => ({ default: module.StudentProfile }))));
export const EditOwnProfile = Loadable(lazy(() => import("../components/EditOwnProfile").then(module => ({ default: module.EditOwnProfile }))));

// Subscription
export const SubscriptionInfo = Loadable(lazy(() => import("../components/SubscriptionInfo").then(module => ({ default: module.SubscriptionInfo }))));

// Email templates
export const EmailTemplatePreview = Loadable(lazy(() => import("../components/EmailTemplatePreview").then(module => ({ default: module.EmailTemplatePreview }))));

// Implementation
export const ImplementationSummary = Loadable(lazy(() => import("../components/ImplementationSummary").then(module => ({ default: module.ImplementationSummary }))));

// Careers
export const CareersPage = Loadable(lazy(() => import("../components/Dashboard").then(module => ({ default: module.Dashboard }))));

// Email testing
export const EmailTestPanel = Loadable(lazy(() => import("../components/EmailTestPanel").then(module => ({ default: module.EmailTestPanel }))));

// Todo Lists and Reminders
export const TodoListManager = Loadable(lazy(() => import("../components/TodoListManager").then(module => ({ default: module.TodoListManager }))));
export const ReminderManager = Loadable(lazy(() => import("../components/ReminderManager").then(module => ({ default: module.ReminderManager }))));

// 404 page
export const Page404 = Loadable(lazy(() => import("../components/Dashboard").then(module => ({ default: module.Dashboard })))); 