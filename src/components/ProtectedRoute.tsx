import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { hasRole } from '../utils/roleUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { authState } = useAuth();
  
  // Debug logging
  console.log('ProtectedRoute Debug:', {
    requiredRole,
    user: authState.user,
    userRole: authState.user?.role,
    loading: authState.loading
  });
  
  if (authState.loading) return <div>Loading...</div>;
  
  // Check if user has the required role or any of its variations
  const hasRequiredRole = (() => {
    if (!authState.user) {
      console.log('No user found');
      return false;
    }
    
    // Map role variations
    const roleVariations: { [key: string]: string[] } = {
      'Coach': ['Coach', 'coach', 'admin'],
      'Coach Manager': ['Coach Manager', 'coach_manager'],
      'Super Admin': ['Super Admin', 'SuperAdmin', 'Administrator', 'super_admin'],
      'Student': ['Student', 'user']
    };
    
    const variations = roleVariations[requiredRole] || [requiredRole];
    
    console.log('Checking role variations:', {
      userRole: authState.user?.role,
      variations,
      requiredRole
    });
    
    // First check the direct role field (case insensitive)
    const directRoleMatch = variations.some(role => 
      role.toLowerCase() === authState.user?.role?.toLowerCase()
    );
    
    // Then check using hasRole function
    const hasRoleMatch = variations.some(role => hasRole(authState.user, role));
    
    const userHasRole = directRoleMatch || hasRoleMatch;
    
    console.log('Role check:', {
      requiredRole,
      variations,
      directRoleMatch,
      hasRoleMatch,
      userHasRole,
      userRole: authState.user.role
    });
    
    return userHasRole;
  })();
  
  if (!hasRequiredRole) {
    console.log('Access denied, redirecting to /home');
    // Redirect to home instead of root to avoid infinite loop
    return <Navigate to="/home" replace />;
  }
  
  console.log('Access granted');
  return <>{children}</>;
}; 