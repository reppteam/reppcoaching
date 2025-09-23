import { auth0TokenService } from './auth0TokenService';

export interface ForgotPasswordResult {
  success: boolean;
  error?: string;
  message?: string;
}

class AlternativeForgotPasswordService {
  // Send password reset email via Auth0 (without checking user existence)
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

  // Send password reset email with user validation (alternative approach)
  async requestPasswordReset(email: string): Promise<ForgotPasswordResult> {
    try {
      // For now, we'll skip the user existence check and just send the reset email
      // This is more secure as it doesn't reveal whether the user exists or not
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

export const alternativeForgotPasswordService = new AlternativeForgotPasswordService();
