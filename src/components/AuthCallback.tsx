import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  AlertTriangle,
  Loader2
} from 'lucide-react';

export function AuthCallback() {
  const { isAuthenticated, isLoading, error } = useAuth0();
  const { authorize } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      if (!isLoading) {
        if (isAuthenticated) {
          try {
            // Authorize the user with 8base
            await authorize();
            setSuccess('Login successful! Redirecting...');
            setTimeout(() => {
              navigate('/');
            }, 2000);
          } catch (err) {
            console.error('Authorization error:', err);
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      }
    };

    handleCallback();
  }, [isAuthenticated, isLoading, authorize, navigate]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Card className="w-full max-w-md bg-white">
          <CardHeader>
            <CardTitle className="text-center">Authenticating...</CardTitle>
            <CardDescription className="text-center">
              Please wait while we complete your authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Redirecting you to Auth0 and back...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <CardTitle className="text-center">
            {success ? 'Authentication Complete' : 'Authentication Failed'}
          </CardTitle>
          <CardDescription className="text-center">
            {success ? 'You have been successfully authenticated' : 'There was an issue with authentication'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          
          {!success && (
            <div className="mt-4 text-center">
              <a 
                href="/login" 
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Return to login
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 