import { client } from '../8baseClient';
import {
  GET_ALL_8BASE_USERS,
  GET_8BASE_USER_BY_ID,
  GET_8BASE_USER_BY_EMAIL,
  CREATE_8BASE_USER,
  UPDATE_8BASE_USER,
  DELETE_8BASE_USER,
  ASSIGN_ROLE_TO_USER,
  REMOVE_ROLE_FROM_USER,
  GET_ALL_ROLES,
  GET_USER_ROLES,
  CREATE_STUDENT_USER,
  CREATE_COACH_USER,
  CREATE_USER_WITH_CUSTOM_FIELDS,
  GET_USERS_WITH_CUSTOM_FIELDS
} from '../graphql/8baseUser';
import { STATIC_ROLES, getRoleByName } from '../config/staticRoles';
import { eightbaseService } from './8baseService';

export interface EightBaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles?: {
    items: Array<{
      id: string;
      name: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EightBaseRole {
  id: string;
  name: string;
}

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  roles?: {
    connect: { id: string };
  };
}

export interface CreateStudentUserInput {
  email: string;
  firstName: string;
  lastName: string;
  roles: {
    connect: { id: string };
  };
  assignedCoach?: {
    connect: { id: string };
  };
}

export interface CreateCoachUserInput {
  email: string;
  firstName: string;
  lastName: string;
  roles: {
    connect: { id: string };
  };
  student?: {
    connect: { id: string };
  };
}

export interface UpdateUserInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  assigned_admin_id?: string;
  access_start?: string;
  access_end?: string;
  has_paid?: boolean;
}

class EightBaseUserService {
  // Get all 8base users
  async getAllUsers(): Promise<EightBaseUser[]> {
    try {
      const { data } = await client.query({
        query: GET_ALL_8BASE_USERS,
        fetchPolicy: 'cache-first'
      });

      return data.usersList?.items || [];
    } catch (error) {
      console.error('Error fetching all 8base users:', error);
      return [];
    }
  }

  // Get 8base user by ID
  async getUserById(id: string): Promise<EightBaseUser | null> {
    try {
      const { data } = await client.query({
        query: GET_8BASE_USER_BY_ID,
        variables: { id },
        fetchPolicy: 'cache-first'
      });

      return data.user || null;
    } catch (error) {
      console.error('Error fetching 8base user by ID:', error);
      return null;
    }
  }

  // Get 8base user by email
  async getUserByEmail(email: string): Promise<EightBaseUser | null> {
    try {
      const { data } = await client.query({
        query: GET_8BASE_USER_BY_EMAIL,
        variables: { email },
        fetchPolicy: 'cache-first'
      });

      return data.usersList?.items?.[0] || null;
    } catch (error) {
      console.error('Error fetching 8base user by email:', error);
      return null;
    }
  }

  // Create new 8base user
  async createUser(input: CreateUserInput): Promise<EightBaseUser> {
    try {
      const { data } = await client.mutate({
        mutation: CREATE_8BASE_USER,
        variables: { input },
        refetchQueries: [{ query: GET_ALL_8BASE_USERS }]
      });

      return data.userCreate;
    } catch (error) {
      console.error('Error creating 8base user:', error);
      throw new Error('Failed to create user');
    }
  }

  // Create student user with assigned coach
  async createStudentUserWithCoach(input: CreateStudentUserInput): Promise<EightBaseUser> {
    try {
      const { data } = await client.mutate({
        mutation: CREATE_STUDENT_USER,
        variables: { data: input },
        refetchQueries: [{ query: GET_ALL_8BASE_USERS }]
      });

      return data.userCreate;
    } catch (error) {
      console.error('Error creating student user with coach:', error);
      throw new Error('Failed to create student user with coach');
    }
  }

  // Create coach user with assigned students
  async createCoachUserWithStudents(input: CreateCoachUserInput): Promise<EightBaseUser> {
    try {
      const { data } = await client.mutate({
        mutation: CREATE_COACH_USER,
        variables: { data: input },
        refetchQueries: [{ query: GET_ALL_8BASE_USERS }]
      });

      return data.userCreate;
    } catch (error) {
      console.error('Error creating coach user with students:', error);
      throw new Error('Failed to create coach user with students');
    }
  }

