import { gql } from '@apollo/client';
import {
  User, WeeklyReport, Goal, Pricing, Lead, Note, MessageTemplate,
  StudentProfile, CallLog, GlobalVariables, Product, Subitem,
  EngagementTag, StudentKPIData, CoachKPISummary, KPIBenchmarks, CoachPricingItem
} from '../types';
import * as queries from '../graphql';
// Custom user creation mutation with roles support
const CREATE_USER_WITH_ROLES = `
  mutation CreateUserWithRoles($data: UserCreateInput!) {
    userCreate(data: $data) {
      id
      email
      firstName
      lastName
      roles {
        items {
          id
          name
        }
      }
      createdAt
      updatedAt
    }
  }
`;

// Create Coach record mutation
const CREATE_COACH = `
  mutation CreateCoach($data: CoachCreateInput!) {
    coachCreate(data: $data) {
      id
      firstName
      lastName
      email
      bio
      profileImage {
        downloadUrl
      }
      user {
        id
        email
        firstName
        lastName
      }
      createdAt
      updatedAt
    }
  }
`;

// Create Student record mutation
const CREATE_STUDENT = `
  mutation CreateStudent($data: StudentCreateInput!) {
    studentCreate(data: $data) {
      id
      phone
      business_name
      location
      target_market
      strengths
      challenges
      goals
      preferred_contact_method
      availability
      notes
      user {
        id
        email
        firstName
        lastName
      }
      createdAt
      updatedAt
    }
  }
`;

// We'll use the authenticated Apollo Client from the context instead of creating our own
let apolloClient: any = null;

export const setApolloClient = (client: any) => {
  apolloClient = client;
};

// Helper function to execute GraphQL queries
const executeQuery = async (query: string, variables?: any) => {
  if (!apolloClient) {
    throw new Error('Apollo Client not initialized. Please call setApolloClient first.');
  }
  
  try {
    const { data } = await apolloClient.query({
      query: gql`${query}`,
      variables
    });
    return data;
  } catch (error) {
    console.error('GraphQL Query Error:', error);
    throw error;
  }
};

