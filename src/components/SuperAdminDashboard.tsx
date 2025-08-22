import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserManagement } from './UserManagement';
import { Shield } from 'lucide-react';

export function SuperAdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'super_admin') return;
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 animate-pulse text-brand-blue" />
          <span>Loading super admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-brand-blue" />
          Super Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          System-wide management and analytics for Real Estate Photographer Pro
        </p>
      </div>

      {/* User Management Section */}
      <UserManagement />
    </div>
  );
}