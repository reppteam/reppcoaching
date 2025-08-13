export interface RoleMapping {
  auth0Role: string;
  appRole: 'user' | 'coach' | 'coach_manager' | 'super_admin';
  permissions: string[];
  description: string;
}

export const ROLE_MAPPINGS: RoleMapping[] = [
  {
    auth0Role: 'student',
    appRole: 'user',
    permissions: [
      'read:own_profile',
      'read:own_dashboard',
      'read:own_goals',
      'read:own_reports'
    ],
    description: 'Student users with basic access'
  },
  {
    auth0Role: 'coach',
    appRole: 'coach',
    permissions: [
      'read:own_profile',
      'read:own_dashboard',
      'read:student_profiles',
      'write:student_goals',
      'read:student_reports',
      'write:coaching_notes'
    ],
    description: 'Coach users with coaching capabilities'
  },
  {
    auth0Role: 'coach_manager',
    appRole: 'coach_manager',
    permissions: [
      'read:own_profile',
      'read:own_dashboard',
      'read:all_students',
      'write:all_students',
      'read:all_coaches',
      'write:coach_assignments',
      'read:all_reports',
      'write:system_settings'
    ],
    description: 'Coach managers with oversight capabilities'
  },
  {
    auth0Role: 'super_admin',
    appRole: 'super_admin',
    permissions: [
      'read:own_profile',
      'read:own_dashboard',
      'read:all_users',
      'write:all_users',
      'read:all_reports',
      'write:all_reports',
      'read:system_settings',
      'write:system_settings',
      'read:audit_logs',
      'write:audit_logs'
    ],
    description: 'Super administrators with full access'
  }
];

export const getRoleByEmail = (email: string): string => {
  const lowerEmail = email.toLowerCase();
  
  if (lowerEmail.includes('admin')) {
    return 'super_admin';
  } else if (lowerEmail.includes('manager')) {
    return 'coach_manager';
  } else if (lowerEmail.includes('coach')) {
    return 'coach';
  } else {
    return 'user'; // Default to student/user role
  }
};

export const getAuth0RoleName = (appRole: string): string => {
  const mapping = ROLE_MAPPINGS.find(m => m.appRole === appRole);
  return mapping?.auth0Role || 'student';
};

export const getAppRoleName = (auth0Role: string): string => {
  const mapping = ROLE_MAPPINGS.find(m => m.auth0Role === auth0Role);
  return mapping?.appRole || 'user';
}; 