// Helper function to execute GraphQL mutations
const executeMutation = async (mutation: string, variables?: any) => {
  if (!apolloClient) {
    throw new Error('Apollo Client not initialized. Please call setApolloClient first.');
  }
  
  try {
    const { data } = await apolloClient.mutate({
      mutation: gql`${mutation}`,
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
    coach: user.coach || null,
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
  message_sent: lead.message_sent,
  followed_back: lead.followed_back,
  followed_up: lead.followed_up,
  status: lead.status,
  created_at: lead.createdAt,
  updated_at: lead.updatedAt
});

const transformStudentLead = (lead: any): Lead => {
  // Create engagement tags based on boolean fields
  const engagementTag: EngagementTag[] = [];
  
  if (lead.message_sent) {
    engagementTag.push({
      type: 'dm_sent',
      completed_date: lead.updatedAt || lead.createdAt
    });
  }
  
  if (lead.followed_back) {
    engagementTag.push({
      type: 'follow_day_engagement',
      completed_date: lead.updatedAt || lead.createdAt
    });
  }
  
  if (lead.followed_up) {
    engagementTag.push({
      type: 'follow_up_dm_sent',
      completed_date: lead.updatedAt || lead.createdAt
    });
  }

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
    engagementTag: engagementTag,
    script_components: {
      intro: '',
      hook: '',
      body1: '',
      body2: '',
      ending: ''
    },
    message_sent: lead.message_sent,
    followed_back: lead.followed_back,
    followed_up: lead.followed_up,
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
  packageFeatures: pricing.packageFeatures,
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
  user_id: product.student?.id,
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
    const data = await executeQuery(queries.GET_USERS);
    return data.usersList.items.map(transformUser);
  },

  async getUsersByFilter(filter: any): Promise<User[]> {
    const data = await executeQuery(queries.GET_USER_BY_FILTER, { filter });
    return data.usersList.items.map(transformUser);
  },

  async createUser(userData: any): Promise<User> {
    try {
      // First, create the user
      const userResult = await executeMutation(CREATE_USER_WITH_ROLES, { data: userData });
      const createdUser = transformUser(userResult.userCreate);
      
      // Determine the user's role
      let userRole: 'user' | 'coach' | 'coach_manager' | 'super_admin' = 'user';
      if (userData.roles && userData.roles.connect && userData.roles.connect.length > 0) {
        const roleName = userData.roles.connect[0].name;
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
      
      // Create Coach record if user has coach role
      if (userRole === 'coach') {
        try {
          const coachData = {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email,
            bio: '',
            user: {
              connect: { id: createdUser.id }
            }
          };
          
          const coachResult = await executeMutation(CREATE_COACH, { data: coachData });
          console.log(`Coach record created and connected to user: ${createdUser.id}`, coachResult);
        } catch (coachError) {
          console.error('Failed to create coach record:', coachError);
          // Don't fail the entire operation if coach creation fails
        }
      }
      
      // Create Student record if user has student/user role
      if (userRole === 'user') {
        try {
          const studentData = {
            phone: '',
            business_name: '',
            location: '',
            target_market: '',
            strengths: '',
            challenges: '',
            goals: '',
            preferred_contact_method: '',
            availability: '',
            notes: '',
            user: {
              connect: { id: createdUser.id }
            }
          };
          
          await executeMutation(CREATE_STUDENT, { data: studentData });
          console.log(`Student record created for user: ${createdUser.id}`);
        } catch (studentError) {
          console.error('Failed to create student record:', studentError);
          // Don't fail the entire operation if student creation fails
        }
      }
      
      return createdUser;
    } catch (error) {
      console.error('Error creating user with related records:', error);
      throw error;
    }
  },

  async updateUser(id: string, updates: any): Promise<User> {
    // Transform the updates to match the correct field names
    const transformedUpdates: any = {};
    
    // Map field names to correct 8base field names
    if (updates.email) transformedUpdates.email = updates.email;
    if (updates.firstName) transformedUpdates.firstName = updates.firstName;
    if (updates.lastName) transformedUpdates.lastName = updates.lastName;
    if (updates.status) transformedUpdates.status = updates.status;
    if (updates.origin) transformedUpdates.origin = updates.origin;
    if (updates.timezone) transformedUpdates.timezone = updates.timezone;
    
    // Handle roles - convert role string to roles connection
    if (updates.role) {
      // This would need to be handled differently based on your role system
      // For now, we'll skip role updates as they need special handling
      console.log('Role updates need special handling - skipping for now');
    }
    
    // Handle assigned_admin_id - convert to both assignedCoach and coach relationships
    if (updates.assigned_admin_id !== undefined) {
      if (updates.assigned_admin_id) {
        transformedUpdates.assignedCoach = {
          connect: { id: updates.assigned_admin_id }
        };
        transformedUpdates.coach = {
          connect: { id: updates.assigned_admin_id }
        };
      } else {
        transformedUpdates.assignedCoach = {
          disconnect: true
        };
        transformedUpdates.coach = {
          disconnect: true
        };
      }
    }
    
    // Remove fields that don't exist in UserUpdateInput
    const validFields = [
      'firstName', 'lastName', 'email', 'status', 'origin', 'timezone',
      'assignedCoach', 'coach', 'roles'
    ];
    
    // Only include valid fields
    const finalUpdates: any = {};
    Object.keys(transformedUpdates).forEach(key => {
      if (validFields.includes(key)) {
        finalUpdates[key] = transformedUpdates[key];
      }
    });
    
    const data = await executeMutation(queries.UPDATE_USER, { 
      filter: { id }, 
      data: finalUpdates 
    });
    
    // If role is being changed to coach, ensure coach record exists
    if (updates.role === 'coach') {
      await this.ensureCoachRecord(id, updates);
    }
    
    return transformUser(data.userUpdate);
  },

  async updateUserWithCoach(id: string, updates: any, assignedCoachId?: string): Promise<User> {
    // Transform the updates to match the correct field names
    const transformedUpdates: any = {};
    
    // Map field names to correct 8base field names
    if (updates.email) transformedUpdates.email = updates.email;
    if (updates.firstName) transformedUpdates.firstName = updates.firstName;
    if (updates.lastName) transformedUpdates.lastName = updates.lastName;
    if (updates.status) transformedUpdates.status = updates.status;
    if (updates.origin) transformedUpdates.origin = updates.origin;
    if (updates.timezone) transformedUpdates.timezone = updates.timezone;
    
    // Handle roles - convert role string to roles connection
    if (updates.role) {
      // This would need to be handled differently based on your role system
      // For now, we'll skip role updates as they need special handling
      console.log('Role updates need special handling - skipping for now');
    }
    
    // Construct the data object with both assignedCoach and coach relationships
    // assignedCoachId should be the coach ID from the coach table
    const dataObject = {
      ...transformedUpdates,
      ...(assignedCoachId && {
        assignedCoach: {
          connect: { id: assignedCoachId }
        },
        coach: {
          connect: { id: assignedCoachId }
        }
      })
    };
    
    const data = await executeMutation(queries.UPDATE_USER_WITH_COACH, { 
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
      // Connect to a coach
      const dataObject = {
      assignedCoach: {
        connect: { id: coachId }
      },
      coach: {
        connect: { id: coachId }
      }
      };
      
      const data = await executeMutation(queries.UPDATE_USER_WITH_COACH, {
        filter: { id: studentId },
        data: dataObject
      });
      return transformUser(data.userUpdate);
    } else {
      // Disconnect from current coach - we need to get the current coach ID first
      const currentUsers = await this.getUsersByFilter({ id: { equals: studentId } });
      const currentUser = currentUsers[0];
      const currentCoachId = currentUser?.assignedCoach?.id;
      
      if (currentCoachId) {
        const dataObject = {
      assignedCoach: {
            disconnect: { id: currentCoachId }
      },
      coach: {
            disconnect: { id: currentCoachId }
      }
    };
    
    const data = await executeMutation(queries.UPDATE_USER_WITH_COACH, {
      filter: { id: studentId },
      data: dataObject
    });
    return transformUser(data.userUpdate);
      } else {
        // No coach to disconnect
        return currentUser;
      }
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
      // Load coaches from the Coach table since assignedCoach points to Coach records
      const data = await executeQuery(queries.GET_ALL_COACHES);
      return data.coachesList.items;
    } catch (error) {
      console.error('Failed to get all coaches:', error);
      return [];
    }
  },

  async getCoachByUserId(userId: string): Promise<any> {
    try {
      const data = await executeQuery(queries.GET_COACH_BY_USER_ID, { userId });
      return data.coachesList.items.length > 0 ? data.coachesList.items[0] : null;
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
      filter: { student: { id: { equals: userId } } }
    });
    return data.studentsList.items.length > 0 ? data.studentsList.items[0] : null;
  },

  async updateStudentProfile(userId: string, updates: Partial<StudentProfile>): Promise<StudentProfile> {
    const existingProfile = await this.getStudentProfile(userId);

    if (existingProfile) {
      const data = await executeMutation(queries.UPDATE_STUDENT_PROFILE, {
        id: existingProfile.id,
        data: updates
      });
      return data.studentProfileUpdate;
    } else {
      const data = await executeMutation(queries.CREATE_STUDENT_PROFILE, {
        data: { ...updates, student: { connect: { id: userId } } }
      });
      return data.studentProfileCreate;
    }
  },

  // Weekly Reports
  async getWeeklyReports(userId?: string): Promise<WeeklyReport[]> {
    const filter = userId ? { student: { id: { equals: userId } } } : {};
    const data = await executeQuery(queries.GET_WEEKLY_REPORTS_BY_FILTER, { filter });
    return data.weeklyReportsList.items.map(transformWeeklyReport);
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

  async createWeeklyReport(report: Omit<WeeklyReport, 'id' | 'created_at' | 'updated_at'>): Promise<WeeklyReport> {
    // Transform the data to include student connection
    const reportData = {
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
      student: {
        connect: { id: report.user_id }
      }
    };
    
    const data = await executeMutation(queries.CREATE_WEEKLY_REPORT, { data: reportData });
    return transformWeeklyReport(data.weeklyReportCreate);
  },

  async updateWeeklyReport(id: string, updates: Partial<WeeklyReport>): Promise<WeeklyReport> {
    // Format the data to match WeeklyReportUpdateByFilterInput structure
    const formattedData: any = {};
    
    if (updates.start_date) formattedData.start_date = { set: updates.start_date };
    if (updates.end_date) formattedData.end_date = { set: updates.end_date };
    if (updates.new_clients !== undefined) formattedData.new_clients = { set: updates.new_clients };
    if (updates.paid_shoots !== undefined) formattedData.paid_shoots = { set: updates.paid_shoots };
    if (updates.free_shoots !== undefined) formattedData.free_shoots = { set: updates.free_shoots };
    if (updates.unique_clients !== undefined) formattedData.unique_clients = { set: updates.unique_clients };
    if (updates.aov !== undefined) formattedData.aov = { set: updates.aov };
    if (updates.revenue !== undefined) formattedData.revenue = { set: updates.revenue };
    if (updates.expenses !== undefined) formattedData.expenses = { set: updates.expenses };
    if (updates.editing_cost !== undefined) formattedData.editing_cost = { set: updates.editing_cost };
    if (updates.net_profit !== undefined) formattedData.net_profit = { set: updates.net_profit };
    if (updates.status) formattedData.status = { set: updates.status };
    
    const data = await executeMutation(queries.UPDATE_WEEKLY_REPORT, {
      filter: { id: { equals: id } },
      data: formattedData
    });
    return transformWeeklyReport(data.weeklyReportUpdateByFilter.items[0]);
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
        connect: { id: goal.user_id }
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
    
    // Handle student connection if user_id is provided
    if (updates.user_id) {
      goalUpdates.student = {
        connect: { id: updates.user_id }
      };
    }
    
    const data = await executeMutation(queries.UPDATE_GOAL, { 
      filter: { id }, 
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
    const filter = userId ? { user: { id: { equals: userId } } } : {};
    const data = await executeQuery(queries.GET_COACH_PRICING_BY_FILTER, { filter });
    return data.coachPricingsList.items.map(transformCoachPricing);
  },

  async createCoachPricing(pricing: Omit<CoachPricingItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<CoachPricingItem> {
    const data = await executeMutation(queries.CREATE_COACH_PRICING, { data: pricing });
    return transformCoachPricing(data.coachPricingCreate);
  },

  async updateCoachPricing(id: string, updates: Partial<CoachPricingItem>): Promise<CoachPricingItem> {
    const data = await executeMutation(queries.UPDATE_COACH_PRICING, { id, data: updates });
    return transformCoachPricing(data.coachPricingUpdate);
  },

  async deleteCoachPricing(id: string): Promise<void> {
    await executeMutation(queries.DELETE_COACH_PRICING, { id });
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
      message_sent: lead.message_sent,
      followed_back: lead.followed_back,
      followed_up: lead.followed_up,
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
            ...tag,
            lead: { connect: { id: createdLead.id } }
          }
        });
      }
    }

    return transformLead(createdLead);
  },

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const data = await executeMutation(queries.UPDATE_LEAD, { 
      filter: { id }, 
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
    const data = await executeMutation(queries.CREATE_ENGAGEMENT_TAG, {
      data: {
        ...tag,
        completed_date: new Date(tag.completed_date).toISOString().split('T')[0],
        lead: { connect: { id: leadId } }
      }
    });
    
    // Return updated lead
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
    const data = await executeMutation(queries.CREATE_CALL_LOG, { data: callLog });
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
  async getNotes(targetType: string, targetId: string, userRole?: string): Promise<Note[]> {
    const data = await executeQuery(queries.GET_NOTES_BY_FILTER, {
      filter: { targetType: { equals: targetType }, targetId: { equals: targetId } }
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

  async createNote(note: Omit<Note, 'id' | 'created_at'>): Promise<Note> {
    const data = await executeMutation(queries.CREATE_NOTE, { data: note });
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
      filter: { student: { id: { equals: userId } } }
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
      return data.globalVariablesUpdate;
    } else {
    const data = await executeMutation(queries.CREATE_GLOBAL_VARIABLES, {
        data: { ...updates, student: { connect: { id: userId } } }
    });
    return data.globalVariablesCreate;
    }
  },

  // Products
  async getProducts(userId: string): Promise<Product[]> {
    const data = await executeQuery(queries.GET_PRODUCTS_BY_FILTER, {
      filter: { student: { id: { equals: userId } } }
    });
    return data.productsList.items.map(transformProduct);
  },

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
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

  async createSubitem(subitem: Omit<Subitem, 'id' | 'created_at' | 'updated_at'>): Promise<Subitem> {
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

  async getCoachKPISummary(coachId: string, timeFrame: any): Promise<CoachKPISummary> {
    try {
      const response = await apolloClient.query({ query: gql`${queries.GET_COACH_KPI_SUMMARY_BY_FILTER}`, variables: {
        filter: {
          coach_id: { equals: coachId },
          time_frame: timeFrame
        }
      } });
      
      if (response.data.coachKPISummaryList.items.length === 0) {
        throw new Error('Coach KPI summary not found');
      }
      
      return response.data.coachKPISummaryList.items[0];
    } catch (error) {
      console.error('Error fetching coach KPI summary:', error);
      throw error;
    }
  },

  async getMultipleStudentKPIs(studentIds: string[], timeFrame: any): Promise<StudentKPIData[]> {
    try {
      const response = await apolloClient.query({ query: gql`${queries.GET_MULTIPLE_STUDENT_KPIS}`, variables: {
        studentIds,
        timeFrame
      } });
      
      return response.data.multipleStudentKPIs;
    } catch (error) {
      console.error('Error fetching multiple student KPIs:', error);
      throw error;
    }
  },

  async getStudentActivitySummary(studentIds: string[], timeFrame: any): Promise<any[]> {
    try {
      const response = await apolloClient.query({ query: gql`${queries.GET_STUDENT_ACTIVITY_SUMMARY}`, variables: {
        studentIds,
        timeFrame
      } });
      
      return response.data.studentActivitySummary;
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
  async bulkAssignStudentsToCoach(assignments: Array<{ student_id: string; coach_id: string | null }>) {
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
      const response = await apolloClient.query({ query: gql`${queries.GET_WEEKLY_REPORTS_BY_FILTER}`, variables: {
        filter: {}
      } });
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
  }
}; 