  // Create user with custom fields
  async createUserWithCustomFields(input: CreateUserInput): Promise<EightBaseUser> {
    try {
      const { data } = await client.mutate({
        mutation: CREATE_USER_WITH_CUSTOM_FIELDS,
        variables: { input },
        refetchQueries: [{ query: GET_ALL_8BASE_USERS }]
      });

      return data.userCreate;
    } catch (error) {
      console.error('Error creating 8base user with custom fields:', error);
      throw new Error('Failed to create user with custom fields');
    }
  }

  // Update 8base user
  async updateUser(id: string, input: UpdateUserInput): Promise<EightBaseUser> {
    try {
      const { data } = await client.mutate({
        mutation: UPDATE_8BASE_USER,
        variables: { id, input },
        refetchQueries: [{ query: GET_ALL_8BASE_USERS }]
      });

      return data.userUpdate;
    } catch (error) {
      console.error('Error updating 8base user:', error);
      throw new Error('Failed to update user');
    }
  }

  // Delete 8base user
  async deleteUser(id: string): Promise<boolean> {
    try {
      await client.mutate({
        mutation: DELETE_8BASE_USER,
        variables: { id },
        refetchQueries: [{ query: GET_ALL_8BASE_USERS }]
      });

      return true;
    } catch (error) {
      console.error('Error deleting 8base user:', error);
      throw new Error('Failed to delete user');
    }
  }

  // Assign role to user
  async assignRoleToUser(userId: string, roleId: string): Promise<EightBaseUser> {
    try {
      const { data } = await client.mutate({
        mutation: ASSIGN_ROLE_TO_USER,
        variables: { userId, roleId },
        refetchQueries: [{ query: GET_ALL_8BASE_USERS }]
      });

      return data.userUpdate;
    } catch (error) {
      console.error('Error assigning role to user:', error);
      throw new Error('Failed to assign role to user');
    }
  }

  // Remove role from user
  async removeRoleFromUser(userId: string, roleId: string): Promise<EightBaseUser> {
    try {
      const { data } = await client.mutate({
        mutation: REMOVE_ROLE_FROM_USER,
        variables: { userId, roleId },
        refetchQueries: [{ query: GET_ALL_8BASE_USERS }]
      });

      return data.userUpdate;
    } catch (error) {
      console.error('Error removing role from user:', error);
      throw new Error('Failed to remove role from user');
    }
  }

  // Get all available roles (using static roles)
  async getAllRoles(): Promise<EightBaseRole[]> {
    try {
      // Return static roles instead of querying 8base
      return STATIC_ROLES;
    } catch (error) {
      console.error('Error getting static roles:', error);
      return [];
    }
  }

