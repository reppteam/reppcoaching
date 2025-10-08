import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Bell, X, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { Notification } from '../services/notificationService';
import { NotificationUtils } from '../utils/notificationUtils';

interface NotificationBannerProps {
  notifications: Notification[];
  onDismiss?: (id: string) => void;
  onAction?: (notification: Notification) => void;
}

export function NotificationBanner({ 
  notifications, 
  onDismiss, 
  onAction 
}: NotificationBannerProps) {
  const sortedNotifications = NotificationUtils.sortNotifications(notifications);
  const unreadCount = NotificationUtils.getUnreadCount(notifications);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBorderColor = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return 'border-l-4 border-yellow-500';
      case 'error':
        return 'border-l-4 border-red-500';
      case 'success':
        return 'border-l-4 border-green-500';
      case 'info':
      default:
        return 'border-l-4 border-blue-500';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {sortedNotifications.map((notification) => (
        <Card 
          key={notification.id} 
          className={`${getBorderColor(notification.type)} ${
            !notification.isRead ? 'bg-muted/30 dark:bg-gray-800/50' : 'dark:bg-gray-800/30'
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground dark:text-white">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-foreground/90 dark:text-gray-200 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-foreground/70 dark:text-gray-300 mt-2">
                      {NotificationUtils.formatNotificationTime(notification.createdAt)}
                    </p>
                  </div>
                  {onDismiss && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onDismiss(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {notification.actionText && notification.actionLink && onAction && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-foreground/20 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                    onClick={() => onAction(notification)}
                  >
                    {notification.actionText}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function NotificationBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">
      {count > 9 ? '9+' : count}
    </span>
  );
}

