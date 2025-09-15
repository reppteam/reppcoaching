import { gql } from '@apollo/client';
import {
  User, WeeklyReport, Goal, Pricing, Lead, Note, MessageTemplate,
  StudentProfile, CallLog, GlobalVariables, Product, Subitem,
  EngagementTag, StudentKPIData, CoachKPISummary, KPIBenchmarks, CoachPricingItem, StudentActivitySummary
} from '../types';
import * as queries from '../graphql';
// Custom user creation mutation with roles support
const CREATE_USER_WITH_ROLES = queries.CREATE_USER_MUTATION;

// Create Coach record mutation
const CREATE_COACH = queries.CREATE_COACH;

// Create Student record mutation
const CREATE_STUDENT = queries.CREATE_STUDENT;

// We'll use the authenticated Apollo Client from the context instead of creating our own
let apolloClient: any = null;

export const setApolloClient = (client: any) => {
  apolloClient = client;
};

// Helper function to execute GraphQL queries
const executeQuery = async (query: any, variables?: any) => {
  if (!apolloClient) {
    throw new Error('Apollo Client not initialized. Please call setApolloClient first.');
  }
  
  try {
    console.log('Executing GraphQL query:', query);
    console.log('Query variables:', variables);
    const { data } = await apolloClient.query({
      query,
      variables
    });
    console.log('Query executed successfully, data received:', data);
    return data;
  } catch (error) {
    console.error('GraphQL Query Error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
};

// Helper function to execute GraphQL mutations
const executeMutation = async (mutation: any, variables?: any) => {
  if (!apolloClient) {
    throw new Error('Apollo Client not initialized. Please call setApolloClient first.');
  }
  
  try {
    const { data } = await apolloClient.mutate({
      mutation,
      variables
    });
    return data;
  } catch (error) {
    console.error('GraphQL Mutation Error:', error);
    throw error;
  }
};

// Transform 8base data to match your types
const transformUser = (user: any): User => {
  // Determine the role from the roles relationship
  let userRole: 'user' | 'coach' | 'coach_manager' | 'super_admin' = 'user';
  
  if (user.roles && user.roles.items && user.roles.items.length > 0) {
    // Get the first role from the roles relationship
    const roleName = user.roles.items[0].name;
    
    // Map role names to your application's role values
    switch (roleName.toLowerCase()) {
      case 'superadmin':
      case 'administrator':
      case 'admin':
        userRole = 'super_admin';
        break;
      case 'coach manager':
      case 'coach_manager':
        userRole = 'coach_manager';
        break;
      case 'coach':
        userRole = 'coach';
        break;
      case 'student':
      case 'user':
      default:
        userRole = 'user';
        break;
    }
  }

  // Handle legacy data where assignedCoach might not be populated
      let assignedCoach = user.assignedCoach;
  if (!assignedCoach && user.assigned_admin_id) {
    // For legacy data, we'll create a placeholder assignedCoach object
    // This will be resolved when we load all users and can match the IDs
    assignedCoach = {
      id: user.assigned_admin_id,
      firstName: 'Unknown',
      lastName: 'Coach',
      email: 'unknown@example.com'
    };
  }

  return {
    id: user.id,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email,
    role: userRole,
    assigned_admin_id: user.assigned_admin_id || null,
    assignedCoach: assignedCoach,
    access_start: new Date().toISOString().split('T')[0], // Default to today
    access_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], // Default to 1 year from now
    has_paid: true, // Default to true
    created_at: user.createdAt,
    coaching_term_start: null, // Not available in new schema
    coaching_term_end: null, // Not available in new schema
    is_active: true // Default to true
  };
};

const transformWeeklyReport = (report: any): WeeklyReport => ({
  id: report.id,
  user_id: report.student?.id,
  start_date: report.start_date,
  end_date: report.end_date,
  new_clients: report.new_clients,
  paid_shoots: report.paid_shoots,
  free_shoots: report.free_shoots,
  unique_clients: report.unique_clients,
  aov: report.aov,
  revenue: report.revenue,
  expenses: report.expenses,
  editing_cost: report.editing_cost,
  net_profit: report.net_profit,
  status: report.status,
  created_at: report.createdAt,
  updated_at: report.updatedAt
});

const transformLead = (lead: any): Lead => ({
  id: lead.id,
  user_id: lead.user?.id,
  lead_name: lead.lead_name,
  email: lead.email,
  phone: lead.phone,
  instagram_handle: lead.instagram_handle,
  lead_source: lead.lead_source,
  initial_call_outcome: lead.initial_call_outcome,
  date_of_initial_call: lead.date_of_initial_call,
  last_followup_outcome: lead.last_followup_outcome,
  date_of_last_followup: lead.date_of_last_followup,
  next_followup_date: lead.next_followup_date,
  engagementTag: lead.engagementTag?.items?.map((tag: any) => ({
    id: tag.id,
    type: tag.type,
    completed_date: tag.completed_date
  })) || [],
  script_components: lead.script_Component ? {
    intro: lead.script_Component.intro,
    hook: lead.script_Component.hook,
    body1: lead.script_Component.body1,
    body2: lead.script_Component.body2,
    ending: lead.script_Component.ending
  } : {
    intro: '',
    hook: '',
    body1: '',
    body2: '',
    ending: ''
  },
  status: lead.status,
  created_at: lead.createdAt,
  updated_at: lead.updatedAt
});

const transformStudentLead = (lead: any): Lead => {
  return {
    id: lead.id,
    user_id: lead.user?.id || '', // This will be set by the service
    lead_name: lead.lead_name,
    email: lead.email,
    phone: lead.phone,
    instagram_handle: lead.instagram_handle,
    lead_source: lead.lead_source,
    initial_call_outcome: lead.initial_call_outcome,
    date_of_initial_call: lead.date_of_initial_call,
    last_followup_outcome: lead.last_followup_outcome,
    date_of_last_followup: lead.date_of_last_followup,
    next_followup_date: lead.next_followup_date,
    engagementTag: lead.engagementTag?.items?.map((tag: any) => ({
      id: tag.id,
      type: tag.type,
      completed_date: tag.completed_date
    })) || [],
    script_components: {
      intro: '',
      hook: '',
      body1: '',
      body2: '',
      ending: ''
    },
    status: lead.status,
    created_at: lead.createdAt,
    updated_at: lead.updatedAt
  };
};

const transformGoal = (goal: any): Goal => {
  return {
  id: goal.id,
    user_id: goal.student?.id || '',
  title: goal.title || 'Monthly Goal',
  description: goal.description || '',
  target_value: goal.target_value || 0,
  current_value: goal.current_value || 0,
  goal_type: goal.goal_type || 'revenue',
    deadline: goal.deadline || goal.month_start || new Date().toISOString(),
  priority: goal.priority || 'medium',
  status: goal.status || 'active',
  created_at: goal.createdAt,
  updated_at: goal.updatedAt
  };
};

const transformPricing = (pricing: any): Pricing => ({
  id: pricing.id,
  user_id: pricing.student?.id,
  service_name: pricing.service_name,
  your_price: pricing.your_price,
  competitor_price: pricing.competitor_price,
  estimated_cost: pricing.estimated_cost,
  estimated_profit: pricing.estimated_profit,
  status: pricing.status,
  created_at: pricing.createdAt,
  updated_at: pricing.updatedAt
});

const transformCoachPricing = (pricing: any): CoachPricingItem => ({
  id: pricing.id,
  name: pricing.name,
  description: pricing.description,
  price: pricing.price,
  duration_weeks: pricing.duration_weeks,
  category: pricing.category,
  package_Features: pricing.package_Features || [],
  status: pricing.status,
  createdAt: pricing.createdAt,
  updatedAt: pricing.updatedAt,
  user: pricing.user ? {
    id: pricing.user.id,
    firstName: pricing.user.firstName,
    lastName: pricing.user.lastName,
    email: pricing.user.email
  } : {
    id: '',
    firstName: '',
    lastName: '',
    email: ''
  }
});

const transformCallLog = (callLog: any): CallLog => ({
  id: callLog.id,
  student_id: callLog.student?.id,
  coach_id: callLog.coach?.id,
  call_date: callLog.call_date,
  call_duration: callLog.call_duration,
  call_type: callLog.call_type,
  topics_discussed: callLog.topics_discussed,
  outcome: callLog.outcome,
  next_steps: callLog.next_steps,
  student_mood: callLog.student_mood,
  created_at: callLog.createdAt,
  updated_at: callLog.updatedAt
});

const transformProduct = (product: any): Product => ({
  id: product.id,
  user_id: product.user?.id,
  name: product.name,
  price: product.price,
  created_at: product.createdAt,
  updated_at: product.updatedAt
});

const transformSubitem = (subitem: any): Subitem => ({
  id: subitem.id,
  product_id: subitem.product?.id,
  type: subitem.type,
  label: subitem.label,
  value: subitem.value,
  created_at: subitem.createdAt,
  updated_at: subitem.updatedAt
});

const transformNote = (note: any): Note => ({
  id: note.id,
  title: note.title || '',
  target_type: note.targetType || note.target_type,
  target_id: note.targetId || note.target_id,
  user_id: note.userId || note.user_id,
  content: note.content,
  visibility: note.visibility || 'public',
  created_at: note.createdAt || note.created_at,
  created_by: note.createdBy || note.created_by,
  created_by_name: note.createdByName || note.created_by_name
});

// 8base Service API
export const eightbaseService = {
  // User Management
  async getUsers(): Promise<User[]> {
    try {
      console.log('Executing GET_USERS query...');
      const data = await executeQuery(queries.GET_USERS);
      console.log('Raw data from GET_USERS:', data);
      console.log('usersList:', data?.usersList);
      console.log('items:', data?.usersList?.items);
      console.log('items length:', data?.usersList?.items?.length);
      
      if (!data?.usersList?.items) {
        console.error('No usersList.items found in response');
        return [];
      }
      
      const transformedUsers = data.usersList.items.map(transformUser);
      console.log('Transformed users:', transformedUsers);
      console.log('Transformed users length:', transformedUsers.length);
      return transformedUsers;
    } catch (error) {
      console.error('Error in getUsers:', error);
      throw error;
    }
  },

  async getUsersByFilter(filter: any): Promise<User[]> {
    const data = await executeQuery(queries.GET_USER_BY_FILTER, { filter });
    return data.usersList.items.map(transformUser);
  },

  // Create user directly without complex transformation (for coach/student creation)
  async createUserDirect(userData: any): Promise<any> {
    try {
      console.log('Creating user directly with data:', userData);
      
      const userResult = await executeMutation(CREATE_USER_WITH_ROLES, { data: userData });
      console.log('Direct user creation result:', userResult);
      
      if (!userResult || !userResult.userCreate) {
        throw new Error('User creation failed - no result returned');
      }
      
      return userResult.userCreate;
    } catch (error) {
      console.error('Error in direct user creation:', error);
      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async createUser(userData: any): Promise<User> {
    try {
      // Transform the userData to handle role field
      const transformedUserData = await this.transformUserDataForCreation(userData);
      
      // First, create the user
      console.log('Sending mutation with data:', transformedUserData);
      
      let createdUser: any;
      try {
        const userResult = await executeMutation(CREATE_USER_WITH_ROLES, { data: transformedUserData });
        console.log('Mutation result:', userResult);
        
        if (!userResult || !userResult.userCreate) {
          throw new Error('User creation failed - no result returned');
        }
        
        createdUser = transformUser(userResult.userCreate);
        console.log('User created successfully:', createdUser);
      } catch (userCreationError) {
        console.error('Error in user creation mutation:', userCreationError);
        console.error('Transformed data that was sent:', transformedUserData);
        throw new Error(`Failed to create user: ${userCreationError instanceof Error ? userCreationError.message : 'Unknown error'}`);
      }
      
      // Determine the user's role
      let userRole: 'user' | 'coach' | 'coach_manager' | 'super_admin' = 'user';
        console.log('Determining user role from transformed data:', transformedUserData.roles);
        
        if (transformedUserData.roles && transformedUserData.roles.connect && transformedUserData.roles.connect.length > 0) {
          const firstRole = transformedUserData.roles.connect[0];
          console.log('First role in connection:', firstRole);
          
          // Check if we have role ID or role name
          let roleName: string | null = null;
          
          if (firstRole.name) {
            roleName = firstRole.name;
            console.log('Role name from connection:', roleName);
          } else if (firstRole.id) {
            // If we only have ID, try to get the role name from the database
            console.log('Role ID found, fetching role name:', firstRole.id);
            try {
              const roleData = await this.getRoleById(firstRole.id);
              roleName = roleData?.name || null;
              console.log('Fetched role name by ID:', roleName);
            } catch (error) {
              console.error('Error fetching role name by ID:', error);
            }
          }
          
          if (roleName) {
        switch (roleName.toLowerCase()) {
          case 'superadmin':
          case 'administrator':
          case 'admin':
            userRole = 'super_admin';
            break;
          case 'coach manager':
          case 'coach_manager':
            userRole = 'coach_manager';
            break;
          case 'coach':
            userRole = 'coach';
            break;
          case 'student':
          case 'user':
          default:
            userRole = 'user';
            break;
        }
            console.log('Determined user role:', userRole);
          } else {
            console.log('Could not determine role name, defaulting to user role');
            userRole = 'user';
          }
        } else {
          console.log('No roles found in transformed data, defaulting to user role');
        }
      
      console.log('=== PROFILE CREATION DECISION ===');
      console.log('Determined userRole:', userRole);
      console.log('User data role:', userData.role);
      console.log('Will create coach profile:', userRole === 'coach');
      console.log('Will create student profile:', userRole === 'user');
      
      // Create Coach record if user has coach role
      if (userRole === 'coach') {
        try {
          console.log('=== STARTING COACH PROFILE CREATION ===');
          const coachData = {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email||'',
            user: {
              connect: { id: createdUser.id }
            }
          };
          
          console.log('Creating coach profile with data:', coachData);
          const coachResult = await executeMutation(CREATE_COACH, { data: coachData });
          console.log(`Coach record created and connected to user: ${createdUser.id}`, coachResult);
          
          console.log('Coach profile created successfully with names:', coachData.firstName, coachData.lastName);
        } catch (coachError) {
          console.error('Failed to create coach record:', coachError);
          console.error('Coach creation error details:', coachError);
          // Don't fail the entire operation if coach creation fails
        }
      }
      
      // Create Student record if user has student/user role
      if (userRole === 'user') {
        try {
          console.log('=== STARTING STUDENT PROFILE CREATION ===');
          const studentData = {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            user: {
              connect: { id: createdUser.id }
            }
          };
          
          console.log('Creating student profile with data:', studentData);
          console.log('Student data being sent to mutation:', JSON.stringify(studentData, null, 2));
          
          const studentResult = await executeMutation(CREATE_STUDENT, { data: studentData });
          console.log(`Student record created and connected to user: ${createdUser.id}`, studentResult);
          
          console.log('Student profile created successfully with names:', studentData.firstName, studentData.lastName);
        } catch (studentError) {
          console.error('Failed to create student record:', studentError);
          console.error('Student creation error details:', studentError);
          // Don't fail the entire operation if student creation fails
        }
      }
      
      // Fallback: If user has "Student" role but userRole wasn't set correctly, still create student profile
      if (userData.role && userData.role.toLowerCase() === 'student' && userRole !== 'user') {
        try {
          console.log('=== FALLBACK STUDENT PROFILE CREATION ===');
          console.log('User has Student role but userRole was determined as:', userRole);
          
          const studentData = {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            user: {
              connect: { id: createdUser.id }
            }
          };
          
          console.log('Creating fallback student profile with data:', studentData);
          const studentResult = await executeMutation(CREATE_STUDENT, { data: studentData });
          console.log(`Fallback student record created and connected to user: ${createdUser.id}`, studentResult);
          
          console.log('Fallback student profile created successfully with names:', studentData.firstName, studentData.lastName);
        } catch (studentError) {
          console.error('Failed to create fallback student record:', studentError);
          console.error('Fallback student creation error details:', studentError);
        }
      }
      
      return createdUser;
    } catch (error) {
      console.error('Error creating user with related records:', error);
      throw error;
    }
  },

  async updateUser(id: string, updates: any, coachId?: string): Promise<User> {
    // Transform the updates to match the correct field names
    const transformedUpdates = await this.transformUserDataForCreation(updates);
    
    // Map field names to correct 8base field names
    if (updates.email) transformedUpdates.email = updates.email;
    if (updates.firstName) transformedUpdates.firstName = updates.firstName;
    if (updates.lastName) transformedUpdates.lastName = updates.lastName;
    if (updates.status) transformedUpdates.status = updates.status;
    if (updates.origin) transformedUpdates.origin = updates.origin;
    if (updates.timezone) transformedUpdates.timezone = updates.timezone;
    if (updates.has_paid !== undefined) transformedUpdates.has_paid = updates.has_paid;
    if (updates.access_start) transformedUpdates.access_start = updates.access_start;
    if (updates.access_end) transformedUpdates.access_end = updates.access_end;
    
    if (updates.role) {
      console.log('Role updates need special handling - skipping for now');
    }
    
    // Handle coach assignment - check if coachId is provided in updates or as parameter
    if (updates.coachId || coachId) {
      const coachToConnect = updates.coachId || coachId;
      transformedUpdates.coach = {
        connect: { id: coachToConnect }
      };
      console.log('Connecting user to coach:', coachToConnect);
    }
    
    // Remove fields that don't exist in UserUpdateInput
    const validFields = [
      'firstName', 'lastName', 'email', 'status', 'origin', 'timezone',
      'roles', 'coach', 'has_paid', 'access_start', 'access_end'
    ];
    
    // Only include valid fields
    const finalUpdates: any = {};
    Object.keys(transformedUpdates).forEach(key => {
      if (validFields.includes(key)) {
        finalUpdates[key] = transformedUpdates[key];
      }
    });
    
    const data = await executeMutation(queries.UPDATE_USER_WITH_COACH_CONNECTION, { 
      filter: { id }, 
      data: finalUpdates 
    });
    
    // If role is being changed to coach, ensure coach record exists
    if (updates.role === 'coach') {
      await this.ensureCoachRecord(id, updates);
    }
    
    return transformUser(data.userUpdate);
  },

  async updateUserWithCoach(id: string, updates: any, coachUserId?: string): Promise<User> {
    // Transform the updates to match the correct field names
    const transformedUpdates = await this.transformUserDataForCreation(updates);
    
    // Map field names to correct 8base field names
    if (updates.email) transformedUpdates.email = updates.email;
    if (updates.firstName) transformedUpdates.firstName = updates.firstName;
    if (updates.lastName) transformedUpdates.lastName = updates.lastName;
    if (updates.status) transformedUpdates.status = updates.status;
    if (updates.origin) transformedUpdates.origin = updates.origin;
    if (updates.timezone) transformedUpdates.timezone = updates.timezone;
    if (updates.has_paid !== undefined) transformedUpdates.has_paid = updates.has_paid;
    if (updates.access_start) transformedUpdates.access_start = updates.access_start;
    if (updates.access_end) transformedUpdates.access_end = updates.access_end;
    
    // Handle roles - convert role string to roles connection
    if (updates.role) {
      // This would need to be handled differently based on your role system
      // For now, we'll skip role updates as they need special handling
      console.log('Role updates need special handling - skipping for now');
    }
    
    // Construct the data object with coach connection
    const dataObject = {
      ...transformedUpdates
    };
    
    if (coachUserId) {
      // Connect user to coach directly through User table
      dataObject.coach = {
        connect: { id: coachUserId }
      };
      console.log('Connecting user to coach:', coachUserId);
    }
    
    console.log('Final mutation data being sent:');
    console.log('- filter.id (user ID):', id);
    console.log('- dataObject:', dataObject);
    
    const data = await executeMutation(queries.UPDATE_USER_WITH_COACH_CONNECTION, { 
      filter: { id }, 
      data: dataObject 
    });
    return transformUser(data.userUpdate);
  },

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: gql`${queries.DELETE_USER}`,
        variables: {
          filter: {
            id: userId
          }
        }
      });
      
      return data.userDestroy.success;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  async assignStudentToCoach(studentId: string, coachId: string | null): Promise<User> {
    if (coachId) {
      // Connect student to coach through User table
      console.log('Connecting student to coach through User table');
      console.log('- studentId:', studentId);
      console.log('- coachId:', coachId);
      
      const dataObject = {
        coach: {
          connect: { id: coachId }
        }
      };
      
      const data = await executeMutation(queries.UPDATE_USER_WITH_COACH_CONNECTION, {
        filter: { id: studentId },
        data: dataObject
      });
      
      return transformUser(data.userUpdate);
    } else {
      // Disconnect from current coach
      console.log('Disconnecting student from current coach');
      
      const dataObject = {
        coach: {
          disconnect: true
        }
      };
      
      const data = await executeMutation(queries.UPDATE_USER_WITH_COACH_CONNECTION, {
        filter: { id: studentId },
        data: dataObject
      });
      
      return transformUser(data.userUpdate);
    }
  },

  async createCoachForUser(userId: string, coachData: any): Promise<any> {
    try {
      const coachRecordData = {
        firstName: coachData.firstName || '',
        lastName: coachData.lastName || '',
        email: coachData.email,
        bio: coachData.bio || '',
        user: {
          connect: { id: userId }
        }
      };
      
      const data = await executeMutation(CREATE_COACH, { data: coachRecordData });
      console.log(`Coach record created and connected to user: ${userId}`);
      return data.coachCreate;
    } catch (error) {
      console.error('Failed to create coach record:', error);
      throw error;
    }
  },

  async ensureCoachRecord(userId: string, userData: any): Promise<void> {
    try {
      // Check if coach record already exists for this user
      const existingCoach = await this.getCoachByUserId(userId);
      
      if (!existingCoach) {
        // Create coach record if it doesn't exist
        await this.createCoachForUser(userId, userData);
      }
    } catch (error) {
      console.error('Failed to ensure coach record:', error);
      // Don't throw error to avoid breaking the main operation
    }
  },

  async getAllCoaches(): Promise<any[]> {
    try {
      const { data } = await apolloClient.query({
        query: queries.GET_ALL_COACHES,
        fetchPolicy: 'network-only'
      });
      
      return data.usersList.items || [];
    } catch (error) {
      console.error('Error fetching coaches:', error);
      return [];
    }
  },

  async getAllCoachesDirect(): Promise<any[]> {
    try {
      const { data } = await apolloClient.query({
        query: queries.GET_ALL_COACHES_DIRECT,
        fetchPolicy: 'network-only'
      });
      
      return data.coachesList.items || [];
    } catch (error) {
      console.error('Error fetching coaches directly:', error);
      return [];
    }
  },

  async getAllCoachesWithCoachTableIds(): Promise<any[]> {
    try {
      const { data } = await apolloClient.query({
        query: queries.GET_ALL_COACHES_WITH_COACH_TABLE_IDS,
        fetchPolicy: 'network-only'
      });
      
      return data.usersList.items || [];
    } catch (error) {
      console.error('Error fetching coaches with coach table IDs:', error);
      return [];
    }
  },

  async getCoachByUserId(userId: string): Promise<any> {
    try {
      const data = await executeQuery(queries.GET_COACH_BY_USER_ID, { userId });
      return data.usersList.items.length > 0 ? data.usersList.items[0] : null;
    } catch (error) {
      console.error('Failed to get coach by user ID:', error);
      return null;
    }
  },

  async updateCoachingTermDates(userId: string, startDate: string, endDate: string): Promise<User> {
    // This method is disabled because coachingTermStart and coachingTermEnd fields don't exist in the current 8base schema
    // For now, just return the current user data
    const users = await this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

  // Student Profile Management
  async getStudentProfile(userId: string): Promise<StudentProfile | null> {
    const data = await executeQuery(queries.GET_STUDENT_PROFILE_BY_FILTER, {
      filter: { id: { equals: userId } }
    });
    return data.usersList.items.length > 0 ? data.usersList.items[0].student : null;
  },

  async getStudentProfileByUserId(userId: string): Promise<any | null> {
    try {
      console.log('Looking for student profile for user ID:', userId);
      
      // Try to find student profile by querying the user table
      // Look for users that have a student connection
      try {
        const data = await executeQuery(queries.GET_STUDENT_PROFILE_BY_FILTER, {
          filter: { id: { equals: userId } }
        });
        
        if (data.usersList?.items && data.usersList.items.length > 0) {
          const user = data.usersList.items[0];
          if (user.student) {
            console.log('Found student profile:', user.student);
            return user.student;
          }
        }
      } catch (queryError) {
        console.log('Student profile query failed, trying alternative approach:', queryError);
      }
      
      // Alternative: try to find by user ID directly
      try {
        const data = await executeQuery(queries.GET_STUDENT_PROFILE_BY_FILTER, {
          filter: { id: { equals: userId } }
        });
        
        if (data.usersList?.items && data.usersList.items.length > 0) {
          const user = data.usersList.items[0];
          if (user.student) {
            console.log('Found student profile by user ID:', user.student);
            return user.student;
          }
        }
      } catch (idQueryError) {
        console.log('Student profile ID query also failed:', idQueryError);
      }
      
      console.log('No student profile found for user ID:', userId);
      return null;
    } catch (error) {
      console.error('Error fetching student profile by user ID:', error);
      return null;
    }
  },

  async updateStudentProfile(userId: string, updates: Partial<StudentProfile>): Promise<StudentProfile> {
    const existingProfile = await this.getStudentProfile(userId);

    if (existingProfile) {
      const data = await executeMutation(queries.UPDATE_STUDENT_PROFILE, {
        id: existingProfile.id,
        data: updates
      });
      return data.studentUpdate;
    } else {
      const data = await executeMutation(queries.CREATE_STUDENT_PROFILE, {
        data: { ...updates, student: { connect: { id: userId } } }
      });
      return data.studentCreate;
    }
  },

  // Weekly Reports
  async getWeeklyReports(userId?: string): Promise<WeeklyReport[]> {
    try {
      let filter = {};
      
      if (userId) {
        // Try to filter by weekly_Report field first (connects to user)
        try {
          filter = { weekly_Report: { id: { equals: userId } } };
          console.log('Trying to filter by weekly_Report field:', filter);
          
          const data = await executeQuery(queries.GET_WEEKLY_REPORTS_BY_FILTER, { filter });
          console.log('Weekly reports query response with weekly_Report filter:', data);
          
          if (data.weeklyReportsList?.items) {
            const reports = data.weeklyReportsList.items.map(transformWeeklyReport);
            console.log('Successfully filtered by weekly_Report field, found reports:', reports.length);
            return reports;
          }
        } catch (weeklyReportFilterError) {
          console.log('Weekly_Report field filter failed, trying student field:', weeklyReportFilterError);
        }
        
        // Fallback: try to filter by student field
        try {
          filter = { student: { id: { equals: userId } } };
          console.log('Trying to filter by student field:', filter);
          
          const data = await executeQuery(queries.GET_WEEKLY_REPORTS_BY_FILTER, { filter });
          console.log('Weekly reports query response with student filter:', data);
          
          if (data.weeklyReportsList?.items) {
            const reports = data.weeklyReportsList.items.map(transformWeeklyReport);
            console.log('Successfully filtered by student field, found reports:', reports.length);
            return reports;
          }
        } catch (studentFilterError) {
          console.log('Student field filter failed, trying createdBy filter:', studentFilterError);
        }
        
        // Fallback: filter by createdBy field (current schema)
        try {
          filter = { createdBy: { id: { equals: userId } } };
          console.log('Trying to filter by createdBy field:', filter);
          
          const data = await executeQuery(queries.GET_WEEKLY_REPORTS_BY_FILTER, { filter });
          console.log('Weekly reports query response with createdBy filter:', data);
          
          if (data.weeklyReportsList?.items) {
            const reports = data.weeklyReportsList.items.map(transformWeeklyReport);
            console.log('Successfully filtered by createdBy field, found reports:', reports.length);
            return reports;
          }
        } catch (createdByFilterError) {
          console.log('CreatedBy field filter also failed:', createdByFilterError);
        }
        
        // Last resort: get all reports and filter in memory
        console.log('All filters failed, getting all reports and filtering in memory');
        const allData = await executeQuery(queries.GET_WEEKLY_REPORTS_BY_FILTER, {});
        const allReports = allData.weeklyReportsList?.items?.map(transformWeeklyReport) || [];
        
        // Filter by weekly_Report field in memory first, then fallback to other fields
        const filteredReports = allReports.filter((report: any) => 
          report.weekly_Report?.id === userId || 
          report.student?.id === userId || 
          report.createdBy?.id === userId || 
          report.user_id === userId
        );
        
        console.log('Filtered reports in memory:', {
          totalReports: allReports.length,
          filteredReports: filteredReports.length,
          userId: userId
        });
        
        return filteredReports;
      } else {
        // No userId provided, get all reports
        console.log('No userId provided, getting all weekly reports');
        const data = await executeQuery(queries.GET_WEEKLY_REPORTS_BY_FILTER, {});
        const reports = data.weeklyReportsList?.items?.map(transformWeeklyReport) || [];
        console.log('Total weekly reports found:', reports.length);
        return reports;
      }
    } catch (error) {
      console.error('Error in getWeeklyReports:', error);
      return [];
    }
  },

  async getWeeklyReportsByCoach(coachId: string): Promise<WeeklyReport[]> {
    // This filter needs to be updated to use the new schema structure
    // For now, get all reports and filter by coach in memory
    const allReports = await this.getWeeklyReports();
    return allReports.filter(report => {
      // Find the user for this report and check if they're assigned to this coach
      // This is a temporary workaround until the schema is properly updated
      return true; // Return all reports for now
    });
  },

  async createWeeklyReport(report: Omit<WeeklyReport, 'id' | 'created_at' | 'updated_at'> & { student_id?: string }): Promise<WeeklyReport> {
    // Transform the data to include both weekly_Report (user) and student connections
    const reportData: any = {
      start_date: report.start_date,
      end_date: report.end_date,
      new_clients: report.new_clients,
      paid_shoots: report.paid_shoots,
      free_shoots: report.free_shoots,
      unique_clients: report.unique_clients,
      aov: report.aov,
      revenue: report.revenue,
      expenses: report.expenses,
      editing_cost: report.editing_cost,
      net_profit: report.net_profit,
      status: report.status,
      weekly_Report: {
        connect: { id: report.user_id }  // Connect to user via weekly_Report field
      }
    };
    
    // Add student connection - this should connect to the student table ID, not the user ID
    if (report.student_id && report.student_id !== report.user_id) {
      reportData.student = {
        connect: { id: report.student_id }  // Connect to actual student table ID
      };
      console.log('Connecting to student table with ID:', report.student_id);
    } else {
      // If no separate student ID provided, we need to find the student profile ID
      console.log('No separate student ID provided, will need to find student profile');
      // For now, we'll skip the student connection if we don't have a proper student ID
      // This prevents creating invalid connections
    }
    
    console.log('Creating weekly report with data:', reportData);
    
    const data = await executeMutation(queries.CREATE_WEEKLY_REPORT, { data: reportData });
    console.log('Weekly report creation response:', data);
    
    return transformWeeklyReport(data.weeklyReportCreate);
  },

  async updateWeeklyReport(id: string, updates: Partial<WeeklyReport>): Promise<WeeklyReport> {
    // Ensure ID is a string
    const reportId = String(id);
    
    // Format the data to match WeeklyReportUpdateInput structure
    // Try both formats to see which one works
    const formattedData: any = {};
    const formattedDataWithSet: any = {};
    
    if (updates.start_date) {
      formattedData.start_date = updates.start_date;
      formattedDataWithSet.start_date = { set: updates.start_date };
    }
    if (updates.end_date) {
      formattedData.end_date = updates.end_date;
      formattedDataWithSet.end_date = { set: updates.end_date };
    }
    if (updates.new_clients !== undefined) {
      formattedData.new_clients = updates.new_clients;
      formattedDataWithSet.new_clients = { set: updates.new_clients };
    }
    if (updates.paid_shoots !== undefined) {
      formattedData.paid_shoots = updates.paid_shoots;
      formattedDataWithSet.paid_shoots = { set: updates.paid_shoots };
    }
    if (updates.free_shoots !== undefined) {
      formattedData.free_shoots = updates.free_shoots;
      formattedDataWithSet.free_shoots = { set: updates.free_shoots };
    }
    if (updates.unique_clients !== undefined) {
      formattedData.unique_clients = updates.unique_clients;
      formattedDataWithSet.unique_clients = { set: updates.unique_clients };
    }
    if (updates.aov !== undefined) {
      formattedData.aov = updates.aov;
      formattedDataWithSet.aov = { set: updates.aov };
    }
    if (updates.revenue !== undefined) {
      formattedData.revenue = updates.revenue;
      formattedDataWithSet.revenue = { set: updates.revenue };
    }
    if (updates.expenses !== undefined) {
      formattedData.expenses = updates.expenses;
      formattedDataWithSet.expenses = { set: updates.expenses };
    }
    if (updates.editing_cost !== undefined) {
      formattedData.editing_cost = updates.editing_cost;
      formattedDataWithSet.editing_cost = { set: updates.editing_cost };
    }
    if (updates.net_profit !== undefined) {
      formattedData.net_profit = updates.net_profit;
      formattedDataWithSet.net_profit = { set: updates.net_profit };
    }
    if (updates.status) {
      formattedData.status = updates.status;
      formattedDataWithSet.status = { set: updates.status };
    }
    
    console.log('Updating weekly report with formatted data:', formattedData);
    console.log('Report ID to update:', reportId, 'Type:', typeof reportId);
    
    try {
      // Try the ID-only update first
      try {
        console.log('Trying ID-only update with ID:', reportId);
        const data = await executeMutation(queries.UPDATE_WEEKLY_REPORT_BY_ID_ONLY, {
          id: reportId,
          data: formattedData
        });
        console.log('ID-only update mutation response:', data);
        return transformWeeklyReport(data.weeklyReportUpdate);
      } catch (idOnlyError) {
        console.log('ID-only update failed, trying simple update:', idOnlyError);
        
        // Try the simple update
        try {
          console.log('Trying simple update with ID:', reportId);
          const data = await executeMutation(queries.UPDATE_WEEKLY_REPORT_SIMPLE, {
            id: reportId,
            data: formattedData
          });
          console.log('Simple update mutation response:', data);
          return transformWeeklyReport(data.weeklyReportUpdate);
        } catch (simpleError) {
          console.log('Simple update failed, trying direct update:', simpleError);
          
          // Try direct update
          try {
            const data = await executeMutation(queries.UPDATE_WEEKLY_REPORT_DIRECT, {
              id: reportId,
              data: formattedData
            });
            console.log('Direct update mutation response:', data);
            return transformWeeklyReport(data.weeklyReportUpdate);
          } catch (directError) {
            console.log('Direct update failed, trying filter update with set format:', directError);
            
            // Try filter update with set format
            try {
    const data = await executeMutation(queries.UPDATE_WEEKLY_REPORT, {
                filter: { id: { equals: reportId } },
                data: formattedDataWithSet
              });
              console.log('Filter update mutation response:', data);
              return transformWeeklyReport(data.weeklyReportUpdateByFilter.items[0]);
            } catch (filterError) {
              console.log('Filter update with set format failed, trying without set format:', filterError);
              
              // Final fallback: filter update without set format
              const data = await executeMutation(queries.UPDATE_WEEKLY_REPORT, {
                filter: { id: { equals: reportId } },
      data: formattedData
    });
              console.log('Final filter update mutation response:', data);
    return transformWeeklyReport(data.weeklyReportUpdateByFilter.items[0]);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in updateWeeklyReport:', error);
      throw error;
    }
  },

  async deleteWeeklyReport(id: string): Promise<void> {
    await executeMutation(queries.DELETE_WEEKLY_REPORT, { id });
  },

  // Goals
  async getGoals(userId?: string): Promise<Goal[]> {
    const filter = userId ? { student: { id: { equals: userId } } } : {};
    const data = await executeQuery(queries.GET_GOALS_BY_FILTER, { filter });
    console.log('Goals query response:', data);
    console.log('Goals items:', data.goalsList?.items);
    const transformedGoals = data.goalsList?.items?.map(transformGoal) || [];
    console.log('Transformed goals:', transformedGoals);
    return transformedGoals;
  },

  async getGoalsByCoach(coachId: string): Promise<Goal[]> {
    // This filter needs to be updated to use the new schema structure
    // For now, get all goals and filter by coach in memory
    const allGoals = await this.getGoals();
    return allGoals.filter(goal => {
      // Find the user for this goal and check if they're assigned to this coach
      // This is a temporary workaround until the schema is properly updated
      return true; // Return all goals for now
    });
  },

  async createGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal> {
    // First, find the actual student table ID for this user
    let studentTableId: string;
    
    try {
      const studentProfile = await this.getStudentProfileByUserId(goal.user_id);
      if (studentProfile?.id) {
        studentTableId = studentProfile.id;
        console.log('Found student table ID for goal creation:', studentTableId);
      } else {
        console.log('No student profile found, using user ID as fallback');
        studentTableId = goal.user_id;
      }
    } catch (error) {
      console.log('Error fetching student profile, using user ID as fallback:', error);
      studentTableId = goal.user_id;
    }
    
    // Use the actual 8base schema fields
    const goalData = {
      title: goal.title,
      description: goal.description,
      target_value: goal.target_value,
      current_value: goal.current_value,
      goal_type: goal.goal_type,
      deadline: goal.deadline,
      priority: goal.priority,
      status: goal.status,
      month_start: goal.deadline,
      low_goal_revenue: goal.goal_type === 'revenue' ? goal.target_value : 0,
      success_goal_revenue: goal.goal_type === 'revenue' ? goal.target_value : 0,
      actual_revenue: goal.goal_type === 'revenue' ? goal.current_value : 0,
      low_goal_shoots: goal.goal_type === 'shoots' ? goal.target_value : 0,
      success_goal_shoots: goal.goal_type === 'shoots' ? goal.target_value : 0,
      actual_shoots: goal.goal_type === 'shoots' ? goal.current_value : 0,
      aov: goal.goal_type === 'revenue' ? goal.current_value : 0,
      student: {
        connect: { id: goal.user_id } // Connect to the user ID
      },
      goal: {
        connect: { id: studentTableId } // Connect to the student table ID
      }
    };
    
    const data = await executeMutation(queries.CREATE_GOAL, { data: goalData });
    return transformGoal(data.goalCreate);
  },

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
    // Use the actual 8base schema fields
    const goalUpdates: any = {};
    
    if (updates.title !== undefined) goalUpdates.title = updates.title;
    if (updates.description !== undefined) goalUpdates.description = updates.description;
    if (updates.target_value !== undefined) goalUpdates.target_value = updates.target_value;
    if (updates.current_value !== undefined) goalUpdates.current_value = updates.current_value;
    if (updates.goal_type !== undefined) goalUpdates.goal_type = updates.goal_type;
    if (updates.deadline !== undefined) goalUpdates.deadline = updates.deadline;
    if (updates.priority !== undefined) goalUpdates.priority = updates.priority;
    if (updates.status !== undefined) goalUpdates.status = updates.status;
    if (updates.deadline !== undefined) goalUpdates.month_start = updates.deadline;
    
    // Map goal type specific updates for the additional fields
    if (updates.goal_type === 'shoots') {
      if (updates.target_value !== undefined) {
        goalUpdates.low_goal_shoots = updates.target_value;
        goalUpdates.success_goal_shoots = updates.target_value;
      }
      if (updates.current_value !== undefined) goalUpdates.actual_shoots = updates.current_value;
    } else if (updates.goal_type === 'revenue') {
      if (updates.target_value !== undefined) {
        goalUpdates.low_goal_revenue = updates.target_value;
        goalUpdates.success_goal_revenue = updates.target_value;
      }
      if (updates.current_value !== undefined) goalUpdates.actual_revenue = updates.current_value;
    }
    
    if (updates.goal_type === 'revenue' && updates.current_value !== undefined) {
      goalUpdates.aov = updates.current_value;
    }
    
    // Note: Connection fields (student, goal) are not updated during goal updates
    // They are only set during creation to maintain data integrity
    
    const data = await executeMutation(queries.UPDATE_GOAL_SIMPLE, { 
      id, 
      data: goalUpdates 
    });
    return transformGoal(data.goalUpdate);
  },

  async deleteGoal(id: string): Promise<boolean> {
    const result = await executeMutation(queries.DELETE_GOAL, { data: { id } });
    return result.goalDelete?.success || false;
  },

  // Pricing
  async getPricing(userId?: string): Promise<Pricing[]> {
    const filter = userId ? { student: { id: { equals: userId } } } : {};
    const data = await executeQuery(queries.GET_PRICING_BY_FILTER, { filter });
    return data.pricingsList.items.map(transformPricing);
  },

  async createPricing(pricing: Omit<Pricing, 'id' | 'created_at' | 'updated_at'>): Promise<Pricing> {
    const data = await executeMutation(queries.CREATE_PRICING, { data: pricing });
    return transformPricing(data.pricingCreate);
  },

  async updatePricing(id: string, updates: Partial<Pricing>): Promise<Pricing> {
    const data = await executeMutation(queries.UPDATE_PRICING, { id, data: updates });
    return transformPricing(data.pricingUpdate);
  },

  async deletePricing(id: string): Promise<void> {
    await executeMutation(queries.DELETE_PRICING, { id });
  },

  // Coach Pricing
  async getCoachPricing(userId?: string): Promise<CoachPricingItem[]> {
    try {
      // Get all pricing items without filtering by user
      const filter = {};
      console.log('Fetching all pricing packages with filter:', filter);
      const data = await executeQuery(queries.GET_COACH_PRICING_BY_FILTER, { filter });
      console.log('Pricing data received:', data);
      console.log('Full data structure:', JSON.stringify(data, null, 2));
      
      const items = data.pricingsList?.items || [];
      console.log('Pricing items count:', items.length);
      console.log('First item sample:', items[0]);
      
      const transformed = items.map(transformCoachPricing);
      console.log('Transformed pricing items:', transformed);
      
      // Return all packages regardless of user
      return transformed;
    } catch (error) {
      console.error('Error fetching coach pricing:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  },

  async createCoachPricing(pricing: Omit<CoachPricingItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
    const data = await executeMutation(queries.CREATE_COACH_PRICING, { data: pricing });
    return data.pricingCreate.success;
  },

  async updateCoachPricing(id: string, updates: Partial<CoachPricingItem>): Promise<boolean> {
    const data = await executeMutation(queries.UPDATE_COACH_PRICING, { 
      filter: { id }, 
      data: updates 
    });
    return !!data.pricingUpdate.id; // Return true if id exists (success), false otherwise
  },

  async deleteCoachPricing(id: string): Promise<boolean> {
    const data = await executeMutation(queries.DELETE_COACH_PRICING, { filter: { id } });
    return data.pricingDestroy.success;
  },

  // Leads
  async getLeads(userId?: string): Promise<Lead[]> {
    const filter = userId ? { user: { id: { equals: userId } } } : {};
    const data = await executeQuery(queries.GET_LEADS_BY_FILTER, { filter });
    return data.leadsList.items.map(transformLead);
  },

  async getLeadsByCoach(coachId: string): Promise<Lead[]> {
    // This filter needs to be updated to use the new schema structure
    // For now, get all leads and filter by coach in memory
    const allLeads = await this.getLeads();
    return allLeads.filter(lead => {
      // Find the user for this lead and check if they're assigned to this coach
      // This is a temporary workaround until the schema is properly updated
      return true; // Return all leads for now
    });
  },

  async getStudentLeads(userId: string): Promise<Lead[]> {
    const data = await executeQuery(queries.GET_STUDENT_LEADS, { userId });
    return data.leadsList.items.map(transformStudentLead);
  },

  async createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> {
    // Create the lead with only the fields that exist in 8base schema
    const leadData = {
      lead_name: lead.lead_name,
      email: lead.email,
      phone: lead.phone,
      instagram_handle: lead.instagram_handle,
      lead_source: lead.lead_source,
      initial_call_outcome: lead.initial_call_outcome,
      date_of_initial_call: lead.date_of_initial_call,
      last_followup_outcome: lead.last_followup_outcome,
      date_of_last_followup: lead.date_of_last_followup,
      next_followup_date: lead.next_followup_date,
      status: lead.status,
      user: { connect: { id: lead.user_id } }
    };
    
    const data = await executeMutation(queries.CREATE_LEAD, { data: leadData });
    const createdLead = data.leadCreate;

    // Create script components if provided
    if (lead.script_components) {
      await executeMutation(queries.CREATE_SCRIPT_COMPONENTS, {
      data: {
          ...lead.script_components,
          lead: { connect: { id: createdLead.id } }
        }
      });
    }

    // Create engagement tags if provided
    if (lead.engagementTag && lead.engagementTag.length > 0) {
      for (const tag of lead.engagementTag) {
        await executeMutation(queries.CREATE_ENGAGEMENT_TAG, {
          data: {
            type: tag.type,
            completed_date: new Date(tag.completed_date).toISOString().split('T')[0],
          }
        });
      }
    }

    return transformLead(createdLead);
  },

  async createLeadsBulk(leads: Omit<Lead, 'id' | 'created_at' | 'updated_at'>[]): Promise<Lead[]> {
    console.log('Input leads:', leads);
    
    const leadDataArray = leads.map(lead => ({
      lead_name: lead.lead_name,
      email: lead.email,
      phone: lead.phone,
      instagram_handle: lead.instagram_handle,
      lead_source: lead.lead_source,
      initial_call_outcome: lead.initial_call_outcome,
      date_of_initial_call: lead.date_of_initial_call,
      last_followup_outcome: lead.last_followup_outcome,
      date_of_last_followup: lead.date_of_last_followup,
      next_followup_date: lead.next_followup_date,
      status: lead.status,
      user: { connect: { id: lead.user_id } }
    }));

    console.log('Lead data array being sent:', leadDataArray);
    console.log('Using bulk mutation:', queries.CREATE_LEADS_BULK);

    try {
      const data = await executeMutation(queries.CREATE_LEADS_BULK, { data: leadDataArray });
      console.log('Response from bulk create:', data);
      return data.leadCreateMany.items.map(transformLead);
    } catch (error) {
      console.error('Bulk creation failed, falling back to individual creation:', error);
      // Fallback to individual creation if bulk fails
      const createdLeads: Lead[] = [];
      for (const lead of leads) {
        const createdLead = await this.createLead(lead);
        createdLeads.push(createdLead);
      }
      return createdLeads;
    }
  },

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const data = await executeMutation(queries.UPDATE_LEAD_SIMPLE, { 
      id, 
      data: updates 
    });
    return transformLead(data.leadUpdate);
  },

  async updateLeadByFilter(filter: any, updates: any): Promise<Lead> {
    const data = await executeMutation(queries.UPDATE_LEAD_BY_FILTER, { filter, data: updates });
    return transformLead(data.leadUpdateByFilter.items[0]);
  },

  async deleteLead(id: string): Promise<void> {
    await executeMutation(queries.DELETE_LEAD, { id });
  },

  // Engagement Tags
  async addEngagementTag(leadId: string, tag: EngagementTag): Promise<Lead> {
    // Create the engagement tag with lead connection
    const engagementTagData = await executeMutation(queries.CREATE_ENGAGEMENT_TAG, {
      data: {
        type: tag.type,
        completed_date: new Date(tag.completed_date).toISOString().split('T')[0],
        lead: { connect: { id: leadId } }
      }
    });
    
    // Return the updated lead by fetching it
    const leadData = await executeQuery(queries.GET_LEADS_BY_FILTER, {
      filter: { id: { equals: leadId } }
    });
    
    return transformLead(leadData.leadsList.items[0]);
  },

  async updateEngagementTag(id: string, updates: Partial<EngagementTag>): Promise<EngagementTag> {
    const data = await executeMutation(queries.UPDATE_ENGAGEMENT_TAG, {
      id,
      data: {
        ...updates,
        completed_date: updates.completed_date ? 
          new Date(updates.completed_date).toISOString().split('T')[0] : undefined
      }
    });
    return data.engagementTagUpdate;
  },

  async removeEngagementTag(id: string): Promise<void> {
    await executeMutation(queries.DELETE_ENGAGEMENT_TAG, { id });
  },

  // Script Components
  async createScriptComponents(scriptData: any): Promise<any> {
    const data = await executeMutation(queries.CREATE_SCRIPT_COMPONENTS, { data: scriptData });
    return data.scriptComponentsCreate;
  },

  async updateScriptComponents(id: string, updates: any): Promise<any> {
    const data = await executeMutation(queries.UPDATE_SCRIPT_COMPONENTS, { id, data: updates });
    return data.scriptComponentsUpdate;
  },

  async deleteScriptComponents(id: string): Promise<void> {
    await executeMutation(queries.DELETE_SCRIPT_COMPONENTS, { id });
  },

  // Call Logs
  async getCallLogs(studentId?: string, coachId?: string): Promise<CallLog[]> {
    let filter: any = {};
    if (studentId) filter.student = { id: { equals: studentId } };
    if (coachId) filter.coach = { id: { equals: coachId } };

    const data = await executeQuery(queries.GET_CALL_LOGS_BY_FILTER, { filter });
    return data.callLogsList.items.map(transformCallLog);
  },

  async createCallLog(callLog: Omit<CallLog, 'id' | 'created_at' | 'updated_at'>): Promise<CallLog> {
    // Transform the data to use connection pattern
    const { student_id, coach_id, ...restData } = callLog;
    const connectionData = {
      ...restData,
      student: {
        connect: { id: student_id }
      },
      coach: {
        connect: { id: coach_id }
      }
    };
    
    const data = await executeMutation(queries.CREATE_CALL_LOG, { data: connectionData });
    return transformCallLog(data.callLogCreate);
  },

  async updateCallLog(id: string, updates: Partial<CallLog>): Promise<CallLog> {
    const data = await executeMutation(queries.UPDATE_CALL_LOG, { id, data: updates });
    return transformCallLog(data.callLogUpdate);
  },

  async deleteCallLog(id: string): Promise<void> {
    await executeMutation(queries.DELETE_CALL_LOG, { id });
  },

  // Notes
  async getNotes(targetType: string, targetId: string, userRole?: string, coachId?: string): Promise<Note[]> {
    // Query notes where studentNote relationship points to the student
    const data = await executeQuery(queries.GET_NOTES_BY_FILTER, {
      filter: { 
        studentNote: { 
          user: { 
            id: { equals: targetId } 
          } 
        } 
      }
    });
    
    let notes = data.notesList.items;
    
    // Filter private notes for non-coaches and non-super-admins
    if (userRole && userRole === 'user') {
      notes = notes.filter((note: Note) => note.visibility === 'public');
    }
    
    return notes.sort((a: Note, b: Note) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async createNote(note: Omit<Note, 'id' | 'created_at'> & { title?: string }): Promise<Note> {
    // Transform the data to use connection pattern
    const { target_id, user_id, created_by, created_by_name, ...restData } = note;
    const connectionData = {
      ...restData,
      studentNote: {
        connect: { id: target_id }
      },
      coach: {
        connect: { id: user_id }
      }
    };
    
    const data = await executeMutation(queries.CREATE_NOTE, { data: connectionData });
    return data.noteCreate;
  },

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    const data = await executeMutation(queries.UPDATE_NOTE, { id, data: updates });
    return data.noteUpdate;
  },

  async deleteNote(id: string): Promise<void> {
    await executeMutation(queries.DELETE_NOTE, { id });
  },

  // Message Templates
  async getMessageTemplates(): Promise<MessageTemplate[]> {
    const data = await executeQuery(queries.GET_MESSAGE_TEMPLATES_BY_FILTER, {
      filter: { is_active: { equals: true } }
    });
    return data.messageTemplatesList.items;
  },

  async getTemplatesByType(type: string): Promise<MessageTemplate[]> {
    const data = await executeQuery(queries.GET_MESSAGE_TEMPLATES_BY_FILTER, {
      filter: { type: { equals: type }, is_active: { equals: true } }
    });
    return data.messageTemplatesList.items;
  },

  async createMessageTemplate(template: Omit<MessageTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<MessageTemplate> {
    const data = await executeMutation(queries.CREATE_MESSAGE_TEMPLATE, { data: template });
    return data.messageTemplateCreate;
  },

  async updateMessageTemplate(id: string, updates: Partial<MessageTemplate>): Promise<MessageTemplate> {
    const data = await executeMutation(queries.UPDATE_MESSAGE_TEMPLATE, { id, data: updates });
    return data.messageTemplateUpdate;
  },

  async deleteMessageTemplate(id: string): Promise<void> {
    await executeMutation(queries.DELETE_MESSAGE_TEMPLATE, { id });
  },

  // Global Variables
  async getGlobalVariables(userId: string): Promise<GlobalVariables | null> {
    const data = await executeQuery(queries.GET_GLOBAL_VARIABLES_BY_FILTER, {
      filter: { user: { id: { equals: userId } } }
    });
    return data.globalVariablesList.items.length > 0 ? data.globalVariablesList.items[0] : null;
  },

  async updateGlobalVariables(userId: string, updates: Partial<GlobalVariables>): Promise<GlobalVariables> {
    const existing = await this.getGlobalVariables(userId);
    
    if (existing) {
      const data = await executeMutation(queries.UPDATE_GLOBAL_VARIABLES, {
        id: existing.id,
        data: updates
      });
      return data.globalVariableUpdate;
    } else {
    const data = await executeMutation(queries.CREATE_GLOBAL_VARIABLES, {
        data: { ...updates, user: { connect: { id: userId } } }
    });
          return data.globalVariableCreate;
    }
  },

  // Products
  async getProducts(userId: string): Promise<Product[]> {
    const data = await executeQuery(queries.GET_PRODUCTS_BY_FILTER, {
      filter: { user: { id: { equals: userId } } }
    });
    return data.productsList.items.map(transformProduct);
  },

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'> & { user?: { connect: { id: string } } }): Promise<Product> {
    const data = await executeMutation(queries.CREATE_PRODUCT, { data: product });
    return transformProduct(data.productCreate);
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const data = await executeMutation(queries.UPDATE_PRODUCT, { id, data: updates });
    return transformProduct(data.productUpdate);
  },

  async deleteProduct(id: string): Promise<void> {
    await executeMutation(queries.DELETE_PRODUCT, { id });
  },

  // Subitems
  async getSubitems(productId: string): Promise<Subitem[]> {
    const data = await executeQuery(queries.GET_SUBITEMS_BY_FILTER, {
      filter: { product: { id: { equals: productId } } }
    });
    return data.subitemsList.items.map(transformSubitem);
  },

  async createSubitem(subitem: Omit<Subitem, 'id' | 'created_at' | 'updated_at'> & { product?: { connect: { id: string } } }): Promise<Subitem> {
    const data = await executeMutation(queries.CREATE_SUBITEM, { data: subitem });
    return transformSubitem(data.subitemCreate);
  },

  async updateSubitem(id: string, updates: Partial<Subitem>): Promise<Subitem> {
    const data = await executeMutation(queries.UPDATE_SUBITEM, { id, data: updates });
    return transformSubitem(data.subitemUpdate);
  },

  async deleteSubitem(id: string): Promise<void> {
    await executeMutation(queries.DELETE_SUBITEM, { id });
  },

  // Student Performance Analytics
  async getStudentHighestRevenue(userId: string): Promise<number> {
    const data = await executeQuery(queries.GET_STUDENT_HIGHEST_REVENUE_BY_FILTER, {
      filter: { student: { id: { equals: userId } } }
    });
    return data.weeklyReportsList.items.length > 0 ? data.weeklyReportsList.items[0].revenue : 0;
  },

  async getAllStudentsWithMetrics(): Promise<Array<User & { highestRevenue: number; totalReports: number; isActive: boolean }>> {
    const data = await executeQuery(queries.GET_ALL_STUDENTS_WITH_METRICS_BY_FILTER, {
      filter: { role: { equals: 'user' } }
    });
    
    return data.usersList.items.map((user: any) => {
      const reports = user.weeklyReports?.items || [];
      const highestRevenue = reports.length > 0 ? Math.max(...reports.map((r: any) => r.revenue)) : 0;
      const lastReportDate = reports.length > 0
        ? Math.max(...reports.map((r: any) => new Date(r.createdAt).getTime()))
        : 0;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const isActive = lastReportDate > thirtyDaysAgo.getTime();

      return {
        ...transformUser(user),
        highestRevenue,
        totalReports: reports.length,
        isActive
      };
    });
  },

  // Random script generation
  async generateRandomScript(): Promise<{intro: string, hook: string, body1: string, body2: string, ending: string}> {
    const templates = await this.getMessageTemplates();

    const getRandomTemplate = (type: string): string => {
      const typeTemplates = templates.filter(t => t.type === type);
      if (typeTemplates.length === 0) return '';
      const randomIndex = Math.floor(Math.random() * typeTemplates.length);
      return typeTemplates[randomIndex].content;
    };

    return {
      intro: getRandomTemplate('intro'),
      hook: getRandomTemplate('hook'),
      body1: getRandomTemplate('body1'),
      body2: getRandomTemplate('body2'),
      ending: getRandomTemplate('ending')
    };
  },

  // Super Admin Methods - Platform Overview
  async getPlatformOverview() {
    try {
      const response = await apolloClient.query({ query: gql`${queries.GET_PLATFORM_OVERVIEW}` });
      return response.data.platformOverview;
    } catch (error) {
      console.error('Error fetching platform overview:', error);
      throw error;
    }
  },

  async getSystemStatistics() {
    try {
      const response = await apolloClient.query({ query: gql`${queries.GET_SYSTEM_STATISTICS}` });
      return response.data.systemStatistics;
    } catch (error) {
      console.error('Error fetching system statistics:', error);
      throw error;
    }
  },

  async getCoachAnalytics(coachId?: string) {
    try {
      const response = await apolloClient.query({ query: gql`${queries.GET_COACH_ANALYTICS}`, variables: { coachId } });
      return response.data.coachAnalytics;
    } catch (error) {
      console.error('Error fetching coach analytics:', error);
      throw error;
    }
  },

  // Super Admin Methods - KPI System
  async getStudentKPIData(studentId: string, timeFrame: any): Promise<StudentKPIData> {
    try {
      const response = await apolloClient.query({ query: gql`${queries.GET_STUDENT_KPI_DATA_BY_FILTER}`, variables: {
        filter: {
          student_id: { equals: studentId },
          time_frame: timeFrame
        }
      } });
      
      if (response.data.studentKPIDataList.items.length === 0) {
        throw new Error('Student KPI data not found');
      }
      
      return response.data.studentKPIDataList.items[0];
    } catch (error) {
      console.error('Error fetching student KPI data:', error);
      throw error;
    }
  },

  async getAssignedStudents(coachId: string): Promise<User[]> {
    try {
      // TODO: This should be updated to use the new relationship structure
      // Get users assigned to this coach through Student table
      console.log('getAssignedStudents should be updated to use Student.coach relationship');
      
      // For now, return empty array until the new relationship is properly implemented
      return [];
    } catch (error) {
      console.error('Error fetching assigned students:', error);
      throw error;
    }
  },

  async getCoachKPISummary(coachId: string, timeFrame: any): Promise<CoachKPISummary> {
    try {
      // Since we don't have the actual KPI tables in 8base yet, we'll create a summary
      // based on the assigned students data
      const assignedStudents = await this.getAssignedStudents(coachId);
      
      // Calculate summary from student data
      const totalStudents = assignedStudents.length;
      const paidStudents = assignedStudents.filter(s => s.has_paid).length;
      const freeStudents = totalStudents - paidStudents;
      
      // Mock KPI summary - in real implementation, this would come from KPI tables
      const mockSummary: CoachKPISummary = {
        coach_id: coachId,
        coach_name: assignedStudents.length > 0 ? 
          `${assignedStudents[0].assignedCoach?.firstName || 'Coach'} ${assignedStudents[0].assignedCoach?.lastName || 'Name'}` : 
          'Coach Name',
        total_students: totalStudents,
        active_students: totalStudents, // Mock - would be calculated based on activity
        paid_students: paidStudents,
        free_students: freeStudents,
        total_leads_generated: 0, // Would be calculated from leads data
        total_dms_sent: 0, // Would be calculated from engagement data
        total_calls_made: 0, // Would be calculated from call logs
        avg_student_conversion_rate: 0, // Would be calculated from conversion data
        avg_student_engagement_rate: 0, // Would be calculated from engagement data
        students_above_benchmarks: 0, // Would be calculated from benchmarks
        recent_calls_logged: 0, // Would be calculated from call logs
        students_needing_attention: 0, // Would be calculated from activity data
        time_frame: timeFrame
      };
      
      return mockSummary;
    } catch (error) {
      console.error('Error fetching coach KPI summary:', error);
      throw error;
    }
  },

  async getMultipleStudentKPIs(studentIds: string[], timeFrame: any): Promise<StudentKPIData[]> {
    try {
      // Since we don't have KPI tables in 8base yet, create mock data
      const mockKPIs: StudentKPIData[] = studentIds.map((studentId, index) => ({
        student_id: studentId,
        student_name: `Student ${index + 1}`,
        student_email: `student${index + 1}@example.com`,
        assigned_coach_id: 'coach-id',
        coach_name: 'Coach Name',
        is_paid_user: index % 2 === 0, // Mock paid status
        total_leads: Math.floor(Math.random() * 50) + 10,
        new_leads: Math.floor(Math.random() * 20) + 5,
        leads_by_source: { 'Instagram': 10, 'Facebook': 5, 'Referral': 3 },
        leads_by_status: { 'new': 8, 'contacted': 6, 'qualified': 4, 'converted': 2 },
        total_dms_sent: Math.floor(Math.random() * 30) + 10,
        initial_dms_sent: Math.floor(Math.random() * 20) + 5,
        follow_up_dms_sent: Math.floor(Math.random() * 10) + 5,
        total_calls_made: Math.floor(Math.random() * 15) + 3,
        initial_calls_made: Math.floor(Math.random() * 8) + 2,
        follow_up_calls_made: Math.floor(Math.random() * 7) + 1,
        engagement_completion_rate: Math.floor(Math.random() * 40) + 60,
        conversion_rate: Math.floor(Math.random() * 20) + 10,
        avg_time_to_first_contact: Math.floor(Math.random() * 3) + 1,
        avg_time_to_conversion: Math.floor(Math.random() * 7) + 3,
        activity_trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any,
        last_activity_date: new Date().toISOString(),
        time_frame: timeFrame
      }));
      
      return mockKPIs;
    } catch (error) {
      console.error('Error fetching multiple student KPIs:', error);
      throw error;
    }
  },

  async getStudentWeeklyReports(studentId: string): Promise<WeeklyReport[]> {
    try {
      // Since we don't have weekly reports tables in 8base yet, create mock data
      const mockReports: WeeklyReport[] = [
        {
          id: `report-${studentId}-1`,
          user_id: studentId,
          start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date().toISOString(),
          new_clients: Math.floor(Math.random() * 10) + 5,
          paid_shoots: Math.floor(Math.random() * 8) + 3,
          free_shoots: Math.floor(Math.random() * 5) + 1,
          unique_clients: Math.floor(Math.random() * 15) + 8,
          aov: Math.floor(Math.random() * 200) + 300,
          revenue: Math.floor(Math.random() * 5000) + 2000,
          expenses: Math.floor(Math.random() * 1000) + 500,
          editing_cost: Math.floor(Math.random() * 500) + 200,
          net_profit: Math.floor(Math.random() * 3000) + 1500,
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: `report-${studentId}-2`,
          user_id: studentId,
          start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          new_clients: Math.floor(Math.random() * 10) + 5,
          paid_shoots: Math.floor(Math.random() * 8) + 3,
          free_shoots: Math.floor(Math.random() * 5) + 1,
          unique_clients: Math.floor(Math.random() * 15) + 8,
          aov: Math.floor(Math.random() * 200) + 300,
          revenue: Math.floor(Math.random() * 5000) + 2000,
          expenses: Math.floor(Math.random() * 1000) + 500,
          editing_cost: Math.floor(Math.random() * 500) + 200,
          net_profit: Math.floor(Math.random() * 3000) + 1500,
          status: 'completed',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      return mockReports;
    } catch (error) {
      console.error('Error fetching student weekly reports:', error);
      throw error;
    }
  },

  async getStudentActivitySummary(studentIds: string[], timeFrame: any): Promise<StudentActivitySummary[]> {
    try {
      // Since we don't have activity summary tables in 8base yet, create mock data
      const mockSummaries: StudentActivitySummary[] = studentIds.map((studentId, index) => {
        const statuses = ['excellent', 'good', 'needs_attention', 'inactive'] as const;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
                 return {
           student: {
             id: studentId,
             firstName: `Student`,
             lastName: `${index + 1}`,
             email: `student${index + 1}@example.com`,
             role: 'user',
             has_paid: index % 2 === 0,
             access_start: new Date().toISOString(),
             access_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
             created_at: new Date().toISOString(),
             updated_at: new Date().toISOString()
           },
          recent_leads: Math.floor(Math.random() * 20) + 5,
          recent_dms: Math.floor(Math.random() * 30) + 10,
          recent_calls: Math.floor(Math.random() * 15) + 3,
          last_activity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          performance_score: Math.floor(Math.random() * 40) + 60,
          status,
          alerts: status === 'needs_attention' ? ['Low lead generation', 'Behind on outreach'] : 
                 status === 'inactive' ? ['No recent activity'] : []
        };
      });
      
      return mockSummaries;
    } catch (error) {
      console.error('Error fetching student activity summary:', error);
      throw error;
    }
  },

  async getKPIChartData(studentIds: string[], timeFrame: any): Promise<any[]> {
    try {
      const response = await apolloClient.query({ query: gql`${queries.GET_KPI_CHART_DATA}`, variables: {
        studentIds,
        timeFrame
      } });
      
      return response.data.kpiChartData;
    } catch (error) {
      console.error('Error fetching KPI chart data:', error);
      throw error;
    }
  },

  async getKPIBenchmarks(): Promise<KPIBenchmarks> {
    try {
      const response = await apolloClient.query({ query: gql`${queries.GET_KPI_BENCHMARKS}` });
      return response.data.kpiBenchmarks;
    } catch (error) {
      console.error('Error fetching KPI benchmarks:', error);
      throw error;
    }
  },

  async updateKPIBenchmarks(updates: Partial<KPIBenchmarks>): Promise<KPIBenchmarks> {
    try {
      const response = await apolloClient.mutate({ mutation: gql`${queries.UPDATE_KPI_BENCHMARKS}`, variables: { updates } });
      return response.data.kpiBenchmarksUpdate;
    } catch (error) {
      console.error('Error updating KPI benchmarks:', error);
      throw error;
    }
  },

  // Super Admin Methods - Enhanced User Management
  async bulkAssignStudentsToCoachLegacy(assignments: Array<{ student_id: string; coach_id: string | null }>) {
    try {
      const response = await apolloClient.mutate({ mutation: gql`${queries.BULK_ASSIGN_STUDENTS_TO_COACH}`, variables: { assignments } });
      return response.data.bulkAssignStudentsToCoach;
    } catch (error) {
      console.error('Error bulk assigning students to coach:', error);
      throw error;
    }
  },

  async bulkUpdateUserStatus(updates: Array<{ id: string; status: string }>) {
    try {
      const response = await apolloClient.mutate({ mutation: gql`${queries.BULK_UPDATE_USER_STATUS}`, variables: { updates } });
      return response.data.bulkUpdateUserStatus;
    } catch (error) {
      console.error('Error bulk updating user status:', error);
      throw error;
    }
  },

  async getUserActivityLog(userId: string, timeFrame?: any) {
    try {
      const response = await apolloClient.query({ query: gql`${queries.GET_USER_ACTIVITY_LOG}`, variables: { userId, timeFrame } });
      return response.data.userActivityLog;
    } catch (error) {
      console.error('Error fetching user activity log:', error);
      throw error;
    }
  },

  // Super Admin Methods - System-wide Data Access
  async getAllUsersWithDetails(): Promise<User[]> {
    try {
      const response = await apolloClient.query({ query: gql`${queries.GET_USERS}` });
      
      const transformedUsers = response.data.usersList.items.map(transformUser);
      
      // Resolve coach information for legacy data
      const resolvedUsers = transformedUsers.map((user: User) => {
        if (user.assignedCoach && user.assignedCoach.firstName === 'Unknown') {
          // Find the actual coach from the users list
          const actualCoach = transformedUsers.find((u: User) => u.id === user.assignedCoach?.id);
          if (actualCoach) {
            return {
              ...user,
              assignedCoach: {
                id: actualCoach.id,
                firstName: actualCoach.firstName,
                lastName: actualCoach.lastName,
                email: actualCoach.email
              }
            };
          }
        }
        return user;
      });
      
      return resolvedUsers;
    } catch (error) {
      console.error('Error fetching all users with details:', error);
      throw error;
    }
  },

  async getAllWeeklyReports(): Promise<WeeklyReport[]> {
    try {
      const response = await apolloClient.query({ query: gql`${queries.GET_WEEKLY_REPORTS_BY_FILTER}`});
      return response.data.weeklyReportsList.items.map(transformWeeklyReport);
    } catch (error) {
      console.error('Error fetching all weekly reports:', error);
      throw error;
    }
  },

  async getAllGoals(): Promise<Goal[]> {
    try {
      const response = await apolloClient.query({ query: gql`${queries.GET_GOALS_BY_FILTER}`, variables: {
        filter: {}
      } });
      return response.data.goalsList.items.map(transformGoal);
    } catch (error) {
      console.error('Error fetching all goals:', error);
      throw error;
    }
  },

  async getAllLeads(): Promise<Lead[]> {
    try {
      const response = await apolloClient.query({ query: gql`${queries.GET_LEADS_BY_FILTER}`, variables: {
        filter: {}
      } });
      return response.data.leadsList.items.map(transformLead);
    } catch (error) {
      console.error('Error fetching all leads:', error);
      throw error;
    }
  },

  async getAllCallLogs(): Promise<CallLog[]> {
    try {
      const response = await apolloClient.query({ query: gql`${queries.GET_CALL_LOGS_BY_FILTER}`, variables: {
        filter: {}
      } });
      return response.data.callLogsList.items.map(transformCallLog);
    } catch (error) {
      console.error('Error fetching all call logs:', error);
      throw error;
    }
  },

  async getAllNotes(): Promise<Note[]> {
    try {
      const response = await apolloClient.query({ query: gql`${queries.GET_NOTES_BY_FILTER}`, variables: {
        filter: {}
      } });
      return response.data.notesList.items.map(transformNote);
    } catch (error) {
      console.error('Error fetching all notes:', error);
      throw error;
    }
  },

  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await apolloClient.query({ query: gql`${queries.GET_PRODUCTS_BY_FILTER}`, variables: {
        filter: {}
      } });
      return response.data.productsList.items.map(transformProduct);
    } catch (error) {
      console.error('Error fetching all products:', error);
      throw error;
    }
  },

  async getAllSubitems(): Promise<Subitem[]> {
    try {
      const response = await apolloClient.query({ query: gql`${queries.GET_SUBITEMS_BY_FILTER}`, variables: {
        filter: {}
      } });
      return response.data.subitemsList.items.map(transformSubitem);
    } catch (error) {
      console.error('Error fetching all subitems:', error);
      throw error;
    }
  },

  // Super Admin Methods - Analytics and Reporting
  async getPlatformMetrics() {
    try {
      const [users, reports, leads, goals] = await Promise.all([
        this.getAllUsersWithDetails(),
        this.getAllWeeklyReports(),
        this.getAllLeads(),
        this.getAllGoals()
      ]);

      const students = users.filter(u => u.role === 'user');
      const coaches = users.filter(u => u.role === 'coach' || u.role === 'coach_manager');
      const paidStudents = students.filter(s => s.has_paid);
      const freeStudents = students.filter(s => !s.has_paid);
      const totalRevenue = reports.reduce((sum, report) => sum + report.revenue, 0);
      const activeStudents = students.filter(student => {
        const hasRecentReport = reports.some(r => r.user_id === student.id);
        const hasRecentActivity = leads.some(l => l.user_id === student.id);
        return hasRecentReport || hasRecentActivity;
      }).length;

      return {
        totalUsers: users.length,
        totalStudents: students.length,
        totalCoaches: coaches.length,
        paidStudents: paidStudents.length,
        freeStudents: freeStudents.length,
        activeStudents,
        totalRevenue,
        totalLeads: leads.length,
        totalReports: reports.length,
        totalGoals: goals.length,
        avgRevenuePerStudent: students.length > 0 ? totalRevenue / students.length : 0,
        avgLeadsPerStudent: students.length > 0 ? leads.length / students.length : 0,
        conversionRate: leads.length > 0 ? (leads.filter(l => l.status === 'converted').length / leads.length) * 100 : 0
      };
    } catch (error) {
      console.error('Error calculating platform metrics:', error);
      throw error;
    }
  },

  async getCoachPerformanceMetrics() {
    try {
      const [users, reports, leads] = await Promise.all([
        this.getAllUsersWithDetails(),
        this.getAllWeeklyReports(),
        this.getAllLeads()
      ]);

      const coaches = users.filter(u => u.role === 'coach' || u.role === 'coach_manager');
      const students = users.filter(u => u.role === 'user');

      return coaches.map(coach => {
        const coachStudents = students.filter(s => s.assigned_admin_id === coach.id);
        const coachReports = reports.filter(r => coachStudents.some(s => s.id === r.user_id));
        const coachLeads = leads.filter(l => coachStudents.some(s => s.id === l.user_id));
        const coachRevenue = coachReports.reduce((sum, r) => sum + r.revenue, 0);
        const activeStudents = coachStudents.filter(student => {
          const hasRecentReport = coachReports.some(r => r.user_id === student.id);
          const hasRecentActivity = coachLeads.some(l => l.user_id === student.id);
          return hasRecentReport || hasRecentActivity;
        }).length;

        return {
          coachId: coach.id,
          coachName: `${coach.firstName} ${coach.lastName}`,
          coachEmail: coach.email,
          assignedStudentsCount: coachStudents.length,
          activeStudentsCount: activeStudents,
          totalRevenueGenerated: coachRevenue,
          totalLeadsGenerated: coachLeads.length,
          totalReportsSubmitted: coachReports.length,
          avgStudentProgress: coachStudents.length > 0 ? (activeStudents / coachStudents.length) * 100 : 0,
          avgStudentConversionRate: coachLeads.length > 0 ? 
            (coachLeads.filter(l => l.status === 'converted').length / coachLeads.length) * 100 : 0,
          studentDistribution: {
            paidCount: coachStudents.filter(s => s.has_paid).length,
            freeCount: coachStudents.filter(s => !s.has_paid).length,
            activeCount: activeStudents,
            inactiveCount: coachStudents.length - activeStudents
          },
          performanceMetrics: {
            leadsPerStudent: coachStudents.length > 0 ? coachLeads.length / coachStudents.length : 0,
            revenuePerStudent: coachStudents.length > 0 ? coachRevenue / coachStudents.length : 0,
            conversionRate: coachLeads.length > 0 ? 
              (coachLeads.filter(l => l.status === 'converted').length / coachLeads.length) * 100 : 0,
            engagementRate: coachStudents.length > 0 ? (activeStudents / coachStudents.length) * 100 : 0
          }
        };
      });
    } catch (error) {
      console.error('Error calculating coach performance metrics:', error);
      throw error;
    }
  },

    // Helper method to transform user data for creation
  async transformUserDataForCreation(userData: any): Promise<any> {
    const transformedData = { ...userData };
    
          // Handle role field transformation
      if (userData.role && !userData.roles) {
        // Remove the role field
        delete transformedData.role;
        
        // Get the actual role ID from the database
        try {
          const roleId = await this.getRoleIdByName(userData.role);
          console.log('Found role ID for', userData.role, ':', roleId);
          if (roleId) {
            transformedData.roles = {
              connect: [{ id: roleId }]
            };
            console.log('Transformed roles data:', transformedData.roles);
          } else {
            console.warn(`Role '${userData.role}' not found, trying to find default role`);
            
            // Try to find a default role with better mapping
            const roleMapping: { [key: string]: string[] } = {
              'user': ['Student', 'student', 'basic', 'member'],
              'student': ['Student', 'student', 'basic', 'member'],
              'coach': ['Coach', 'coach'],
              'admin': ['Administrator', 'administrator', 'admin'],
              'super_admin': ['SuperAdmin', 'superadmin', 'super_admin'],
              'coach_manager': ['coach_manager', 'Coach Manager', 'coach manager']
            };
            
            const mappedRoles = roleMapping[userData.role.toLowerCase()] || ['Student', 'student', 'basic', 'member'];
            let defaultRoleId = null;
            
            for (const defaultRoleName of mappedRoles) {
              defaultRoleId = await this.getRoleIdByName(defaultRoleName);
              if (defaultRoleId) {
                console.log(`Found mapped role '${defaultRoleName}' for '${userData.role}' with ID:`, defaultRoleId);
                break;
              }
            }
            
            if (defaultRoleId) {
              transformedData.roles = {
                connect: [{ id: defaultRoleId }]
              };
              console.log('Assigned mapped role:', transformedData.roles);
            } else {
              console.error('No mapped role found, user will be created without role');
            }
          }
        } catch (error) {
          console.error('Error getting role ID:', error);
          console.warn(`Role '${userData.role}' not found, skipping role assignment`);
        }
      }
    
    // Remove fields that don't exist in UserCreateInput
    const validFields = [
      'firstName', 'lastName', 'email', 'status', 'origin', 'timezone',
      'roles', 'assignedCoach'
    ];
    
    // Remove fields that don't exist in UserCreateInput
    Object.keys(transformedData).forEach(key => {
      if (!validFields.includes(key)) {
        delete transformedData[key];
      }
    });
    
    console.log('Final transformed data:', transformedData);
    return transformedData;
  },

  // Helper method to get role ID by name
  async getRoleIdByName(roleName: string): Promise<string | null> {
    try {
      console.log('Fetching roles for role name:', roleName);
      
      // Try GET_ROLES_LIST first
      try {
        const data = await executeQuery(queries.GET_ALL_ROLES);
        console.log('Roles data received from GET_ROLES_LIST:', data);
        console.log('Roles items:', data.rolesList?.items);
        
        // Log all available role names for debugging
        const roleNames = data.rolesList?.items?.map((r: any) => r.name) || [];
        console.log('Available role names:', roleNames);
        
        const role = data.rolesList?.items?.find((r: any) => 
          r.name.toLowerCase() === roleName.toLowerCase()
        );
        console.log('Found role from GET_ROLES_LIST:', role);
        if (role) return role.id;
      } catch (error) {
        console.log('GET_ROLES_LIST failed, trying GET_ALL_ROLES:', error);
      }
      
      // Fallback to GET_ALL_ROLES from 8baseUser.ts
      try {
        const data = await executeQuery(queries.GET_ALL_ROLES);
        console.log('Roles data received from GET_ALL_ROLES:', data);
        console.log('Roles items:', data.rolesList?.items);
        
        // Log all available role names for debugging
        const roleNames = data.rolesList?.items?.map((r: any) => r.name) || [];
        console.log('Available role names from GET_ALL_ROLES:', roleNames);
        
        const role = data.rolesList?.items?.find((r: any) => 
          r.name.toLowerCase() === roleName.toLowerCase()
        );
        console.log('Found role from GET_ALL_ROLES:', role);
        if (role) return role.id;
      } catch (error) {
        console.log('GET_ALL_ROLES also failed:', error);
      }
      
      return null;
    } catch (error) {
      console.error('Error in getRoleIdByName:', error);
      return null;
    }
  },

  // Helper method to get role by ID
  async getRoleById(roleId: string): Promise<any | null> {
    try {
      console.log('Fetching role by ID:', roleId);
      
      // Try GET_ROLES_LIST first
      try {
        const data = await executeQuery(queries.GET_ALL_ROLES);
        const role = data.rolesList?.items?.find((r: any) => r.id === roleId);
        if (role) {
          console.log('Found role by ID from GET_ROLES_LIST:', role);
          return role;
        }
      } catch (error) {
        console.log('GET_ROLES_LIST failed, trying GET_ALL_ROLES:', error);
      }
      
      // Fallback to GET_ALL_ROLES from 8baseUser.ts
      try {
        const data = await executeQuery(queries.GET_ALL_ROLES);
        const role = data.rolesList?.items?.find((r: any) => r.id === roleId);
        if (role) {
          console.log('Found role by ID from GET_ALL_ROLES:', role);
          return role;
        }
      } catch (error) {
        console.log('GET_ALL_ROLES also failed:', error);
      }
      
      return null;
    } catch (error) {
      console.error('Error in getRoleById:', error);
      return null;
    }
  },

  // Test method to debug role assignment
  async testRoleAssignment(roleName: string): Promise<any> {
    console.log('=== Testing Role Assignment ===');
    const roleId = await this.getRoleIdByName(roleName);
    console.log('Role ID found:', roleId);
    
    if (roleId) {
      const testData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: roleName
      };
      
      console.log('Test data:', testData);
      const transformed = await this.transformUserDataForCreation(testData);
      console.log('Transformed data:', transformed);
      
      return {
        roleId,
        originalData: testData,
        transformedData: transformed
      };
    }
    
    return { error: 'Role not found' };
  },

  // List all available roles
  async listAllRoles(): Promise<any> {
    try {
      console.log('=== Listing All Available Roles ===');
      
      // Try GET_ROLES_LIST first
      try {
        const data = await executeQuery(queries.GET_ALL_ROLES);
        const roles = data.rolesList?.items || [];
        console.log('Roles from GET_ROLES_LIST:', roles.map((r: any) => ({ id: r.id, name: r.name, description: r.description })));
        return { success: true, roles, source: 'GET_ROLES_LIST' };
      } catch (error) {
        console.log('GET_ROLES_LIST failed:', error);
      }
      
      // Fallback to GET_ALL_ROLES
      try {
        const data = await executeQuery(queries.GET_ALL_ROLES);
        const roles = data.rolesList?.items || [];
        console.log('Roles from GET_ALL_ROLES:', roles.map((r: any) => ({ id: r.id, name: r.name, description: r.description })));
        return { success: true, roles, source: 'GET_ALL_ROLES' };
      } catch (error) {
        console.log('GET_ALL_ROLES also failed:', error);
        return { success: false, error: 'Both role queries failed' };
      }
    } catch (error) {
      console.error('Error listing roles:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Create student with profile data
  async createStudentWithProfile(studentData: any): Promise<any> {
    try {
      console.log('Creating student with profile data:', studentData);
      
      // Create the user first
      const user = await this.createUser(studentData);
      console.log('User created:', user);
      
      return {
        success: true,
        user: user,
        message: 'Student user and profile created successfully'
      };
    } catch (error) {
      console.error('Error creating student with profile:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Test student creation specifically
  async testStudentCreation(): Promise<any> {
    try {
      console.log('=== Testing Student Creation ===');
      
      const testStudentData = {
        firstName: 'Test',
        lastName: 'Student',
        email: 'teststudent@example.com',
        role: 'user'
      };
      
      console.log('Test student data:', testStudentData);
      const result = await this.createUser(testStudentData);
      console.log('Test result:', result);
      
      return result;
    } catch (error) {
      console.error('Error in test student creation:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Test coach creation specifically
  async testCoachCreation(): Promise<any> {
    try {
      console.log('=== Testing Coach Creation ===');
      
      const testCoachData = {
        firstName: 'Test',
        lastName: 'Coach',
        email: 'testcoach@example.com',
        role: 'coach'
      };
      
      console.log('Test coach data:', testCoachData);
      const result = await this.createUser(testCoachData);
      console.log('Test result:', result);
      
      return result;
    } catch (error) {
      console.error('Error in test coach creation:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Test role assignment specifically
  async testRoleAssignmentOnly(roleName: string): Promise<any> {
    try {
      console.log('=== Testing Role Assignment Only ===');
      
      const testData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser@example.com',
        role: roleName
      };
      
      console.log('Test data:', testData);
      const transformed = await this.transformUserDataForCreation(testData);
      console.log('Transformed data:', transformed);
      
      // Test role lookup
      const roleId = await this.getRoleIdByName(roleName);
      console.log('Role ID found:', roleId);
      
      return {
        originalData: testData,
        transformedData: transformed,
        roleId: roleId
      };
    } catch (error) {
      console.error('Error in test role assignment:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Helper method to create time frame filter
  createTimeFrameFilter(preset: any, customStart?: string, customEnd?: string): any {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);
    let label: string;

    switch (preset) {
      case '7days':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        label = 'Last 7 days';
        break;
      case '30days':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        label = 'Last 30 days';
        break;
      case '90days':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 90);
        label = 'Last 90 days';
        break;
      case '6months':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 6);
        label = 'Last 6 months';
        break;
      case '1year':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        label = 'Last 12 months';
        break;
      case 'custom':
        startDate = new Date(customStart || now);
        endDate = new Date(customEnd || now);
        label = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        label = 'Last 30 days';
    }

    return {
      preset,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      label
    };
  },

  // ============================================================================
  // NEW METHOD: Update User with Coach Connection
  // ============================================================================
  
  async updateUserWithCoachConnection(
    userId: string, 
    userData: {
      firstName?: string;
      lastName?: string;
      has_paid?: boolean;
      status?: string;
      access_end?: string;
      access_start?: string;
      email?: string;
      roles?: any;
    }, 
    coachId: string
  ): Promise<User> {
    try {
      // Prepare the data object exactly as needed for the mutation
      const dataObject: any = {
        ...userData
      };
      
      // Add coach connection
      if (coachId) {
        dataObject.coach = {
          connect: { id: coachId }
        };
        console.log('Connecting user to coach:', coachId);
      }
      
      console.log('Sending mutation with data:', dataObject);
      
      const data = await executeMutation(queries.UPDATE_USER_WITH_COACH_CONNECTION, {
        filter: { id: userId },
        data: dataObject
      });
      
      return transformUser(data.userUpdate);
    } catch (error) {
      console.error('Error updating user with coach connection:', error);
      throw error;
    }
  },

  // ============================================================================
  // BULK ASSIGNMENT METHODS (Multiple Students to Coach)
  // ============================================================================
  
  async bulkAssignStudentsToCoach(
    coachUserId: string, 
    studentUserIds: string[],
    options: {
      onProgress?: (completed: number, total: number) => void;
      continueOnError?: boolean;
    } = {}
  ): Promise<any> {
    try {
      console.log(`Starting bulk assignment of ${studentUserIds.length} students to coach ${coachUserId}`);
      
      const { onProgress, continueOnError = true } = options;
      
      // Get coach profile to verify it exists
      const coachProfile = await this.getCoachByUserId(coachUserId);
      
      if (!coachProfile) {
        throw new Error(`No coach profile found for user ${coachUserId}`);
      }
      
      const results: {
        successful: Array<{ studentUserId: string; result: any }>;
        failed: Array<{ studentUserId: string; error: string }>;
        total: number;
        completed: number;
        coachUserId: string;
      } = {
        successful: [],
        failed: [],
        total: studentUserIds.length,
        completed: 0,
        coachUserId: coachUserId
      };
      
      // Process students one by one
      for (let i = 0; i < studentUserIds.length; i++) {
        const studentUserId = studentUserIds[i];
        
        try {
          // Assign student to coach using existing method
          const result = await this.assignStudentToCoach(studentUserId, coachUserId);
          
          results.successful.push({
            studentUserId: studentUserId,
            result: result
          });
          
          console.log(`✅ Student ${i + 1}/${studentUserIds.length} assigned successfully`);
          
        } catch (error) {
          console.error(`❌ Failed to assign student ${studentUserId}:`, error);
          
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          results.failed.push({
            studentUserId: studentUserId,
            error: errorMessage
          });
          
          // If continueOnError is false, stop processing
          if (!continueOnError) {
            throw error;
          }
        }
        
        results.completed = i + 1;
        
        // Report progress
        if (onProgress) {
          onProgress(results.completed, results.total);
        }
      }
      
      console.log(`Bulk assignment completed: ${results.successful.length} successful, ${results.failed.length} failed`);
      
      return {
        ...results,
        successRate: (results.successful.length / results.total) * 100
      };
      
    } catch (error) {
      console.error('Bulk assignment failed:', error);
      throw error;
    }
  },

  async bulkAssignCoachesToStudents(
    studentUserIds: string[],
    coachUserId: string,
    options: {
      onProgress?: (completed: number, total: number) => void;
      continueOnError?: boolean;
    } = {}
  ): Promise<any> {
    try {
      console.log(`Starting bulk assignment of coach ${coachUserId} to ${studentUserIds.length} students`);
      
      const { onProgress, continueOnError = true } = options;
      
      // Get coach profile to verify it exists
      const coachProfile = await this.getCoachByUserId(coachUserId);
      
      if (!coachProfile) {
        throw new Error(`No coach profile found for user ${coachUserId}`);
      }
      
      const results: {
        successful: Array<{ studentUserId: string; result: any }>;
        failed: Array<{ studentUserId: string; error: string }>;
        total: number;
        completed: number;
        coachUserId: string;
      } = {
        successful: [],
        failed: [],
        total: studentUserIds.length,
        completed: 0,
        coachUserId: coachUserId
      };
      
      // Process students one by one
      for (let i = 0; i < studentUserIds.length; i++) {
        const studentUserId = studentUserIds[i];
        
        try {
          // Assign coach to student using existing method
          const result = await this.assignStudentToCoach(studentUserId, coachUserId);
          
          results.successful.push({
            studentUserId: studentUserId,
            result: result
          });
          
          console.log(`✅ Coach assigned to student ${i + 1}/${studentUserIds.length} successfully`);
          
        } catch (error) {
          console.error(`❌ Failed to assign coach to student ${studentUserId}:`, error);
          
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          results.failed.push({
            studentUserId: studentUserId,
            error: errorMessage
          });
          
          // If continueOnError is false, stop processing
          if (!continueOnError) {
            throw error;
          }
        }
        
        results.completed = i + 1;
        
        // Report progress
        if (onProgress) {
          onProgress(results.completed, results.total);
        }
      }
      
      console.log(`Bulk coach assignment completed: ${results.successful.length} successful, ${results.failed.length} failed`);
      
      return {
        ...results,
        successRate: (results.successful.length / results.total) * 100
      };
      
    } catch (error) {
      console.error('Bulk coach assignment failed:', error);
      throw error;
    }
  },

  // Update Student record by user_id
  async updateStudentByUserId(userId: string, studentData: any): Promise<any> {
    try {
      console.log('Updating Student record for user_id:', userId);
      console.log('Student data:', studentData);
      
      const data = await executeMutation(queries.UPDATE_STUDENT_BY_USER_ID, {
        userId,
        data: studentData
      });
      
      console.log('Student updated successfully:', data);
      return data.studentUpdateByFilter;
    } catch (error) {
      console.error('Failed to update Student record:', error);
      throw error;
    }
  },

  // Get all students
  async getAllStudents(): Promise<any> {
    try {
      console.log('Fetching all students');
      
      const data = await executeQuery(queries.GET_ALL_STUDENTS);
      
      console.log('All students fetched successfully:', data);
      return data.studentsList.items;
    } catch (error) {
      console.error('Failed to fetch all students:', error);
      throw error;
    }
  },

  // Get student by email
  async getStudentByEmail(email: string): Promise<any> {
    try {
      console.log('Fetching student by email:', email);
      
      const data = await executeQuery(queries.GET_STUDENT_BY_EMAIL, {
        email
      });
      
      console.log('Student fetched by email successfully:', data);
      return data.studentsList.items[0] || null;
    } catch (error) {
      console.error('Failed to fetch student by email:', error);
      throw error;
    }
  },

  // Update student by email
  async updateStudentByEmail(email: string, studentData: any): Promise<any> {
    try {
      console.log('Updating Student record for email:', email);
      console.log('Student data:', studentData);
      
      const data = await executeMutation(queries.UPDATE_STUDENT_BY_EMAIL, {
        email,
        data: studentData
      });
      
      console.log('Student updated by email successfully:', data);
      return data.studentUpdateByFilter;
    } catch (error) {
      console.error('Failed to update Student record by email:', error);
      throw error;
    }
  },

  // Update student and assign coach by email
  async updateStudentAndAssignCoachByEmail(email: string, studentData: any, coachEmail: string): Promise<any> {
    try {
      console.log('Updating Student and assigning Coach by email');
      console.log('- Student email:', email);
      console.log('- Coach email:', coachEmail);
      console.log('- Student data:', studentData);
      
      const data = await executeMutation(queries.UPDATE_STUDENT_AND_ASSIGN_COACH_BY_EMAIL, {
        email,
        firstName: studentData.firstName || null,
        lastName: studentData.lastName || null,
        phone: studentData.phone || null,
        business_name: studentData.business_name || null,
        location: studentData.location || null,
        target_market: studentData.target_market || null,
        strengths: studentData.strengths || null,
        challenges: studentData.challenges || null,
        goals: studentData.goals || null,
        preferred_contact_method: studentData.preferred_contact_method || null,
        availability: studentData.availability || null,
        notes: studentData.notes || null,
        coachEmail
      });
      
      console.log('Student updated and coach assigned by email successfully:', data);
      return data.studentUpdateByFilter;
    } catch (error) {
      console.error('Failed to update student and assign coach by email:', error);
      throw error;
    }
  },

  // Update Coach record by user_id
  async updateCoachByUserId(userId: string, coachData: any): Promise<any> {
    try {
      console.log('Updating Coach record for user_id:', userId);
      console.log('Coach data:', coachData);
      
      const data = await executeMutation(queries.UPDATE_COACH_BY_USER_ID, {
        userId,
        data: coachData
      });
      
      console.log('Coach updated successfully:', data);
      return data.coachUpdate;
    } catch (error) {
      console.error('Failed to update Coach record:', error);
      throw error;
    }
  },

  // Update User's associated Student or Coach record based on their role
  async updateUserProfileByRole(userId: string, profileData: any, userRole: string): Promise<any> {
    try {
      console.log('Updating profile for user_id:', userId, 'with role:', userRole);
      
      switch (userRole.toLowerCase()) {
        case 'student':
        case 'user':
          return await this.updateStudentByUserId(userId, profileData);
        case 'coach':
        case 'coach_manager':
          return await this.updateCoachByUserId(userId, profileData);
        default:
          throw new Error(`Unsupported user role for profile update: ${userRole}`);
      }
    } catch (error) {
      console.error('Failed to update user profile by role:', error);
      throw error;
    }
  },

  // Assign coach to student by updating Student table record
  async assignCoachToStudent(studentUserId: string, coachUserId: string): Promise<any> {
    try {
      console.log('Assigning coach to student via Student table update');
      console.log('- Student User ID:', studentUserId);
      console.log('- Coach User ID:', coachUserId);
      
      const data = await executeMutation(queries.ASSIGN_COACH_TO_STUDENT, {
        studentUserId,
        coachUserId
      });
      
      console.log('Coach assigned to student successfully:', data);
      return data.studentUpdateByFilter;
    } catch (error) {
      console.error('Failed to assign coach to student:', error);
      throw error;
    }
  },

  // Disconnect coach from student by updating Student table record
  async disconnectCoachFromStudent(studentUserId: string): Promise<any> {
    try {
      console.log('Disconnecting coach from student via Student table update');
      console.log('- Student User ID:', studentUserId);
      
      const data = await executeMutation(queries.DISCONNECT_COACH_FROM_STUDENT, {
        studentUserId
      });
      
      console.log('Coach disconnected from student successfully:', data);
      return data.studentUpdateByFilter;
    } catch (error) {
      console.error('Failed to disconnect coach from student:', error);
      throw error;
    }
  },

  // Direct Coach table update
  async updateCoachDirect(coachId: string, coachData: any): Promise<any> {
    try {
      const data = await executeMutation(queries.UPDATE_COACH, {
        id: coachId,
        data: coachData
      });
      return data.coachUpdate;
    } catch (error) {
      console.error('Failed to update coach directly:', error);
      throw error;
    }
  },

  // Direct Student table update
  async updateStudentDirect(studentId: string, studentData: any): Promise<any> {
    try {
      const data = await executeMutation(queries.UPDATE_STUDENT_PROFILE, {
        id: studentId,
        data: studentData
      });
      return data.studentUpdate;
    } catch (error) {
      console.error('Failed to update student directly:', error);
      throw error;
    }
  },

  // Direct Coach table creation
  async createCoachDirect(coachData: any): Promise<any> {
    try {
      const data = await executeMutation(queries.CREATE_COACH, {
        data: coachData
      });
      return data.coachCreate;
    } catch (error) {
      console.error('Failed to create coach directly:', error);
      throw error;
    }
  },

  // Direct Student table creation
  async createStudentDirect(studentData: any): Promise<any> {
    try {
      const data = await executeMutation(queries.CREATE_STUDENT, {
        data: studentData
      });
      return data.studentCreate;
    } catch (error) {
      console.error('Failed to create student directly:', error);
      throw error;
    }
  },

  // Coach management methods
  async getCoachByEmail(email: string): Promise<any> {
    try {
      const data = await executeQuery(queries.GET_COACH_BY_EMAIL, { email });
      return data.coachesList.items[0] || null;
    } catch (error) {
      console.error('Failed to get coach by email:', error);
      throw error;
    }
  },

  async getCoachWithStudents(coachId: string): Promise<any> {
    try {
      const data = await executeQuery(queries.GET_COACH_WITH_STUDENTS, { coachId });
      return data.coachesList.items[0] || null;
    } catch (error) {
      console.error('Failed to get coach with students:', error);
      throw error;
    }
  },

  async deleteCoach(coachId: string): Promise<boolean> {
    try {
      const data = await executeMutation(queries.DELETE_COACH_BY_ID, { id: coachId });
      return data.coachDestroy.success;
    } catch (error) {
      console.error('Failed to delete coach:', error);
      throw error;
    }
  },

  // New methods for the requested functionality
  async getCoachesByEmailFilter(email: string): Promise<any[]> {
    try {
      const data = await executeQuery(queries.GET_COACHES_BY_EMAIL_FILTER, { email });
      return data.coachesList.items || [];
    } catch (error) {
      console.error('Failed to get coaches by email filter:', error);
      throw error;
    }
  },

  async getCoachWithStudentsAndReports(coachId: string): Promise<any> {
    try {
      const data = await executeQuery(queries.GET_COACH_WITH_STUDENTS_AND_REPORTS, { id: coachId });
      return data.coach || null;
    } catch (error) {
      console.error('Failed to get coach with students and reports:', error);
      throw error;
    }
  },

  async getStudentById(studentId: string): Promise<any> {
    try {
      const data = await executeQuery(queries.GET_STUDENT_BY_ID, { id: studentId });
      return data.student || null;
    } catch (error) {
      console.error('Failed to get student by ID:', error);
      throw error;
    }
  },

}; 