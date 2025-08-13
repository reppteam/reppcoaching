import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Shield } from 'lucide-react';

export function UniversalLoginDirect() {
  const [loading, setLoading] = useState(false);
  const { loginWithRedirect } = useAuth0();

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Redirect directly to Auth0's Universal Login page
      await loginWithRedirect({
        appState: { returnTo: window.location.origin },
      });
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-xl">
        <CardContent className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Welcome Title */}
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Welcome
          </h1>

          {/* Instructions */}
          <p className="text-sm text-gray-600 text-center mb-8">
            Log in to SoftwareJV to continue to Software JV
          </p>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            {loading ? 'Redirecting to Auth0...' : 'Sign In'}
          </Button>

          {/* Info Text */}
          <p className="text-xs text-gray-500 text-center mt-6">
            You will be redirected to Auth0's secure login page
          </p>

          {/* Footer Logo */}
          <div className="flex justify-center mt-8">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center opacity-50">
              <Shield className="w-4 h-4 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 