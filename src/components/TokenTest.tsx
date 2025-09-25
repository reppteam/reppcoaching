import React, { useState } from 'react';
import { auth0TokenService } from '../services/auth0TokenService';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export function TokenTest() {
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testToken = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get a fresh token
      const token = await auth0TokenService.getManagementToken();
      
      // Get token info
      const info = auth0TokenService.getTokenInfo();
      
      setTokenInfo({
        ...info,
        tokenPreview: token.substring(0, 20) + '...',
        fullToken: token
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get token');
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    auth0TokenService.clearCache();
    setTokenInfo(null);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-black dark:text-white">
          <RefreshCw className="h-5 w-5" />
          Auth0 Token Test
        </CardTitle>
        <CardDescription>
          Test the automatic token management service
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testToken} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Testing...' : 'Test Token'}
          </Button>
          <Button 
            onClick={clearCache} 
            variant="outline"
            size="sm"
          >
            Clear Cache
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 text-black dark:text-white text-red-700">
              <XCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Error</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}

        {tokenInfo && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Token Status:</span>
              <Badge variant={tokenInfo.isValid ? "default" : "destructive"}>
                {tokenInfo.isValid ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {tokenInfo.isValid ? 'Valid' : 'Invalid'}
              </Badge>
            </div>

            {tokenInfo.expiresAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Expires:</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(tokenInfo.expiresAt).toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Token Preview:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {tokenInfo.tokenPreview}
              </code>
            </div>

            <details className="text-sm">
              <summary className="cursor-pointer font-medium">Show Full Token</summary>
              <code className="block mt-2 p-2 bg-muted rounded text-xs break-all">
                {tokenInfo.fullToken}
              </code>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
