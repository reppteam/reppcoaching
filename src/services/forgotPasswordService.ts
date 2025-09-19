import { auth0TokenService } from './auth0TokenService';

export interface ForgotPasswordResult {
  success: boolean;
  error?: string;
  message?: string;
}

class ForgotPasswordService {
  // Send password reset email via Auth0
  async sendPasswordResetEmail(email: string): Promise<ForgotPasswordResult> {
    try {
      const response = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/dbconnections/change_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: process.env.REACT_APP_AUTH0_CLIENT_ID,
          email: email,
          connection: 'Username-Password-Authentication'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.error_description || error.error || 'Failed to send password reset email'
        };
      }

      return {
        success: true,
        message: 'Password reset email sent successfully. Please check your inbox.'
      };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send password reset email'
      };
    }
  }

  // Check if user exists in Auth0
  async checkUserExists(email: string): Promise<{ exists: boolean; error?: string }> {
    try {
      const managementToken = await auth0TokenService.getManagementToken();
      
      const response = await fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users-by-email?email=${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${managementToken}`
        }
      });

      if (!response.ok) {
        return {
          exists: false,
          error: 'Failed to check user existence'
        };
      }

      const users = await response.json();
      return {
        exists: users.length > 0
      };
    } catch (error) {
      console.error('Error checking user existence:', error);
      return {
        exists: false,
        error: error instanceof Error ? error.message : 'Failed to check user existence'
      };
    }
  }

  // Send password reset email with user validation
  async requestPasswordReset(email: string): Promise<ForgotPasswordResult> {
    try {
      // First check if user exists
      const userCheck = await this.checkUserExists(email);
      
      if (userCheck.error) {
        return {
          success: false,
          error: userCheck.error
        };
      }

      if (!userCheck.exists) {
        // For security, we don't reveal if the user exists or not
        // We'll still return success to prevent email enumeration
        return {
          success: true,
          message: 'If an account with that email exists, a password reset email has been sent.'
        };
      }

      // User exists, send password reset email
      return await this.sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Error requesting password reset:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to request password reset'
      };
    }
  }

  // Redirect to Auth0's password reset page
  redirectToPasswordReset(): void {
    const resetUrl = `https://${process.env.REACT_APP_AUTH0_DOMAIN}/login?client_id=${process.env.REACT_APP_AUTH0_CLIENT_ID}&protocol=oauth2&response_type=code&redirect_uri=${encodeURIComponent(`${window.location.origin}/auth/callback`)}&scope=openid%20profile%20email&screen_hint=login&prompt=login`;
    window.location.href = resetUrl;
  }
}

export const forgotPasswordService = new ForgotPasswordService();
