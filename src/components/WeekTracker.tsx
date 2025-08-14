import React from 'react';
import { User } from '../types';
import { getCoachingWeekInfo, calculateCoachingWeek } from '../utils/dateUtils';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Calendar, Clock, Info } from 'lucide-react';
import { addDays, formatDate } from '../utils/dateUtils';

interface WeekTrackerProps {
  user: User;
  variant?: 'compact' | 'detailed' | 'pill' | 'progress';
  showTotal?: boolean;
  className?: string;
}

export function WeekTracker({ user, variant = 'compact', showTotal = false, className = '' }: WeekTrackerProps) {
  const today = new Date();
  
  // Determine which date to use for week calculation
  let startDate: string | null = null;
  let totalWeeks = 26; // Default 6 months = 26 weeks
  
  if (user.role === 'user') {
    if (!user.has_paid && user.coaching_term_start) {
      // Free users: use coaching term dates
      startDate = user.coaching_term_start;
      if (user.coaching_term_end) {
        const start = new Date(user.coaching_term_start);
        const end = new Date(user.coaching_term_end);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        totalWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
      }
    } else if (user.has_paid && user.access_start) {
      // Paid users: use access period
      startDate = user.access_start;
      if (user.access_end) {
        const start = new Date(user.access_start);
        const end = new Date(user.access_end);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        totalWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
      }
    }
  }

  if (!startDate) {
    return null;
  }

  const weekInfo = getCoachingWeekInfo(startDate, today);
  const currentWeek = weekInfo.weekNumber;
  const isActive = !weekInfo.isBeforeWeek1;
  const progressPercentage = Math.min((currentWeek / totalWeeks) * 100, 100);

  // Tooltip content with calculation explanation
  const tooltipContent = (
    <div className="space-y-2 text-sm text-white">
      <p><strong>Week Calculation:</strong></p>
      <p>Start Date: {new Date(startDate).toLocaleDateString()}</p>
      <p>Week 1 Start: {weekInfo.week1Start.toLocaleDateString()}</p>
      <p>Today: {today.toLocaleDateString()}</p>
      <p className="text-xs text-white mt-2">
        Weeks start on Monday. If start date isn't Monday, Week 1 begins the following Monday.
      </p>
    </div>
  );

  // Compact variant - small badge
  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`inline-flex items-center space-x-1 ${className}`}>
              <Badge 
                variant={isActive ? 'default' : 'secondary'} 
                className={`text-xs ${isActive ? 'bg-brand-blue hover:bg-brand-blue/90' : ''}`}
              >
{weekInfo.isBeforeWeek1 ? 'Starting Soon' : `Week ${currentWeek}`}
              </Badge>
              <Info className="h-3 w-3 text-muted-foreground" />
            </div>
          </TooltipTrigger>
          <TooltipContent>{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Pill variant - larger, more prominent
  if (variant === 'pill') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`inline-flex items-center space-x-2 ${className}`}>
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                isActive 
                  ? 'bg-brand-blue text-white' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
              }`}>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>
{weekInfo.isBeforeWeek1 ? 'Starting Soon' : `Week ${currentWeek}`}
                  </span>
                </div>
              </div>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </div>
          </TooltipTrigger>
          <TooltipContent>{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Progress variant - clean week display without progress bar
  if (variant === 'progress') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`space-y-2 ${className}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-brand-blue" />
                  <span className="text-sm font-medium">
                    {weekInfo.isBeforeWeek1 
                      ? 'Program starts soon' 
                      : `You're in Week ${currentWeek} of your program`
                    }
                  </span>
                </div>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </div>
              
              {/* Optional: Show current week date range */}
              {isActive && (
                <div className="text-xs text-muted-foreground">
                  {getCurrentWeekDateRange(weekInfo.week1Start, currentWeek)}
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Detailed variant - full information display
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`space-y-3 ${className}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-brand-blue" />
                <div>
                  <p className="font-medium text-sm">Current Week</p>
                  <p className="text-xs text-muted-foreground">
                    {user.has_paid ? 'Access Period' : 'Coaching Program'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant={isActive ? 'default' : 'secondary'} 
                  className={`text-lg px-3 py-1 ${isActive ? 'bg-brand-blue hover:bg-brand-blue/90' : ''}`}
                >
{weekInfo.isBeforeWeek1 ? 'Starting Soon' : `Week ${currentWeek}`}
                </Badge>

              </div>
            </div>
            
            {showTotal && totalWeeks && isActive && (
              <div className="text-xs text-muted-foreground">
                {totalWeeks - currentWeek > 0 
                  ? `${totalWeeks - currentWeek} weeks remaining in program`
                  : 'Program completed!'
                }
              </div>
            )}

            <div className="text-xs text-muted-foreground flex items-center space-x-1">
              <Info className="h-3 w-3" />
              <span>Click for calculation details</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>{tooltipContent}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Utility function to get week info for any user (for use in coach/admin views)
export function getUserWeekInfo(user: User, currentDate: Date = new Date()) {
  let startDate: string | null = null;
  let totalWeeks = 26;
  
  if (user.role === 'user') {
    if (!user.has_paid && user.coaching_term_start) {
      startDate = user.coaching_term_start;
      if (user.coaching_term_end) {
        const start = new Date(user.coaching_term_start);
        const end = new Date(user.coaching_term_end);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        totalWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
      }
    } else if (user.has_paid && user.access_start) {
      startDate = user.access_start;
      if (user.access_end) {
        const start = new Date(user.access_start);
        const end = new Date(user.access_end);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        totalWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
      }
    }
  }

  if (!startDate) {
    return null;
  }

  const weekInfo = getCoachingWeekInfo(startDate, currentDate);
  const isActive = !weekInfo.isBeforeWeek1;
  
  return {
    ...weekInfo,
    totalWeeks,
    startDate,
    weekDateRange: isActive ? getCurrentWeekDateRange(weekInfo.week1Start, weekInfo.weekNumber) : null
  };
}

// Helper function to get current week date range
function getCurrentWeekDateRange(week1Start: Date, weekNumber: number): string {
  if (weekNumber <= 0) return '';
  
  const weekStart = addDays(week1Start, (weekNumber - 1) * 7);
  const weekEnd = addDays(weekStart, 6);
  
  return `${formatDate(weekStart, 'MMM d')} – ${formatDate(weekEnd, 'MMM d')}`;
}