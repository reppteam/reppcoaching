import React, { createContext, useContext, useState, ReactNode } from 'react';

type ViewType = 'dashboard' | 'student-profile';

interface NavigationContextType {
  currentView: ViewType;
  currentStudentId: string | null;
  navigateToDashboard: () => void;
  navigateToStudentProfile: (studentId: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);

  const navigateToDashboard = () => {
    setCurrentView('dashboard');
    setCurrentStudentId(null);
  };

  const navigateToStudentProfile = (studentId: string) => {
    setCurrentView('student-profile');
    setCurrentStudentId(studentId);
  };

  return (
    <NavigationContext.Provider value={{
      currentView,
      currentStudentId,
      navigateToDashboard,
      navigateToStudentProfile
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}