import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Mail, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export function SendGridReminder() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isReminderTime, setIsReminderTime] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Check if it's 5 PM (17:00)
      if (now.getHours() === 17 && now.getMinutes() === 0 && !isDismissed) {
        setIsReminderTime(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isDismissed]);

  const timeUntil5PM = () => {
    const now = new Date();
    const fivePM = new Date();
    fivePM.setHours(17, 0, 0, 0);
    
    if (now > fivePM) {
      fivePM.setDate(fivePM.getDate() + 1);
    }
    
    const diff = fivePM.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes };
  };

  const { hours, minutes } = timeUntil5PM();

  if (isDismissed) {
    return null;
  }

  if (isReminderTime) {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <strong>SendGrid Setup Reminder!</strong> It's 5 PM - time to set up SendGrid for automated email invitations.
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsDismissed(true)}
            >
              Dismiss
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Mail className="h-5 w-5" />
          SendGrid Setup Reminder
        </CardTitle>
        <CardDescription className="text-blue-700">
          Complete your automated email invitation system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">Time until 5 PM reminder:</span>
            <Badge variant="outline" className="text-blue-700">
              <Clock className="h-3 w-3 mr-1" />
              {hours}h {minutes}m
            </Badge>
          </div>
          
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>What you'll need to do:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Create SendGrid account</li>
              <li>Get API key</li>
              <li>Create email templates</li>
              <li>Update environment variables</li>
            </ul>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsDismissed(true)}
            >
              Dismiss
            </Button>
            <Button 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Mail className="h-3 w-3 mr-1" />
              Setup Guide
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