  // Get user's roles
  async getUserRoles(userId: string) {
    try {
      const { data } = await client.query({
        query: GET_USER_ROLES,
        variables: { userId },
        fetchPolicy: 'cache-first'
      });

      return data.user?.roles?.items || [];
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  }

  // Create a student user
  async createStudentUser(studentData: {
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<EightBaseUser> {
    try {
      // Get the student role ID from static roles
      const studentRole = getRoleByName('Student');
      
      if (!studentRole) {
        throw new Error('Student role not found');
      }

      // Create user input
      const userInput: CreateUserInput = {
        email: studentData.email,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        roles: {
          connect: { id: studentRole.id }
        }
      };

      return await this.createUser(userInput);
    } catch (error) {
      console.error('Error creating student user:', error);
      throw new Error('Failed to create student user');
    }
  }

  // Create a coach user
  async createCoachUser(coachData: {
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<EightBaseUser> {
    try {
      // Get the coach role ID from static roles
      const coachRole = getRoleByName('Coach');
      
      if (!coachRole) {
        throw new Error('Coach role not found');
      }

      // Create user input
      const userInput: CreateUserInput = {
        email: coachData.email,
        firstName: coachData.firstName,
        lastName: coachData.lastName,
        roles: {
          connect: { id: coachRole.id }
        }
      };

      return await this.createUser(userInput);
    } catch (error) {
      console.error('Error creating coach user:', error);
      throw new Error('Failed to create coach user');
    }
  }

  // Create a coach manager user
  async createCoachManagerUser(managerData: {
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<EightBaseUser> {
    try {
      // Get the coach manager role ID from static roles
      const managerRole = getRoleByName('coach_manager');
      
      if (!managerRole) {
        throw new Error('Coach Manager role not found');
      }

      // Create user input
      const userInput: CreateUserInput = {
        email: managerData.email,
        firstName: managerData.firstName,
        lastName: managerData.lastName,
        roles: {
          connect: { id: managerRole.id }
        }
      };

      return await this.createUser(userInput);
    } catch (error) {
      console.error('Error creating coach manager user:', error);
      throw new Error('Failed to create coach manager user');
    }
  }

  // Create a coach manager user who is also a coach (can have students assigned)
  async createCoachManagerWithCoachRecord(managerData: {
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<{ user: EightBaseUser; coachRecord: any }> {
    try {
      console.log('=== COACH MANAGER WITH COACH RECORD CREATION ===');
      console.log('Manager data:', managerData);

      // Get the coach manager role ID from static roles
      const managerRole = getRoleByName('coach_manager');
      
      if (!managerRole) {
        throw new Error('Coach Manager role not found');
      }

      // Step 1: Create user with coach_manager role
      const userInput: CreateUserInput = {
        email: managerData.email,
        firstName: managerData.firstName,
        lastName: managerData.lastName,
        roles: {
          connect: { id: managerRole.id }
        }
      };

      console.log('Creating user with Coach Manager role:', userInput);
      const createdUser = await this.createUser(userInput);
      console.log('User created successfully:', createdUser);

      if (!createdUser) {
        throw new Error('Failed to create user');
      }

      // Step 2: Create coach record and link to user
      const coachData = {
        firstName: managerData.firstName,
        lastName: managerData.lastName,
        email: managerData.email,
        bio: '',
        users: {
          connect: { id: createdUser.id }
        }
      };

      console.log('Creating Coach record for coach manager:', coachData);
      const coachRecord = await eightbaseService.createCoachDirect(coachData);
      console.log('Coach record created successfully:', coachRecord);

      return { user: createdUser, coachRecord };
    } catch (error) {
      console.error('Error creating coach manager with coach record:', error);
      throw new Error('Failed to create coach manager with coach record');
    }
  }

  // Check if user has specific role
  async userHasRole(userId: string, roleName: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user || !user.roles) return false;

      return user.roles.items.some(role => role.name === roleName);
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  }

  // Get users by role
  async getUsersByRole(roleName: string): Promise<EightBaseUser[]> {
    try {
      const allUsers = await this.getAllUsers();
      return allUsers.filter(user => 
        user.roles?.items.some(role => role.name === roleName)
      );
    } catch (error) {
      console.error('Error getting users by role:', error);
      return [];
    }
  }

  // Get current authenticated user
  async getCurrentUser(): Promise<EightBaseUser | null> {
    try {
      // This would typically use the current authentication context
      // For now, we'll try to get the first user as a fallback
      const allUsers = await this.getAllUsers();
      return allUsers.length > 0 ? allUsers[0] : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Create a default student user if no users exist
  async createDefaultStudent(): Promise<EightBaseUser | null> {
    try {
      const allUsers = await this.getAllUsers();
      if (allUsers.length === 0) {
        // Get student role from static roles
        const studentRole = getRoleByName('Student');

        if (studentRole) {
          const defaultUser = await this.createUser({
            email: 'student@example.com',
            firstName: 'Demo',
            lastName: 'Student',
            roles: {
              connect: { id: studentRole.id }
            }
          });

          console.log('Created default student user:', defaultUser);
          return defaultUser;
        } else {
          // If no student role found, create user without role
          const defaultUser = await this.createUser({
            email: 'student@example.com',
            firstName: 'Demo',
            lastName: 'Student'
          });

          console.log('Created default student user (no role):', defaultUser);
          return defaultUser;
        }
      }
      return null;
    } catch (error) {
      console.error('Error creating default student:', error);
      return null;
    }
  }
}

export const eightBaseUserService = new EightBaseUserService(); 