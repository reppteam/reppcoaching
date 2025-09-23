import { auth0TokenService } from './auth0TokenService';
import { eightbaseService } from './8baseService';

export interface AccountBlockingResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface UserBlockingStatus {
  isBlocked: boolean;
  blockedAt?: string;
  blockedBy?: string;
  reason?: string;
}

class AccountBlockingService {
  /**
   * Block a user account in both Auth0 and 8base
   * This prevents the user from logging in to the system
   */
  async blockUserAccount(
    userEmail: string, 
    reason?: string, 
    blockedBy?: string
  ): Promise<AccountBlockingResult> {
    try {
      console.log('=== BLOCKING USER ACCOUNT ===');
      console.log('User email:', userEmail);
      console.log('Reason:', reason);
      console.log('Blocked by:', blockedBy);

      // Step 1: Block user in Auth0
      const auth0Result = await this.blockUserInAuth0(userEmail);
      if (!auth0Result.success) {
        return {
          success: false,
          message: 'Failed to block user in Auth0',
          error: auth0Result.error
        };
      }

      // Step 2: Update user status in 8base
      const eightbaseResult = await this.updateUserBlockingStatusIn8base(
        userEmail, 
        true, 
        reason, 
        blockedBy
      );
      
      if (!eightbaseResult.success) {
        // If 8base update fails, we should unblock in Auth0 to maintain consistency
        console.warn('Failed to update 8base, unblocking Auth0 user');
        await this.unblockUserInAuth0(userEmail);
        return {
          success: false,
          message: 'Failed to update user status in 8base',
          error: eightbaseResult.error
        };
      }

      return {
        success: true,
        message: `User account has been successfully blocked. The user will not be able to log in.`
      };

    } catch (error) {
      console.error('Error blocking user account:', error);
      return {
        success: false,
        message: 'Failed to block user account',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Unblock a user account in both Auth0 and 8base
   * This restores the user's ability to log in to the system
   */
  async unblockUserAccount(
    userEmail: string, 
    unblockedBy?: string
  ): Promise<AccountBlockingResult> {
    try {
      console.log('=== UNBLOCKING USER ACCOUNT ===');
      console.log('User email:', userEmail);
      console.log('Unblocked by:', unblockedBy);

      // Step 1: Unblock user in Auth0
      const auth0Result = await this.unblockUserInAuth0(userEmail);
      if (!auth0Result.success) {
        return {
          success: false,
          message: 'Failed to unblock user in Auth0',
          error: auth0Result.error
        };
      }

      // Step 2: Update user status in 8base
      const eightbaseResult = await this.updateUserBlockingStatusIn8base(
        userEmail, 
        false, 
        undefined, 
        unblockedBy
      );
      
      if (!eightbaseResult.success) {
        console.warn('Failed to update 8base user status');
        return {
          success: false,
          message: 'Failed to update user status in 8base',
          error: eightbaseResult.error
        };
      }

      return {
        success: true,
        message: `User account has been successfully unblocked. The user can now log in again.`
      };

    } catch (error) {
      console.error('Error unblocking user account:', error);
      return {
        success: false,
        message: 'Failed to unblock user account',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get the blocking status of a user
   */
  async getUserBlockingStatus(userEmail: string): Promise<UserBlockingStatus> {
    try {
      // Get user from 8base to check blocking status
      const user = await eightbaseService.getUserByEmail(userEmail);
      if (!user) {
        return { isBlocked: false };
      }

      // Check if user is marked as inactive (blocked)
      const isBlocked = user.is_active === false;
      
      return {
        isBlocked,
        blockedAt: isBlocked ? user.updatedAt : undefined,
        blockedBy: isBlocked ? 'System' : undefined, // You can extend this to store who blocked the user
        reason: isBlocked ? 'Account deactivated' : undefined
      };

    } catch (error) {
      console.error('Error getting user blocking status:', error);
      return { isBlocked: false };
    }
  }

  /**
   * Block user in Auth0 using Management API
   */
  private async blockUserInAuth0(userEmail: string): Promise<AccountBlockingResult> {
    try {
      const managementToken = await auth0TokenService.getManagementToken();
      
      // First, get the user by email to get their user_id
      const userResponse = await fetch(
        `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users-by-email?email=${encodeURIComponent(userEmail)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${managementToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!userResponse.ok) {
        const error = await userResponse.json();
        throw new Error(`Failed to find user: ${error.message || error.error}`);
      }

      const users = await userResponse.json();
      if (!users || users.length === 0) {
        throw new Error('User not found in Auth0');
      }

      const auth0User = users[0];
      
      // Block the user by updating their profile
      const blockResponse = await fetch(
        `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users/${auth0User.user_id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${managementToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            blocked: true,
            app_metadata: {
              ...auth0User.app_metadata,
              blocked_at: new Date().toISOString(),
              blocked_reason: 'Account deactivated by admin'
            }
          })
        }
      );

      if (!blockResponse.ok) {
        const error = await blockResponse.json();
        throw new Error(`Failed to block user: ${error.message || error.error}`);
      }

      console.log('User blocked in Auth0 successfully');
      return { success: true, message: 'User blocked in Auth0' };

    } catch (error) {
      console.error('Error blocking user in Auth0:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Unblock user in Auth0 using Management API
   */
  private async unblockUserInAuth0(userEmail: string): Promise<AccountBlockingResult> {
    try {
      const managementToken = await auth0TokenService.getManagementToken();
      
      // First, get the user by email to get their user_id
      const userResponse = await fetch(
        `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users-by-email?email=${encodeURIComponent(userEmail)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${managementToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!userResponse.ok) {
        const error = await userResponse.json();
        throw new Error(`Failed to find user: ${error.message || error.error}`);
      }

      const users = await userResponse.json();
      if (!users || users.length === 0) {
        throw new Error('User not found in Auth0');
      }

      const auth0User = users[0];
      
      // Unblock the user by updating their profile
      const unblockResponse = await fetch(
        `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users/${auth0User.user_id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${managementToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            blocked: false,
            app_metadata: {
              ...auth0User.app_metadata,
              unblocked_at: new Date().toISOString(),
              blocked_at: undefined,
              blocked_reason: undefined
            }
          })
        }
      );

      if (!unblockResponse.ok) {
        const error = await unblockResponse.json();
        throw new Error(`Failed to unblock user: ${error.message || error.error}`);
      }

      console.log('User unblocked in Auth0 successfully');
      return { success: true, message: 'User unblocked in Auth0' };

    } catch (error) {
      console.error('Error unblocking user in Auth0:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update user blocking status in 8base
   */
  private async updateUserBlockingStatusIn8base(
    userEmail: string, 
    isBlocked: boolean, 
    reason?: string, 
    actionBy?: string
  ): Promise<AccountBlockingResult> {
    try {
      // Get user by email first
      const user = await eightbaseService.getUserByEmail(userEmail);
      if (!user) {
        throw new Error('User not found in 8base');
      }

      // Update user with blocking status
      const updateData = {
        is_active: !isBlocked, // If blocked, set is_active to false
        // You can add more fields here to track blocking information
        // blocked_at: isBlocked ? new Date().toISOString() : undefined,
        // blocked_by: actionBy,
        // blocked_reason: reason
      };

      await eightbaseService.updateUser(user.id, updateData);
      
      console.log(`User ${isBlocked ? 'blocked' : 'unblocked'} in 8base successfully`);
      return { 
        success: true, 
        message: `User ${isBlocked ? 'blocked' : 'unblocked'} in 8base` 
      };

    } catch (error) {
      console.error('Error updating user blocking status in 8base:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if a user is currently blocked
   */
  async isUserBlocked(userEmail: string): Promise<boolean> {
    try {
      const status = await this.getUserBlockingStatus(userEmail);
      return status.isBlocked;
    } catch (error) {
      console.error('Error checking if user is blocked:', error);
      return false;
    }
  }
}

export const accountBlockingService = new AccountBlockingService();
