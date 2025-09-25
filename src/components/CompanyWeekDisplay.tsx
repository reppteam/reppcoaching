import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Clock } from 'lucide-react';

interface CompanyWeekDisplayProps {
  className?: string;
  variant?: 'compact' | 'detailed';
}

export function CompanyWeekDisplay({ className = '', variant = 'compact' }: CompanyWeekDisplayProps) {
  const today = new Date();
  
  // Get ISO 8601 week number (Monday-to-Monday)
  const getISOWeekNumber = (date: Date): number => {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  };

  const getWeekDateRange = (date: Date): { start: Date; end: Date } => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const start = new Date(date.setDate(diff));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  };

  const weekNumber = getISOWeekNumber(today);
  const weekRange = getWeekDateRange(new Date(today));
  
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getWeekStatus = (): { status: 'current' | 'past' | 'future'; color: string } => {
    const now = new Date();
    const weekStart = weekRange.start;
    const weekEnd = weekRange.end;
    
    if (now >= weekStart && now <= weekEnd) {
      return { status: 'current', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
    } else if (now < weekStart) {
      return { status: 'future', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' };
    } else {
      return { status: 'past', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' };
    }
  };

  const weekStatus = getWeekStatus();

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 text-black dark:text-white ${className}`}>
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Week {weekNumber}</span>
        <Badge variant="outline" className={weekStatus.color}>
          {weekStatus.status}
        </Badge>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-black dark:text-white text-lg">
          <Calendar className="h-5 w-5 text-blue-600" />
          Company Week Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Week Info */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Week {weekNumber}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(weekRange.start)} – {formatDate(weekRange.end)}
              </p>
            </div>
            <Badge variant="outline" className={weekStatus.color}>
              {weekStatus.status}
            </Badge>
          </div>

          {/* Week Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Week Progress</span>
              <span className="font-medium">
                {Math.round(((today.getDay() + 6) % 7 + 1) / 7 * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.round(((today.getDay() + 6) % 7 + 1) / 7 * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Week Details */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Week Start</p>
              <p className="font-medium text-sm">{formatDate(weekRange.start)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Week End</p>
              <p className="font-medium text-sm">{formatDate(weekRange.end)}</p>
            </div>
          </div>

          {/* ISO 8601 Info */}
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-black dark:text-white text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>ISO 8601 Standard (Monday-to-Monday)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook for getting current week info
export function useCompanyWeek() {
  const today = new Date();
  
  const getISOWeekNumber = (date: Date): number => {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  };

  const getWeekDateRange = (date: Date): { start: Date; end: Date } => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(date.setDate(diff));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  };

  return {
    weekNumber: getISOWeekNumber(today),
    weekRange: getWeekDateRange(new Date(today)),
    today
  };
}
