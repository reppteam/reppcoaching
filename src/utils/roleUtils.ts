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
  
  // Check for Super Admin roles
  if (roles.includes('SuperAdmin') || roles.includes('Super Admin') || roles.includes('Administrator') || roles.includes('super_admin')) {
    return '/super-admin-dashboard';
  }
  
  // Check for Coach Manager roles
  if (roles.includes('Coach Manager') || roles.includes('coach_manager')) {
    return '/coach-manager-dashboard';
  }
  
  // Check for Coach roles (including coach managers who can also be coaches)
  if (roles.includes('Coach') || roles.includes('coach') || roles.includes('admin') || roles.includes('Coach Manager') || roles.includes('coach_manager')) {
    return '/coach-dashboard';
  }
  
  // Check for Student roles
  if (roles.includes('Student') || roles.includes('user')) {
    return '/student-dashboard';
  }
  
  // Default dashboard for other roles or no specific role
  return '/home';
}

// Helper function to check if user has both coach and coach_manager roles
export function hasCoachAndCoachManagerRoles(user: any): boolean {
  // First check if user has coach_manager role (which typically includes coach capabilities)
  // In the current system, coach_manager role gives access to KPIs
  if (user?.role === 'coach_manager' || user?.role === 'super_admin') {
    return true;
  }
  
  // For backward compatibility, also check the roles array if available
  const roles = getUserRoles(user);
  
  // Check for both coach and coach_manager roles
  const hasCoach = roles.some(role => 
    role.toLowerCase() === 'coach'
  );
  
  const hasCoachManager = roles.some(role => 
    role.toLowerCase() === 'coach manager' || 
    role.toLowerCase() === 'coach_manager'
  );
  
  return hasCoach && hasCoachManager;
}

// Helper function to check if user has only coach role (not coach_manager)
export function hasOnlyCoachRole(user: any): boolean {
  // Check the primary role field first
  if (user?.role === 'coach') {
    return true;
  }
  
  // For backward compatibility, also check the roles array if available
  const roles = getUserRoles(user);
  
  const hasCoach = roles.some(role => 
    role.toLowerCase() === 'coach'
  );
  
  const hasCoachManager = roles.some(role => 
    role.toLowerCase() === 'coach manager' || 
    role.toLowerCase() === 'coach_manager'
  );
  
  return hasCoach && !hasCoachManager;
}

// Helper function to get user's primary role (highest priority)
export function getPrimaryRole(user: any): string {
  // First check the direct role field (most reliable)
  if (user?.role) {
    switch (user.role) {
      case 'super_admin':
        return 'Super Admin';
      case 'coach_manager':
        return 'Coach Manager';
      case 'coach':
        return 'Coach';
      case 'user':
        return 'Student';
      default:
        return user.role;
    }
  }
  
  // Fallback to roles array if direct role field is not available
  const roles = getUserRoles(user);
  
  if (roles.includes('SuperAdmin') || roles.includes('Super Admin') || roles.includes('Administrator') || roles.includes('super_admin')) {
    return 'Super Admin';
  }
  
  if (roles.includes('Coach Manager') || roles.includes('coach_manager')) {
    return 'Coach Manager';
  }
  
  if (roles.includes('Coach') || roles.includes('coach')) {
    return 'Coach';
  }
  
  if (roles.includes('Student') || roles.includes('user')) {
    return 'Student';
  }
  
  return 'User';
} 