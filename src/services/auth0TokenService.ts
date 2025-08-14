interface Auth0TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

class Auth0TokenService {
  private tokenCache: CachedToken | null = null;
  private readonly tokenBuffer = 5 * 60 * 1000; // 5 minutes buffer before expiry

  // Get a valid management token (automatically refreshes if needed)
  async getManagementToken(): Promise<string> {
    // Check if we have a cached token that's still valid
    if (this.isTokenValid()) {
      return this.tokenCache!.token;
    }

    // Get a new token
    const newToken = await this.fetchNewToken();
    this.cacheToken(newToken);
    return newToken.access_token;
  }

  // Check if current cached token is still valid
  private isTokenValid(): boolean {
    if (!this.tokenCache) {
      return false;
    }

    const now = Date.now();
    const expiresAt = this.tokenCache.expiresAt;
    
    // Token is valid if it hasn't expired and has buffer time remaining
    return now < (expiresAt - this.tokenBuffer);
  }

  // Fetch a new token from Auth0
  private async fetchNewToken(): Promise<Auth0TokenResponse> {
    try {
      const response = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.REACT_APP_AUTH0_CLIENT_ID,
          client_secret: process.env.REACT_APP_AUTH0_CLIENT_SECRET,
          audience: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/`,
          grant_type: 'client_credentials',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to get Auth0 token: ${error.error_description || error.message}`);
      }

      const tokenData: Auth0TokenResponse = await response.json();
      return tokenData;
    } catch (error) {
      console.error('Error fetching Auth0 management token:', error);
      throw new Error('Failed to get Auth0 management token');
    }
  }

  // Cache the token with expiry time
  private cacheToken(tokenData: Auth0TokenResponse): void {
    const expiresIn = tokenData.expires_in * 1000; // Convert to milliseconds
    const expiresAt = Date.now() + expiresIn;

    this.tokenCache = {
      token: tokenData.access_token,
      expiresAt: expiresAt,
    };

    console.log(`Auth0 token cached, expires at: ${new Date(expiresAt).toISOString()}`);
  }

  // Clear the cached token (useful for testing or manual refresh)
  clearCache(): void {
    this.tokenCache = null;
    console.log('Auth0 token cache cleared');
  }

  // Get token info for debugging
  getTokenInfo(): { hasToken: boolean; expiresAt?: string; isValid: boolean } {
    if (!this.tokenCache) {
      return { hasToken: false, isValid: false };
    }

    return {
      hasToken: true,
      expiresAt: new Date(this.tokenCache.expiresAt).toISOString(),
      isValid: this.isTokenValid(),
    };
  }
}

export const auth0TokenService = new Auth0TokenService();
