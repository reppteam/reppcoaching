import React from 'react';
import { User } from '../types';
import { formatDate, getCoachingWeekInfo } from '../utils/dateUtils';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { WeekTracker } from './WeekTracker';

interface DateAndWeekDisplayProps {
  user: User;
}

export function DateAndWeekDisplay({ user }: DateAndWeekDisplayProps) {
  const today = new Date();
  const todayFormatted = formatDate(today, 'EEEE, MMMM d, yyyy');

  // For students with coaching start dates (free users)
  const showWeekInfo = user.role === 'user' && !user.has_paid && user.coaching_term_start;
  
  let weekInfo = null;
  if (showWeekInfo) {
    weekInfo = getCoachingWeekInfo(user.coaching_term_start!, today);
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
      <CardContent className="pt-4">
        <div className="space-y-4">
          {/* Today's Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-brand-blue" />
              <div>
                <p className="font-medium text-muted-foreground dark:text-white">Today</p>
                <p className="text-sm text-muted-foreground dark:text-white">{todayFormatted}</p>
              </div>
            </div>

            {/* Prominent Week Display for Free Students */}
            {showWeekInfo && (
              <div className="text-right">
                <p className="text-sm font-medium text-brand-gray mb-1">Current Week</p>
                <WeekTracker user={user} variant="pill" showTotal={false} />
              </div>
            )}
          </div>

          {/* Coaching Term Information for Free Students */}
          {showWeekInfo && user.coaching_term_start && user.coaching_term_end && (
            <div className="border-t pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Coaching Term Dates */}
                <div>
                  <p className="text-sm font-medium text-brand-gray mb-2">Coaching Term</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Start:</span>
                      <span className="font-medium">{formatDate(new Date(user.coaching_term_start), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>End:</span>
                      <span className="font-medium">{formatDate(new Date(user.coaching_term_end), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>

                {/* Week Information Details */}
                <div>
                  <p className="text-sm font-medium text-brand-gray mb-2">Week Progress</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {weekInfo && (
                      <>
                        <div className="flex items-center justify-between">
                          <span>Current Week:</span>
                          <span className="font-medium">
                            {weekInfo.isBeforeWeek1 ? 'Pre-Week 1' : `Week ${weekInfo.weekNumber}`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Week 1 Started:</span>
                          <span className="font-medium">{formatDate(weekInfo.week1Start, 'MMM d')}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Context */}
              {weekInfo && (
                <div className="mt-3 p-2 bg-blue-100/50 dark:bg-blue-900/20 rounded-md">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {weekInfo.isBeforeWeek1 ? (
                      <>Your coaching program starts on <strong>{formatDate(weekInfo.week1Start, 'MMMM d, yyyy')}</strong></>
                    ) : (
                      <>You are currently in <strong>Week {weekInfo.weekNumber}</strong> of your 6-month coaching program</>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* For Paid Students - Show Access Period with Week Tracking */}
          {user.role === 'user' && user.has_paid && (
            <div className="border-t pt-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-brand-gray">Access Period</p>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Current Week</p>
                  <WeekTracker user={user} variant="compact" showTotal={false} />
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center justify-between">
                  <span>Start:</span>
                  <span className="font-medium">{formatDate(new Date(user.access_start), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>End:</span>
                  <span className="font-medium">{formatDate(new Date(user.access_end), 'MMM d, yyyy')}</span>
                </div>
              </div>
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                <WeekTracker user={user} variant="progress" showTotal={false} />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}