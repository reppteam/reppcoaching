// Removed authClient import to avoid initialization errors

export interface M2MTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

class EightBaseM2MAuthService {
  private tokenCache: { token: string; expiresAt: number } | null = null;
  private tokenBuffer = 60000; // 1 minute buffer

  /**
   * Get Auth0 Management API token using direct Auth0 M2M
   */
  async getManagementToken(): Promise<string> {
    // Check if we have a valid cached token
    if (this.tokenCache && this.isTokenValid()) {
      console.log('Using cached M2M token');
      return this.tokenCache.token;
    }

    console.log('Fetching new Auth0 M2M token');
    const tokenData = await this.fetchDirectAuth0M2MToken();
    
    // Cache the token
    this.tokenCache = {
      token: tokenData.access_token,
      expiresAt: Date.now() + (tokenData.expires_in * 1000)
    };

    return tokenData.access_token;
  }

  /**
   * Check if the cached token is still valid
   */
  private isTokenValid(): boolean {
    if (!this.tokenCache) return false;
    
    const now = Date.now();
    return now < (this.tokenCache.expiresAt - this.tokenBuffer);
  }

  // Removed 8base M2M method - using direct Auth0 M2M instead

  /**
   * Fetch Auth0 M2M token for Management API
   */
  private async fetchDirectAuth0M2MToken(): Promise<M2MTokenResponse> {
    try {
      // Check required environment variables
      if (!process.env.REACT_APP_AUTH0_DOMAIN) {
        throw new Error('REACT_APP_AUTH0_DOMAIN is not configured');
      }

      // Try dedicated M2M app first, then fallback to SPA
      const clientId = process.env.REACT_APP_AUTH0_M2M_CLIENT_ID || process.env.REACT_APP_AUTH0_SPA_CLIENT_ID;
      const clientSecret = process.env.REACT_APP_AUTH0_M2M_CLIENT_SECRET || process.env.REACT_APP_AUTH0_CLIENT_SECRET;

      if (!clientId) {
        throw new Error('REACT_APP_AUTH0_SPA_CLIENT_ID or REACT_APP_AUTH0_M2M_CLIENT_ID is not configured');
      }
      if (!clientSecret) {
        throw new Error('REACT_APP_AUTH0_CLIENT_SECRET or REACT_APP_AUTH0_M2M_CLIENT_SECRET is not configured. Please add it to your .env file.');
      }

      const isUsingM2MApp = !!process.env.REACT_APP_AUTH0_M2M_CLIENT_ID;
      console.log(`Fetching Auth0 M2M token using ${isUsingM2MApp ? 'dedicated M2M app' : 'SPA with client_credentials'}...`);

      const response = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          audience: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/`,
          grant_type: 'client_credentials',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMsg = error.error_description || error.error;
        
        if (errorMsg?.includes('Grant type \'client_credentials\' not allowed')) {
          throw new Error(`Auth0 M2M failed: ${errorMsg}. Please enable client_credentials grant type for your SPA app or create a dedicated M2M application. See FIX_CLIENT_CREDENTIALS_GRANT.md for details.`);
        }
        
        throw new Error(`Auth0 M2M failed: ${errorMsg} (Status: ${response.status})`);
      }

      const tokenData = await response.json();
      console.log('Auth0 M2M token obtained successfully');
      return tokenData;
    } catch (error) {
      console.error('Error fetching Auth0 M2M token:', error);
      throw new Error(`Failed to get Auth0 Management API token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Removed duplicate method - using the main getManagementToken() method
}

export const eightBaseM2MAuthService = new EightBaseM2MAuthService();

