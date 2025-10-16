// Existing types...
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'coach' | 'coach_manager' | 'super_admin';
  assigned_admin_id?: string | null;
  assignedCoach?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    coachType?: 'LAUNCH' | 'FRWRD';
  } | null;
  coach?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    coachType?: 'LAUNCH' | 'FRWRD';
  } | null;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    business_name?: string;
    location?: string;
    target_market?: string;
    strengths?: string;
    challenges?: string;
    goals?: string;
    preferred_contact_method?: string;
    availability?: string;
    notes?: string;
  } | null;
  access_start: string;
  access_end: string;
  has_paid: boolean;
  created_at: string;
  updatedAt?: string;
  coaching_term_start?: string | null;
  coaching_term_end?: string | null;
  is_active?: boolean;
  why?: string; // User's motivational "why" for their business
  roles?: {
    items: Array<{
      id: string;
      name: string;
      __typename?: string;
    }>;
    __typename?: string;
  };
}

export interface WeeklyReport {
  id: string;
  student_id: string;
  start_date: string;
  end_date: string;
  new_clients: number;
  paid_shoots: number;
  free_shoots: number;
  unique_clients: number;
  aov: number;
  revenue: number;
  expenses: number;
  editing_cost: number;
  net_profit: number;
  status: 'active' | 'completed';
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  createdBy?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  student?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  weekly_Report?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface Goal {
  id: string;
  student_id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  goal_type: 'revenue' | 'clients' | 'shoots' | 'text' | 'other';
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed';
  progress_percentage?: number;
  created_at: string;
  updated_at: string;
}


export interface CoachPricingItem {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_weeks: number;
  category: string;
  package_Features: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}


export interface Pricing {
  id: string;
  student_id: string;
  service_name: string;
  your_price: number;
  competitor_price: number;
  estimated_cost: number;
  estimated_profit: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Enhanced Lead interface with email and phone fields
export interface Lead {
  id: string;
  student_id: string;
  lead_name: string;
  email?: string;
  phone?: string;
  instagram_handle?: string;
  lead_source: string;
  initial_call_outcome?: string;
  date_of_initial_call?: string;
  last_followup_outcome?: string;
  date_of_last_followup?: string;
  next_followup_date?: string;
  notes?: string; // Lead notes for quick jotting after calls
  lead_notes?: string; // Additional lead notes for students to jot quick notes after calls
  leadnote?: string; // Lead notes field from schema (Text field, 1000 chars max)
  // New engagement tracking system - array of tags
  engagementTag: EngagementTag[];
  script_components: {
    intro: string;
    hook: string;
    body1: string;
    body2: string;
    ending: string;
  };
  ScriptComponents?: {
    id: string;
    intro: string;
    hook: string;
    body1: string;
    body2: string;
    ending: string;
    created_at: string;
    updated_at: string;
  }[];
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  created_at: string;
  updated_at: string;
}

// New engagement tag system - matches 8base schema
export type EngagementTagType =
  | 'follow_day_engagement'
  | 'engagement_day_1'
  | 'engagement_day_2'
  | 'dm_sent'
  | 'initial_call_done'
  | 'follow_up_call_done'
  | 'follow_up_dm_sent';

export interface EngagementTag {
  id?: string;
  type: EngagementTagType;
  completed_date: string; // ISO date string
}

// Helper type for engagement tag display
export interface EngagementTagInfo {
  type: EngagementTagType;
  label: string;
  description: string;
  color: string;
  icon: string;
}

export interface Note {
  id: string;
  title: string;
  target_type: string;
  target_id: string;
  student_id: string;
  content: string;
  visibility: 'public' | 'private';
  created_at: string;
  createdAt?: string; // API field name
  created_by: string;
  created_by_name: string;
  student_name?: string; // Student's full name extracted from studentNote
  studentNote?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    user?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  };
  coach?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    users?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  };
}

// Enhanced MessageTemplate system for multiple variations using ScriptComponents
export type MessageTemplateType = 'intro' | 'hook' | 'body1' | 'body2' | 'ending';

