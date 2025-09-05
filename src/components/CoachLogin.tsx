import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { eightbaseService } from '../services/8baseService';
import { userRegistrationService } from '../services/userRegistrationService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CoachLoginFormData {
  email: string;
  password: string;
}

interface CoachLoginResponse {
  success: boolean;
  coach?: any;
  message: string;
  error?: string;
}

export function CoachLogin() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CoachLoginFormData>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CoachLoginResponse | null>(null);

  // If user is already logged in as a coach, redirect to coach dashboard
  React.useEffect(() => {
    if (user && (user.role === 'coach' || user.role === 'coach_manager')) {
      navigate('/coach-dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      // Step 1: Get all coaches and filter by email
      const coaches = await eightbaseService.getCoachesByEmailFilter(formData.email);
      
      if (!coaches || coaches.length === 0) {
        setResponse({
          success: false,
          message: 'No coach found with this email address.',
          error: 'COACH_NOT_FOUND'
        });
        setLoading(false);
        return;
      }

      // Find exact email match
      const coach = coaches.find(c => c.email.toLowerCase() === formData.email.toLowerCase());
      
      if (!coach) {
        setResponse({
          success: false,
          message: 'No coach found with this exact email address.',
          error: 'COACH_NOT_FOUND'
        });
        setLoading(false);
        return;
      }

      // Step 2: For demo purposes, accept any password
      // In a real app, you would verify the password hash
      if (formData.password !== 'password') {
        setResponse({
          success: false,
          message: 'Invalid password. Please try again.',
          error: 'INVALID_PASSWORD'
        });
        setLoading(false);
        return;
      }

      // Step 3: Login the user through the user registration service
      try {
        const loginResult = await userRegistrationService.loginUser(formData.email, formData.password);
        
        setResponse({
          success: true,
          coach: coach,
          message: `Welcome back ${coach.firstName} ${coach.lastName}! You are now logged in as a coach.`
        });

        // Redirect to coach dashboard after successful login
        setTimeout(() => {
          navigate('/coach-dashboard');
        }, 1500);

      } catch (loginError) {
        console.error('Login error:', loginError);
        setResponse({
          success: false,
          message: 'Failed to complete login process. Please try again.',
          error: 'LOGIN_FAILED'
        });
      }

    } catch (error) {
      console.error('Coach login error:', error);
      setResponse({
        success: false,
        message: 'An error occurred during login. Please try again.',
        error: 'UNKNOWN_ERROR'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <UserCheck className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Coach Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your coach dashboard
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enter your credentials</CardTitle>
            <CardDescription>
              Use your coach email and password to sign in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="coach@example.com"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>

              {response && (
                <Alert className={response.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <div className="flex items-center gap-2">
                    {response.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={response.success ? 'text-green-800' : 'text-red-800'}>
                      {response.message}
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In as Coach'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <div className="text-sm text-gray-600">
                <p className="mb-2">Demo credentials:</p>
                <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                  Email: Any coach email from the system<br />
                  Password: password
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
