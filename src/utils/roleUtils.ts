// Helper function to get user roles
export function getUserRoles(user: any): string[] {
  // Handle different role structures
  let roles: any[] = [];
  
  // Check for Auth0 roles
  if (user?.['https://api.8base.com/roles']) {
    roles = user['https://api.8base.com/roles'];
  }
  // Check for 8base roles structure
  else if (user?.roles?.items) {
    roles = user.roles.items;
  }
  // Check for simple roles array
  else if (user?.roles) {
    roles = user.roles;
  }
  
  // Extract role names from objects or use strings directly
  return roles.map(role => {
    if (typeof role === 'string') {
      return role;
    }
    if (role?.name) {
      return role.name;
    }
    return role;
  }).filter(Boolean);
}

// Helper function to check if user has a specific role
export function hasRole(user: any, role: string): boolean {
  const roles = getUserRoles(user);
  return roles.includes(role);
}

// Helper function to check if user has any of the specified roles
export function hasAnyRole(user: any, roles: string[]): boolean {
  const userRoles = getUserRoles(user);
  return roles.some(role => userRoles.includes(role));
}

// Helper function to get dashboard route based on user role
export function getDashboardRoute(user: any): string {
  const roles = getUserRoles(user);
  
  if (roles.includes('SuperAdmin') || roles.includes('Administrator')) {
    return '/super-admin-dashboard';
  }
  
  if (roles.includes('Coach Manager')) {
    return '/coach-manager-dashboard';
  }
  
  if (roles.includes('Coach')) {
    return '/coach-dashboard';
  }
  
  if (roles.includes('Student')) {
    return '/student-dashboard';
  }
  
  // Default dashboard for other roles or no specific role
  return '/home';
}

// Helper function to get user's primary role (highest priority)
export function getPrimaryRole(user: any): string {
  const roles = getUserRoles(user);
  
  if (roles.includes('SuperAdmin') || roles.includes('Super Admin') || roles.includes('Administrator')) {
    return 'Super Admin';
  }
  
  if (roles.includes('Coach Manager')) {
    return 'Coach Manager';
  }
  
  if (roles.includes('Coach')) {
    return 'Coach';
  }
  
  if (roles.includes('Student')) {
    return 'Student';
  }
  
  return 'User';
} 