import { useContext, useMemo } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { User } from '../types';

// Helper function to map 8base roles to application roles
const mapRole = (roleName: string): 'user' | 'coach' | 'coach_manager' | 'super_admin' => {
  console.log('Mapping role:', roleName);
  switch (roleName.toLowerCase()) {
    case 'superadmin':
    case 'administrator':
    case 'admin':
      return 'super_admin';
    case 'coach manager':
    case 'coach_manager':
      return 'coach_manager';
    case 'coach':
      return 'coach';
    case 'student':
    case 'user':
    default:
      return 'user';
  }
};

export function useAuth() {
  const { user, isInitialized, isAuthenticated, login, logout } = useAuthContext();
  
  // Convert the AuthContext user to the expected User type
  const convertedUser: User | null = useMemo(() => {
    if (!user) return null;
    
    console.log('Original user object:', user);
    console.log('User roles:', user.roles);
    
    const converted: User = {
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      role: mapRole(user.roles?.[0]?.name || 'user'), // Properly map the role
      access_start: new Date().toISOString().split('T')[0],
      access_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      has_paid: true,
      created_at: user.createdAt,
      coaching_term_start: null,
      coaching_term_end: null
    };

    console.log('Converted user:', converted);
    return converted;
  }, [user?.id, user?.firstName, user?.lastName, user?.email, user?.roles, user?.createdAt]);

  // Memoize authState to prevent infinite re-renders
  const authState = useMemo(() => ({
    loading: !isInitialized,
    user: convertedUser
  }), [isInitialized, convertedUser]);

  return {
    user: convertedUser,
    loading: !isInitialized,
    login,
    logout,
    isAuthorized: isAuthenticated && !!user,
    authState,
    authClient: {
      login,
      logout
    },
    originalUser: user
  };
} 