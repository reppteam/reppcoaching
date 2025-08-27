import React from 'react';
import { User } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatDate, isAfter, isBefore, addDays } from '../utils/dateUtils';

interface CoachingTermInfoProps {
  user: User;
  showTitle?: boolean;
  compact?: boolean;
}

export function CoachingTermInfo({ user, showTitle = true, compact = false }: CoachingTermInfoProps) {
  // Only show for free users with coaching term dates
  if (user.has_paid || !user.coaching_term_start || !user.coaching_term_end) {
    return null;
  }

  const startDate = new Date(user.coaching_term_start);
  const endDate = new Date(user.coaching_term_end);
  const today = new Date();
  const warningDate = addDays(endDate, -30); // 30 days before end

  const isActive = isBefore(today, endDate) && isAfter(today, startDate);
  const isExpired = isAfter(today, endDate);
  const isUpcoming = isBefore(today, startDate);
  const isNearExpiration = isAfter(today, warningDate) && isBefore(today, endDate);

  const getStatus = () => {
    if (isExpired) return { label: 'Expired', variant: 'destructive' as const, icon: AlertTriangle };
    if (isNearExpiration) return { label: 'Ending Soon', variant: 'destructive' as const, icon: AlertTriangle };
    if (isActive) return { label: 'Active', variant: 'default' as const, icon: CheckCircle };
    if (isUpcoming) return { label: 'Upcoming', variant: 'secondary' as const, icon: Clock };
    return { label: 'Unknown', variant: 'secondary' as const, icon: Clock };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Badge variant={status.variant} className="flex items-center gap-1">
          <StatusIcon className="h-3 w-3" />
          Free Coaching - {status.label}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {formatDate(startDate, 'MMM d')} - {formatDate(endDate, 'MMM d, yyyy')}
        </span>
      </div>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-blue" />
            Coaching Term
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={showTitle ? '' : 'pt-4'}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Status</span>
            <Badge variant={status.variant} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Start Date:</span>
              <span className="font-medium">{formatDate(startDate, 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">End Date:</span>
              <span className="font-medium">{formatDate(endDate, 'MMMM d, yyyy')}</span>
            </div>
          </div>

          {isActive && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Free Coaching Program</strong><br />
                You have access to coaching support until {formatDate(endDate, 'MMMM d, yyyy')}.
                {isNearExpiration && (
                  <span className="block mt-1 text-orange-600 dark:text-orange-400">
                    Your coaching term ends in less than 30 days.
                  </span>
                )}
              </p>
            </div>
          )}

          {isExpired && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                <strong>Coaching Term Expired</strong><br />
                Your free coaching program ended on {formatDate(endDate, 'MMMM d, yyyy')}.
                Contact support to discuss continuing your coaching journey.
              </p>
            </div>
          )}

          {isUpcoming && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Coaching Term Starts Soon</strong><br />
                Your free coaching program begins on {formatDate(startDate, 'MMMM d, yyyy')}.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}