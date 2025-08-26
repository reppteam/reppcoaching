import React from "react";
import { Navigate, useRoutes } from "react-router-dom";

// Guards
import { GuestGuard } from "../components/GuestGuard";
import { AuthGuard } from "../components/AuthGuard";
import { CallbackGuard } from "../components/CallbackGuard";
import { ProtectedRoute } from "../components/ProtectedRoute";

// Context
import { useAuthContext } from "../contexts/AuthContext";

// Config
import { PATH_AFTER_LOGIN, PATH_DASHBOARD } from "./paths";

// Elements
import {
  Page404,
  LoginPage,
  AuthCallbackPage,
  StudentLoginPage,
  Dashboard,
  Home,
  UserManagementPage,
  StudentProfile,
  StudentWeekOverview,
  StudentSignUpModal,
  StudentDashboard,
  CoachManagerDashboard,
  CoachPricing,
  CoachingTermInfo,
  AdminDashboard,
  SuperAdminDashboard,
  SuperAdminUserPanel,
  RolePermissionsManager,
  RolePermissionsMatrix,
  RoleImplementationStatus,
  RoleSystemSummary,
  Leads,
  Goals,
  WeeklyReports,
  WeekTracker,
  KPIDashboard,
  ProfitMarginCalculator,
  Pricing,
  Profile,
  EditOwnProfile,
  SubscriptionInfo,
  EmailTemplatePreview,
  ImplementationSummary,
  CareersPage,
} from "./elements";

// ----------------------------------------------------------------------

export default function Router() {
  const { user } = useAuthContext();

  return useRoutes([
    // Auth routes
    {
      path: "auth",
      children: [
        {
          path: "callback",
          element: (
            <CallbackGuard>
              <AuthCallbackPage />
            </CallbackGuard>
          ),
        },

      ],
    },

    // Careers route (public)
    {
      path: "careers/:id?/:apply?",
      element: (
        <GuestGuard>
          <CareersPage />
        </GuestGuard>
      ),
    },

    // Main dashboard routes
    {
      path: "/",
      element: (
        <AuthGuard>
          <Dashboard />
        </AuthGuard>
      ),
      children: [
        { element: <Navigate to={PATH_AFTER_LOGIN} replace />, index: true },
        
        // Home
        {
          path: "home",
          element: <Home />,
        },

        // User Management
        {
          path: "user-management",
          element: <UserManagementPage />,
          children: [
            {
              element: <Navigate to="/user-management/list" replace />,
              index: true,
            },
            {
              path: "list",
              element: (
                             <ProtectedRoute requiredRole="Administrator">
               <UserManagementPage />
             </ProtectedRoute>
              ),
            },
          ],
        },

        // Student related
        {
          path: "student-dashboard",
          element: <StudentDashboard />,
        },
        {
          path: "student-profile/:id?",
          element: <StudentProfile />,
        },
        {
          path: "student-week-overview/:id?",
          element: <StudentWeekOverview />,
        },

        // Coaching related
                 {
           path: "coach-manager-dashboard",
           element: (
             <ProtectedRoute requiredRole="Coach Manager">
               <CoachManagerDashboard />
             </ProtectedRoute>
           ),
         },
         {
           path: "coach-pricing",
           element: (
             <ProtectedRoute requiredRole="Coach Manager">
               <CoachPricing />
             </ProtectedRoute>
           ),
         },
        {
          path: "coaching-term-info",
          element: <CoachingTermInfo />,
        },

        // Admin related
        {
          path: "admin-dashboard",
          element: (
            <ProtectedRoute requiredRole="Administrator">
              <AdminDashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: "super-admin-dashboard",
          element: (
            <ProtectedRoute requiredRole="Super Admin">
              <SuperAdminDashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: "super-admin-user-panel",
          element: (
            <ProtectedRoute requiredRole="Super Admin">
              <SuperAdminUserPanel />
            </ProtectedRoute>
          ),
        },

        // Role management
        {
          path: "role-permissions-manager",
          element: (
            <ProtectedRoute requiredRole="Super Admin">
              <RolePermissionsManager />
            </ProtectedRoute>
          ),
        },
        {
          path: "role-permissions-matrix",
          element: (
            <ProtectedRoute requiredRole="Super Admin">
              <RolePermissionsMatrix />
            </ProtectedRoute>
          ),
        },
        // {
        //   path: "role-implementation-status",
        //   element: (
        //     <ProtectedRoute requiredRole="Super Admin">
        //       <RoleImplementationStatus />
        //     </ProtectedRoute>
        //   ),
        // },
        {
          path: "role-system-summary",
          element: (
            <ProtectedRoute requiredRole="Super Admin">
              <RoleSystemSummary />
            </ProtectedRoute>
          ),
        },

        // Business related
        {
          path: "leads",
          element: (
            <ProtectedRoute requiredRole="Administrator">
              <Leads />
            </ProtectedRoute>
          ),
        },
        {
          path: "goals",
          element: <Goals />,
        },
        {
          path: "weekly-reports",
          element: <WeeklyReports />,
        },
        {
          path: "week-tracker",
          element: <WeekTracker />,
        },
        {
          path: "kpi-dashboard",
          element: (
            <ProtectedRoute requiredRole="Administrator">
              <KPIDashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: "profit-margin-calculator",
          element: (
            <ProtectedRoute requiredRole="Administrator">
              <ProfitMarginCalculator />
            </ProtectedRoute>
          ),
        },
        {
          path: "pricing",
          element: <Pricing />,
        },

        // User profile
        {
          path: "my-profile/:tabId?",
          element: <Profile />,
        },
        {
          path: "edit-own-profile",
          element: <EditOwnProfile />,
        },

        // Subscription
        {
          path: "subscription-info",
          element: <SubscriptionInfo />,
        },

        // Email templates
        {
          path: "email-template-preview",
          element: (
            <ProtectedRoute requiredRole="Administrator">
              <EmailTemplatePreview />
            </ProtectedRoute>
          ),
        },

        // Implementation
        {
          path: "implementation-summary",
          element: (
            <ProtectedRoute requiredRole="Super Admin">
              <ImplementationSummary />
            </ProtectedRoute>
          ),
        },
      ],
    },

    // 404 route
    { path: "404", element: <Page404 /> },
    { path: "*", element: <Navigate to="/404" replace /> },
  ]);
} 