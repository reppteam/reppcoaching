import React from 'react';
import { User } from '../types';
import { WeekTracker, getUserWeekInfo } from './WeekTracker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { formatDate } from '../utils/dateUtils';
import { Calendar, Clock, User as UserIcon, Trophy } from 'lucide-react';

interface StudentWeekOverviewProps {
  student: User;
  showDetails?: boolean;
  className?: string;
}

export function StudentWeekOverview({ student, showDetails = false, className = '' }: StudentWeekOverviewProps) {
  const weekInfo = getUserWeekInfo(student);
  
  if (!weekInfo) {
    return null; // Student doesn't have week tracking setup
  }

  const { weekNumber, isBeforeWeek1, totalWeeks } = weekInfo;
  const isPaid = student.has_paid;
  const startDate = isPaid ? student.access_start : student.coaching_term_start;
  const endDate = isPaid ? student.access_end : student.coaching_term_end;

  if (showDetails) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-black dark:text-white text-base">
            <UserIcon className="h-4 w-4 text-brand-blue" />
            {student.firstName} {student.lastName}
          </CardTitle>
          <CardDescription>{student.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Account Type */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Account Type:</span>
            <Badge className={isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-muted text-muted-foreground'}>
              {isPaid ? 'Paid Access' : 'Free Coaching'}
            </Badge>
          </div>

          {/* Current Week */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Week:</span>
              <WeekTracker user={student} variant="compact" showTotal={false} />
            </div>
            
            {/* {totalWeeks && !isBeforeWeek1 && (
              <div className="space-y-1">
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Week 1</span>
                  <span>{progressPercentage.toFixed(1)}% complete</span>
                  <span>Week {totalWeeks}</span>
                </div>
              </div>
            )} */}
          </div>

          {/* Program Dates */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {isPaid ? 'Access Period' : 'Coaching Term'}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Start:</span>
                <div className="font-medium">
                  {startDate ? formatDate(new Date(startDate), 'MMM d, yyyy') : 'Not set'}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">End:</span>
                <div className="font-medium">
                  {endDate ? formatDate(new Date(endDate), 'MMM d, yyyy') : 'Not set'}
                </div>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {isBeforeWeek1 
                    ? 'Program not started' 
                    : `${weekNumber} weeks into program`
                  }
                </span>
              </div>
              {!isBeforeWeek1 && totalWeeks && (
                <div className="flex items-center space-x-1">
                  <Trophy className="h-3 w-3" />
                  <span>{Math.max(0, totalWeeks - weekNumber)} weeks remaining</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact version for tables and lists
  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <div className="text-sm">
        <div className="font-medium">{student.firstName} {student.lastName}</div>
        <div className="text-xs text-muted-foreground">{student.email}</div>
      </div>
      <div className="flex flex-col items-end space-y-1">
        <WeekTracker user={student} variant="compact" showTotal={false} />
        <Badge variant="outline" className="text-xs">
          {isPaid ? 'Paid' : 'Free'}
        </Badge>
      </div>
    </div>
  );
}

// Utility component for showing multiple students' week overview
interface StudentsWeekGridProps {
  students: User[];
  maxDisplay?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

export function StudentsWeekGrid({ 
  students, 
  maxDisplay = 6, 
  showViewAll = true, 
  onViewAll 
}: StudentsWeekGridProps) {
  const displayStudents = students.slice(0, maxDisplay);
  const hasMore = students.length > maxDisplay;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayStudents.map((student) => (
          <StudentWeekOverview
            key={student.id}
            student={student}
            showDetails={true}
          />
        ))}
      </div>
      
      {hasMore && showViewAll && (
        <div className="text-center">
          <button
            onClick={onViewAll}
            className="text-sm text-brand-blue hover:text-brand-blue-dark transition-colors"
          >
            View all {students.length} students →
          </button>
        </div>
      )}
    </div>
  );
}