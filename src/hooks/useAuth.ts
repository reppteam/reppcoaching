import { useContext, useMemo } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { User } from '../types';

// Helper function to map 8base roles to application roles
const mapRole = (roleName: string): 'user' | 'coach' | 'coach_manager' | 'super_admin' => {
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
  console.log("🚀 ~ useAuth ~ user:", user)
  
  // Convert the AuthContext user to the expected User type
  const convertedUser: User | null = useMemo(() => {
    if (!user) return null;
    
    const converted: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: mapRole(user.roles?.[0]?.name || 'user'), // Properly map the role
      access_start: new Date().toISOString().split('T')[0],
      access_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      has_paid: true,
      created_at: user.createdAt,
      coaching_term_start: null,
      coaching_term_end: null
    };

    return converted;
  }, [user?.id, user?.name, user?.email, user?.roles, user?.createdAt]);

  // Debug logging
  console.log('AuthContext user:', user);
  console.log('User roles from AuthContext:', user?.roles);
  console.log('Mapped role:', convertedUser?.role);

  return {
    user: convertedUser,
    loading: !isInitialized,
    login,
    logout,
    isAuthorized: isAuthenticated && !!user,
    authState: { loading: !isInitialized, user: convertedUser },
    authClient: {
      login,
      logout
    },
    originalUser: user
  };
} 