export interface MessageTemplate {
  id: string;
  type: MessageTemplateType;
  content: string;
  category: string;
  variation_number: number; // 1-5 for each type
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ScriptComponent template interface for user-specific templates
export interface ScriptComponentTemplate {
  id: string;
  intro: string;
  hook: string;
  body1: string;
  body2: string;
  ending: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  lead?: {
    id: string;
  };
  created_at: string;
  updated_at: string;
  // Additional properties for template management UI
  type?: MessageTemplateType;
  content?: string;
  variation_number?: number;
}

// Helper interface for template management
export interface TemplateVariationSet {
  type: MessageTemplateType;
  variations: MessageTemplate[];
}

export interface StudentProfile {
  id: string;
  student_id: string;
  business_name?: string;
  location?: string;
  target_market?: string;
  strengths?: string;
  challenges?: string;
  goals?: string;
  preferred_contact_method?: string;
  phone?: string;
  email?: string;
  availability?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CallLog {
  id: string;
  student_id: string;
  coach_id: string;
  call_date: string;
  call_duration: number;
  call_type: 'scheduled' | 'follow_up' | 'emergency';
  topics_discussed: string[];
  outcome: string;
  next_steps: string;
  student_mood: 'positive' | 'neutral' | 'frustrated' | 'motivated';
  recording_url?: string; // URL to call recording
  created_at: string;
  updated_at: string;
  student?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  coach?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    bio?: string;
  };
}

// Profit Margin Calculator Types
export interface GlobalVariables {
  id: string;
  student_id: string;
  hourly_pay: number;
  cost_per_photo: number;
  target_profit_margin: number; // Percentage (e.g., 40 for 40%)
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  student_id?: string;
  name: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Subitem {
  id: string;
  product_id?: string;
  type: 'fixed' | 'photo' | 'labor';
  label: string;
  value: number; // For fixed: amount, for photo: # of photos, for labor: # of hours
  created_at: string;
  updated_at: string;
}

// Calculated fields for display (not stored in database)
export interface ProductWithCalculations extends Product {
  subitems: Subitem[];
  total_cost: number;
  profit: number;
  profit_margin: number;
  minimum_price: number;
}

export interface SubitemWithCalculation extends Subitem {
  calculated_cost: number;
}

// KPI System Types
export type TimeFramePreset = '7days' | '30days' | '90days' | '6months' | '1year' | 'custom';

export interface TimeFrameFilter {
  preset: TimeFramePreset;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  label: string;
}

export interface StudentKPIData {
  student_id: string;
  student_name: string;
  student_email: string;
  assigned_coach_id?: string | null;
  coach_name?: string | null;
  is_paid_user: boolean;

  // Lead Generation KPIs
  total_leads: number;
  new_leads: number; // Within time frame
  leads_by_source: Record<string, number>;
  leads_by_status: Record<string, number>;

  // Outreach KPIs
  total_dms_sent: number;
  initial_dms_sent: number;
  follow_up_dms_sent: number;

  // Call Activity KPIs
  total_calls_made: number;
  initial_calls_made: number;
  follow_up_calls_made: number;

  // Engagement KPIs
  engagement_completion_rate: number; // Percentage of leads with all engagement steps
  conversion_rate: number; // Percentage of leads converted

  // Time-based metrics
  avg_time_to_first_contact: number; // Days
  avg_time_to_conversion: number; // Days

  // Activity trends
  activity_trend: 'increasing' | 'decreasing' | 'stable';
  last_activity_date: string | null;

  // Time frame info
  time_frame: TimeFrameFilter;
}

export interface CoachKPISummary {
  coach_id: string;
  coach_name: string;
  total_students: number;
  active_students: number; // Students with activity in time frame
  paid_students: number;
  free_students: number;

  // Aggregate student performance
  total_leads_generated: number;
  total_dms_sent: number;
  total_calls_made: number;

  // Coach effectiveness metrics
  avg_student_conversion_rate: number;
  avg_student_engagement_rate: number;
  students_above_benchmarks: number;

  // Recent activity
  recent_calls_logged: number;
  students_needing_attention: number; // No activity in 7+ days

  time_frame: TimeFrameFilter;
}

export interface KPIBenchmarks {
  // Weekly benchmarks for active students
  weekly_new_leads: number;
  weekly_dms_sent: number;
  weekly_calls_made: number;

  // Monthly benchmarks
  monthly_new_leads: number;
  monthly_dms_sent: number;
  monthly_calls_made: number;
  monthly_conversion_rate: number; // Percentage

  // Engagement benchmarks
  target_engagement_completion_rate: number; // Percentage
  max_days_without_activity: number;
}

// Chart data for KPI visualization
export interface KPIChartData {
  date: string;
  leads: number;
  dms: number;
  calls: number;
  conversions: number;
}

export interface StudentActivitySummary {
  student: User;
  recent_leads: number;
  recent_dms: number;
  recent_calls: number;
  last_activity: string | null;
  performance_score: number; // 0-100 based on benchmarks
  status: 'excellent' | 'good' | 'needs_attention' | 'inactive';
  alerts: string[]; // Performance alerts
}

// Notification Types for Personalized Coach Messages
export interface PersonalizedNotification {
  id: string;
  studentId: string;
  coachId: string;
  title: string;
  message: string;
  type: 'COACH_MESSAGE' | 'NO_REPORT_7_DAYS' | 'NO_LEADS_7_DAYS' | 'NO_COACH_CALL_14_DAYS' | 'STAY_FOCUSED';
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  coach?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreatePersonalizedNotificationInput {
  studentId: string;
  coachId: string;
  title: string;
  message: string;
  type: 'COACH_MESSAGE';
  priority: 'high' | 'medium' | 'low';
}