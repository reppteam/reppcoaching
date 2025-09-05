import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AppHeader } from './AppHeader';
import { CoachDashboard } from './CoachDashboard';
import { CoachCallLog } from './CoachCallLog';
import { CoachNotes } from './CoachNotes';
import { CoachStudentManagement } from './CoachStudentManagement';
import { CoachGoalsProgress } from './CoachGoalsProgress';
import { CoachMessaging } from './CoachMessaging';

interface CoachInterfaceProps {
  coachId?: string;
}

export const CoachInterface: React.FC<CoachInterfaceProps> = ({ coachId }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const currentCoachId = coachId || user?.id;

  if (!currentCoachId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg font-medium text-red-800">Coach ID not found</p>
          <p className="text-muted-foreground">Please ensure you are logged in as a coach.</p>
        </div>
      </div>
    );
  }

  const handleSearch = (query: string) => {
    // Handle search functionality
    console.log('Search query:', query);
  };

  const handleAddNew = () => {
    // Handle add new functionality
    console.log('Add new clicked');
  };

  const handleNotifications = () => {
    // Handle notifications
    console.log('Notifications clicked');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* App Header */}
      <AppHeader
        onSearch={handleSearch}
        onAddNew={handleAddNew}
        onNotifications={handleNotifications}
        searchPlaceholder="Search Coach"
      />

      {/* Main Content */}
      <main className="max-w-[90%] mx-auto px-4 py-6">
        {/* Dashboard Content */}
        <CoachDashboard coachId={currentCoachId} />
      </main>
    </div>
  );
};
