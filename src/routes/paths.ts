// ----------------------------------------------------------------------

function path(root: string, sublink: string): string {
  return `${root}${sublink}`;
}

const ROOTS_DASHBOARD = "/dashboard";

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  login: "/auth/login",
  callback: "/auth/callback",
};

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  
  // Main dashboard pages
  home: "/home",
  dashboard: "/dashboard",
  
  // User management
  userManagement: {
    root: path(ROOTS_DASHBOARD, "/user-management"),
    list: path(ROOTS_DASHBOARD, "/user-management/list"),
    new: path(ROOTS_DASHBOARD, "/user-management/new"),
    edit: (name: string) => path(ROOTS_DASHBOARD, `/user-management/${name}/edit`),
  },
  
  // Student related
  studentProfile: "/student-profile",
  studentWeekOverview: "/student-week-overview",
  studentLogin: "/student-login",
  
  // Coaching related
  coachDashboard: "/coach-dashboard",
  coachManagerDashboard: "/coach-manager-dashboard",
  coachPricing: "/coach-pricing",
  coachingTermInfo: "/coaching-term-info",
  
  // Admin related
  adminDashboard: "/admin-dashboard",
  superAdminDashboard: "/super-admin-dashboard",
  superAdminUserPanel: "/super-admin-user-panel",
  
  // Role management
  rolePermissionsManager: "/role-permissions-manager",
  rolePermissionsMatrix: "/role-permissions-matrix",
  roleImplementationStatus: "/role-implementation-status",
  roleSystemSummary: "/role-system-summary",
  
  // Business related
  leads: "/leads",
  goals: "/goals",
  weeklyReports: "/weekly-reports",
  weekTracker: "/week-tracker",
  kpiDashboard: "/kpi-dashboard",
  profitMarginCalculator: "/profit-margin-calculator",
  pricing: "/pricing",
  
  // User profile
  profile: "/my-profile",
  editOwnProfile: "/edit-own-profile",
  
  // Subscription
  subscriptionInfo: "/subscription-info",
  
  // Email templates
  emailTemplatePreview: "/email-template-preview",
  
  // Implementation
  implementationSummary: "/implementation-summary",
  
  // Careers
  careers: "/careers",
};

export const PATH_AFTER_LOGIN = PATH_DASHBOARD.home; 