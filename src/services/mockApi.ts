import { WeeklyReport, Goal, Pricing, Lead, Note, MessageTemplate, User, StudentProfile, CallLog, GlobalVariables, Product, Subitem, EngagementTag, MessageTemplateType, TimeFrameFilter, TimeFramePreset, StudentKPIData, CoachKPISummary, KPIBenchmarks, StudentActivitySummary, KPIChartData } from '../types';

// Helper function to calculate coaching term dates (exactly 6 months apart)
const calculateCoachingTermDates = (startDate: string): { coaching_term_start: string; coaching_term_end: string } => {
  const start = new Date(startDate);
  // Set to first of the month
  start.setDate(1);
  
  // Calculate end date (exactly 6 months later)
  const end = new Date(start);
  end.setMonth(end.getMonth() + 6);
  
  return {
    coaching_term_start: start.toISOString().split('T')[0],
    coaching_term_end: end.toISOString().split('T')[0]
  };
};

// KPI Helper Functions
const createTimeFrameFilter = (preset: TimeFramePreset, customStart?: string, customEnd?: string): TimeFrameFilter => {
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
};

const isWithinTimeFrame = (date: string, timeFrame: TimeFrameFilter): boolean => {
  const itemDate = new Date(date);
  const startDate = new Date(timeFrame.startDate);
  const endDate = new Date(timeFrame.endDate);
  return itemDate >= startDate && itemDate <= endDate;
};

// KPI Benchmarks
const defaultBenchmarks: KPIBenchmarks = {
  weekly_new_leads: 5,
  weekly_dms_sent: 8,
  weekly_calls_made: 3,
  monthly_new_leads: 20,
  monthly_dms_sent: 32,
  monthly_calls_made: 12,
  monthly_conversion_rate: 15, // 15%
  target_engagement_completion_rate: 80, // 80%
  max_days_without_activity: 7
};

// Enhanced mock data with coaching term dates for free users
let mockUsers: User[] = [
  {
    id: '1',
    name: 'John Student',
    email: 'student@example.com',
    role: 'user',
    assigned_admin_id: '2',
    access_start: '2024-01-01',
    access_end: '2025-12-31',
    has_paid: true,
    created_at: '2024-01-01T00:00:00Z',
    coaching_term_start: null,
    coaching_term_end: null
  },
  {
    id: '2',
    name: 'Sarah Coach',
    email: 'coach@example.com',
    role: 'coach',
    access_start: '2024-01-01',
    access_end: '2025-12-31',
    has_paid: true,
    created_at: '2024-01-01T00:00:00Z',
    coaching_term_start: null,
    coaching_term_end: null,
    is_active: true
  },
  {
    id: '3',
    name: 'Mike SuperAdmin',
    email: 'superadmin@example.com',
    role: 'super_admin',
    access_start: '2024-01-01',
    access_end: '2025-12-31',
    has_paid: true,
    created_at: '2024-01-01T00:00:00Z',
    coaching_term_start: null,
    coaching_term_end: null
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    email: 'emily.student@example.com',
    role: 'user',
    assigned_admin_id: '2',
    access_start: '2024-02-01',
    access_end: '2025-12-31',
    has_paid: true,
    created_at: '2024-02-01T00:00:00Z',
    coaching_term_start: null,
    coaching_term_end: null
  },
  {
    id: '5',
    name: 'David Thompson',
    email: 'david.student@example.com',
    role: 'user',
    assigned_admin_id: '6',
    access_start: '2024-03-01',
    access_end: '2025-12-31',
    has_paid: true,
    created_at: '2024-03-01T00:00:00Z',
    coaching_term_start: null,
    coaching_term_end: null
  },
  {
    id: '6',
    name: 'Lisa Chen',
    email: 'lisa.coach@example.com',
    role: 'coach',
    access_start: '2024-01-15',
    access_end: '2025-12-31',
    has_paid: true,
    created_at: '2024-01-15T00:00:00Z',
    coaching_term_start: null,
    coaching_term_end: null,
    is_active: true
  },
  {
    id: '7',
    name: 'Marcus Johnson',
    email: 'marcus.student@example.com',
    role: 'user',
    assigned_admin_id: '6',
    access_start: '2024-04-01',
    access_end: '2025-12-31',
    has_paid: false, // Free user
    created_at: '2024-04-01T00:00:00Z',
    ...calculateCoachingTermDates('2024-04-01')
  },
  {
    id: '8',
    name: 'Anna Wilson',
    email: 'anna.student@example.com',
    role: 'user',
    assigned_admin_id: null,
    access_start: '2024-05-01',
    access_end: '2025-12-31',
    has_paid: false, // Free user
    created_at: '2024-05-01T00:00:00Z',
    ...calculateCoachingTermDates('2024-05-01')
  },
  {
    id: '9',
    name: 'Robert Garcia',
    email: 'robert.coach@example.com',
    role: 'coach',
    access_start: '2024-02-01',
    access_end: '2025-12-31',
    has_paid: true,
    created_at: '2024-02-01T00:00:00Z',
    coaching_term_start: null,
    coaching_term_end: null,
    is_active: true
  },
  // Add some Coach Manager users
  {
    id: '13',
    name: 'Alex Manager',
    email: 'alex.manager@example.com',
    role: 'coach_manager',
    access_start: '2024-01-01',
    access_end: '2025-12-31',
    has_paid: true,
    created_at: '2024-01-01T00:00:00Z',
    coaching_term_start: null,
    coaching_term_end: null,
    is_active: true
  },
  // Additional free users for testing with different coaching term dates
  {
    id: '10',
    name: 'Jessica Martinez',
    email: 'jessica.free@example.com',
    role: 'user',
    assigned_admin_id: '2',
    access_start: '2024-06-01',
    access_end: '2025-12-31',
    has_paid: false, // Free user - current coaching term
    created_at: '2024-06-01T00:00:00Z',
    ...calculateCoachingTermDates('2024-06-01')
  },
  {
    id: '11',
    name: 'Tyler Brown',
    email: 'tyler.expired@example.com',
    role: 'user',
    assigned_admin_id: '6',
    access_start: '2023-12-01',
    access_end: '2025-12-31',
    has_paid: false, // Free user with expired term
    created_at: '2023-12-01T00:00:00Z',
    ...calculateCoachingTermDates('2023-12-01')
  },
  {
    id: '12',
    name: 'Sophie Chen',
    email: 'sophie.upcoming@example.com',
    role: 'user',
    assigned_admin_id: '2',
    access_start: '2025-01-01',
    access_end: '2025-12-31',
    has_paid: false, // Free user with upcoming term
    created_at: '2024-12-01T00:00:00Z',
    ...calculateCoachingTermDates('2025-01-01')
  }
];

// Mock student profiles (existing)
let mockStudentProfiles: StudentProfile[] = [
  {
    id: '1',
    user_id: '1',
    business_name: 'John\'s Real Estate Photography',
    location: 'Austin, TX',
    target_market: 'Luxury homes and commercial properties',
    strengths: 'Great eye for detail, strong editing skills',
    challenges: 'Pricing confidence, lead generation',
    goals: 'Reach $10K monthly revenue by end of year',
    preferred_contact_method: 'Phone calls',
    availability: 'Weekday evenings, weekend mornings',
    notes: 'Very motivated, quick learner',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-06-15T00:00:00Z'
  },
  {
    id: '2',
    user_id: '4',
    business_name: 'Rodriguez Photography Solutions',
    location: 'Miami, FL',
    target_market: 'High-end residential and vacation rentals',
    strengths: 'Bilingual, strong social media presence',
    challenges: 'Time management, pricing strategy',
    goals: 'Expand to commercial properties',
    preferred_contact_method: 'Text/WhatsApp',
    availability: 'Flexible schedule',
    notes: 'Great potential, needs confidence boost',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-06-20T00:00:00Z'
  },
  {
    id: '3',
    user_id: '7',
    business_name: 'MJ Photography Studio',
    location: 'Denver, CO',
    target_market: 'Mid-range residential properties',
    strengths: 'Quick turnaround, reliable',
    challenges: 'Marketing, social media presence',
    goals: 'Build consistent client base',
    preferred_contact_method: 'Email',
    availability: 'Weekends preferred',
    notes: 'Free user, eager to learn',
    created_at: '2024-04-01T00:00:00Z',
    updated_at: '2024-06-20T00:00:00Z'
  },
  {
    id: '4',
    user_id: '8',
    business_name: 'Wilson Real Estate Visuals',
    location: 'Seattle, WA',
    target_market: 'Urban condos and apartments',
    strengths: 'Tech-savvy, good equipment',
    challenges: 'Networking, client acquisition',
    goals: 'Establish premium pricing',
    preferred_contact_method: 'Phone calls',
    availability: 'Very flexible',
    notes: 'Free user, highly motivated',
    created_at: '2024-05-01T00:00:00Z',
    updated_at: '2024-06-20T00:00:00Z'
  },
  {
    id: '5',
    user_id: '10',
    business_name: 'Martinez Creative Studios',
    location: 'Phoenix, AZ',
    target_market: 'New construction and model homes',
    strengths: 'Creative composition, attention to detail',
    challenges: 'Client communication, follow-up',
    goals: 'Develop consistent monthly income',
    preferred_contact_method: 'Email and phone',
    availability: 'Monday-Friday mornings',
    notes: 'Currently in active coaching program',
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2024-06-20T00:00:00Z'
  }
];

// Mock call logs (existing)
let mockCallLogs: CallLog[] = [
  {
    id: '1',
    student_id: '1',
    coach_id: '2',
    call_date: '2024-06-25',
    call_duration: 45,
    call_type: 'scheduled',
    topics_discussed: ['Pricing strategy', 'Lead generation', 'Goal setting'],
    outcome: 'Student will implement new pricing structure and focus on Instagram outreach',
    next_steps: 'Follow up in 1 week to review progress',
    student_mood: 'motivated',
    created_at: '2024-06-25T14:00:00Z',
    updated_at: '2024-06-25T14:00:00Z'
  },
  {
    id: '2',
    student_id: '4',
    coach_id: '2',
    call_date: '2024-06-28',
    call_duration: 30,
    call_type: 'follow_up',
    topics_discussed: ['Time management', 'Client communication'],
    outcome: 'Discussed scheduling tools and client onboarding process',
    next_steps: 'Student will implement scheduling system',
    student_mood: 'positive',
    created_at: '2024-06-28T10:00:00Z',
    updated_at: '2024-06-28T10:00:00Z'
  },
  {
    id: '3',
    student_id: '7',
    coach_id: '6',
    call_date: '2024-06-30',
    call_duration: 60,
    call_type: 'scheduled',
    topics_discussed: ['Free coaching program overview', 'Goal setting', 'Initial assessment'],
    outcome: 'Established coaching relationship and initial goals',
    next_steps: 'Complete first weekly report by end of week',
    student_mood: 'motivated',
    created_at: '2024-06-30T16:00:00Z',
    updated_at: '2024-06-30T16:00:00Z'
  },
  {
    id: '4',
    student_id: '10',
    coach_id: '2',
    call_date: '2024-07-15',
    call_duration: 50,
    call_type: 'scheduled',
    topics_discussed: ['Week 6 progress review', 'Pricing adjustments', 'Marketing strategy'],
    outcome: 'Student showing good progress, discussed advanced techniques',
    next_steps: 'Focus on referral system development',
    student_mood: 'positive',
    created_at: '2024-07-15T11:00:00Z',
    updated_at: '2024-07-15T11:00:00Z'
  },
  // Additional recent call logs for KPI testing
  {
    id: '5',
    student_id: '1',
    coach_id: '2',
    call_date: '2024-07-01',
    call_duration: 35,
    call_type: 'follow_up',
    topics_discussed: ['Progress review', 'Lead conversion'],
    outcome: 'Good progress on lead generation',
    next_steps: 'Focus on conversion tactics',
    student_mood: 'motivated',
    created_at: '2024-07-01T15:00:00Z',
    updated_at: '2024-07-01T15:00:00Z'
  },
  {
    id: '6',
    student_id: '4',
    coach_id: '2',
    call_date: '2024-07-02',
    call_duration: 40,
    call_type: 'scheduled',
    topics_discussed: ['Marketing strategy', 'Social media'],
    outcome: 'Improved social media presence plan',
    next_steps: 'Implement content calendar',
    student_mood: 'positive',
    created_at: '2024-07-02T11:00:00Z',
    updated_at: '2024-07-02T11:00:00Z'
  }
];

// Existing mock data (Global Variables, Products, Subitems remain the same)
let mockGlobalVariables: GlobalVariables[] = [
  {
    id: '1',
    user_id: '1',
    hourly_pay: 50,
    cost_per_photo: 1.25,
    target_profit_margin: 40,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '2',
    user_id: '4',
    hourly_pay: 45,
    cost_per_photo: 1.50,
    target_profit_margin: 35,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '3',
    user_id: '7',
    hourly_pay: 30,
    cost_per_photo: 1.00,
    target_profit_margin: 30,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  }
];

let mockProducts: Product[] = [
  {
    id: '1',
    user_id: '1',
    name: 'Standard Photo Shoot',
    price: 250,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '2',
    user_id: '1',
    name: 'Luxury Property Package',
    price: 450,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '3',
    user_id: '4',
    name: 'Basic Real Estate Photos',
    price: 200,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '4',
    user_id: '7',
    name: 'Starter Package',
    price: 150,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  }
];

let mockSubitems: Subitem[] = [
  // Standard Photo Shoot (Product 1)
  {
    id: '1',
    product_id: '1',
    type: 'labor',
    label: 'Shooting Time',
    value: 1.5, // hours
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '2',
    product_id: '1',
    type: 'photo',
    label: 'Photo Editing',
    value: 30, // photos
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '3',
    product_id: '1',
    type: 'fixed',
    label: 'Mileage/Gas',
    value: 15, // flat cost
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  // Luxury Property Package (Product 2)
  {
    id: '4',
    product_id: '2',
    type: 'labor',
    label: 'Shooting & Setup',
    value: 3, // hours
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '5',
    product_id: '2',
    type: 'photo',
    label: 'Photo Editing & Retouching',
    value: 50, // photos
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '6',
    product_id: '2',
    type: 'fixed',
    label: 'Equipment & Travel',
    value: 35, // flat cost
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '7',
    product_id: '2',
    type: 'fixed',
    label: 'Drone Usage',
    value: 50, // flat cost
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  // Basic Real Estate Photos (Product 3)
  {
    id: '8',
    product_id: '3',
    type: 'labor',
    label: 'Photography Session',
    value: 1, // hours
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '9',
    product_id: '3',
    type: 'photo',
    label: 'Basic Editing',
    value: 20, // photos
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '10',
    product_id: '3',
    type: 'fixed',
    label: 'Travel Costs',
    value: 10, // flat cost
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  // Starter Package (Product 4)
  {
    id: '11',
    product_id: '4',
    type: 'labor',
    label: 'Photo Session',
    value: 0.75, // hours
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '12',
    product_id: '4',
    type: 'photo',
    label: 'Standard Editing',
    value: 15, // photos
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '13',
    product_id: '4',
    type: 'fixed',
    label: 'Gas',
    value: 8, // flat cost
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  }
];

// Enhanced mock leads with more data for KPI testing
// let mockLeads: Lead[] = [
//   {
//     id: '1',
//     user_id: '1',
//     lead_name: 'Jennifer Martinez',
//     email: 'jennifer.martinez@coldwellbanker.com',
//     phone: '(555) 123-4567',
//     instagram_handle: '@jenmartinez_realtor',
//     lead_source: 'Instagram',
//     initial_call_outcome: 'Interested in package deal',
//     date_of_initial_call: '2024-06-28',
//     last_followup_outcome: 'Requested pricing info',
//     date_of_last_followup: '2024-06-29',
//     next_followup_date: '2024-07-02',
//     engagement_tags: [
//       {
//         type: 'follow_day_engagement',
//         completed_date: '2024-06-25T00:00:00Z',
//         notes: 'Engaged with 3 recent posts'
//       },
//       {
//         type: 'engagement_day_1',
//         completed_date: '2024-06-26T00:00:00Z',
//         notes: 'Liked and commented on recent listing'
//       },
//       {
//         type: 'dm_sent',
//         completed_date: '2024-06-27T00:00:00Z',
//         notes: 'Sent personalized message about Pine Street listing'
//       },
//       {
//         type: 'initial_call_done',
//         completed_date: '2024-06-28T00:00:00Z',
//         notes: 'Great conversation, very interested'
//       }
//     ],
//     engagement_statuses: {
//       day1: true,
//       day2: true,
//       day3: false
//     },
//     script_components: {
//       intro: 'Hi Jennifer! I saw your recent listing on Pine Street.',
//       hook: 'Your photos look great, but I specialize in helping realtors like you get 3x more engagement with premium photography.',
//       body1: 'I work with top agents in the area and my photos typically help listings sell 20% faster.',
//       body2: 'Would love to show you some before/after examples.',
//       ending: 'When would be a good time for a quick 10-minute call this week?'
//     },
//     message_sent: true,
//     followed_back: true,
//     followed_up: false,
//     status: 'qualified',
//     created_at: '2024-06-20T00:00:00Z',
//     updated_at: '2024-06-29T00:00:00Z'
//   },
//   {
//     id: '2',
//     user_id: '1',
//     lead_name: 'Michael Brown',
//     email: 'mike@premierhomes.com',
//     phone: '(555) 987-6543',
//     instagram_handle: '@mikebrown_realty',
//     lead_source: 'Zillow',
//     initial_call_outcome: 'Very interested',
//     date_of_initial_call: '2024-06-27',
//     last_followup_outcome: 'Scheduled shoot',
//     date_of_last_followup: '2024-06-30',
//     next_followup_date: '2024-07-03',
//     engagement_tags: [
//       {
//         type: 'follow_day_engagement',
//         completed_date: '2024-06-24T00:00:00Z'
//       },
//       {
//         type: 'engagement_day_1',
//         completed_date: '2024-06-25T00:00:00Z'
//       },
//       {
//         type: 'engagement_day_2',
//         completed_date: '2024-06-26T00:00:00Z'
//       },
//       {
//         type: 'dm_sent',
//         completed_date: '2024-06-26T00:00:00Z'
//       },
//       {
//         type: 'initial_call_done',
//         completed_date: '2024-06-27T00:00:00Z'
//       },
//       {
//         type: 'follow_up_call_done',
//         completed_date: '2024-06-30T00:00:00Z'
//       }
//     ],
//     engagement_statuses: {
//       day1: true,
//       day2: true,
//       day3: true,
//       day7: true
//     },
//     script_components: {
//       intro: 'Hi Michael! I noticed your recent property listings.',
//       hook: 'Your current photos are good, but I can help you stand out with premium photography.',
//       body1: 'I specialize in luxury real estate photography.',
//       body2: 'My clients typically see 30% more showings.',
//       ending: 'Would you like to schedule a consultation?'
//     },
//     message_sent: true,
//     followed_back: true,
//     followed_up: true,
//     status: 'converted',
//     created_at: '2024-06-15T00:00:00Z',
//     updated_at: '2024-06-30T00:00:00Z'
//   },
//   // More leads for KPI testing
//   {
//     id: '3',
//     user_id: '1',
//     lead_name: 'Sarah Johnson',
//     email: 'sarah.johnson@century21.com',
//     phone: '(555) 246-8135',
//     instagram_handle: '@sarahjohnson_homes',
//     lead_source: 'Facebook',
//     engagement_tags: [
//       {
//         type: 'follow_day_engagement',
//         completed_date: '2024-07-01T00:00:00Z'
//       },
//       {
//         type: 'engagement_day_1',
//         completed_date: '2024-07-02T00:00:00Z'
//       },
//       {
//         type: 'dm_sent',
//         completed_date: '2024-07-02T00:00:00Z'
//       }
//     ],
//     engagement_statuses: {},
//     script_components: {
//       intro: 'Hi Sarah! I came across your beautiful home listings.',
//       hook: 'I specialize in photography that helps properties stand out and sell faster.',
//       body1: 'Your current photos are nice, but I can help you get even more buyer interest.',
//       body2: 'I\'d love to show you some examples of my work.',
//       ending: 'Would you be open to a quick chat about how I could help with your listings?'
//     },
//     message_sent: false,
//     followed_back: false,
//     followed_up: false,
//     status: 'contacted',
//     created_at: '2024-07-01T00:00:00Z',
//     updated_at: '2024-07-02T00:00:00Z'
//   },
//   // User 4 (Emily) leads
//   {
//     id: '4',
//     user_id: '4',
//     lead_name: 'David Rodriguez',
//     email: 'drodriguez@remax.com',
//     phone: '',
//     instagram_handle: '@davidr_properties',
//     lead_source: 'Instagram',
//     engagement_tags: [
//       {
//         type: 'dm_sent',
//         completed_date: '2024-06-28T00:00:00Z'
//       },
//       {
//         type: 'initial_call_done',
//         completed_date: '2024-06-30T00:00:00Z'
//       }
//     ],
//     engagement_statuses: {},
//     script_components: {
//       intro: 'Hi David! I noticed your luxury property listings.',
//       hook: 'Your listings look amazing, and I specialize in photography that can help them stand out even more.',
//       body1: 'I work with several top agents in the area.',
//       body2: 'My photos typically help properties get 25% more views.',
//       ending: 'Would you be interested in seeing some examples of my work?'
//     },
//     message_sent: false,
//     followed_back: false,
//     followed_up: false,
//     status: 'qualified',
//     created_at: '2024-06-25T00:00:00Z',
//     updated_at: '2024-06-30T00:00:00Z'
//   },
//   {
//     id: '5',
//     user_id: '4',
//     lead_name: 'Lisa Chen',
//     email: '',
//     phone: '(555) 555-0123',
//     instagram_handle: '@lisachen_realty',
//     lead_source: 'Referral',
//     engagement_tags: [
//       {
//         type: 'initial_call_done',
//         completed_date: '2024-07-01T00:00:00Z',
//         notes: 'Referred by Jennifer Martinez - very positive call'
//       }
//     ],
//     engagement_statuses: {},
//     script_components: {
//       intro: 'Hi Lisa! Jennifer Martinez referred me to you.',
//       hook: 'She mentioned you might be interested in premium real estate photography.',
//       body1: 'I just finished some work for Jennifer and she was thrilled with the results.',
//       body2: 'I\'d love to help you showcase your properties in the best light.',
//       ending: 'Would you have time for a quick call this week?'
//     },
//     message_sent: false,
//     followed_back: false,
//     followed_up: false,
//     status: 'contacted',
//     created_at: '2024-07-01T00:00:00Z',
//     updated_at: '2024-07-01T00:00:00Z'
//   },
//   // User 7 (Marcus - free user) leads
//   {
//     id: '6',
//     user_id: '7',
//     lead_name: 'Tom Wilson',
//     email: 'tom@wilsonrealty.com',
//     phone: '(555) 123-9999',
//     instagram_handle: '@tomwilson_realtor',
//     lead_source: 'Instagram',
//     engagement_tags: [
//       {
//         type: 'follow_day_engagement',
//         completed_date: '2024-07-01T00:00:00Z'
//       },
//       {
//         type: 'dm_sent',
//         completed_date: '2024-07-02T00:00:00Z'
//       }
//     ],
//     engagement_statuses: {},
//     script_components: {
//       intro: 'Hi Tom! I saw your recent listings.',
//       hook: 'I help real estate agents with professional photography.',
//       body1: 'Great photos can make a big difference in how quickly properties sell.',
//       body2: 'I\'d love to show you my portfolio.',
//       ending: 'Are you available for a quick chat this week?'
//     },
//     message_sent: true,
//     followed_back: false,
//     followed_up: false,
//     status: 'new',
//     created_at: '2024-07-01T00:00:00Z',
//     updated_at: '2024-07-02T00:00:00Z'
//   }
// ];
let mockLeads: Lead[] = []


// Enhanced Message Templates with 5 variations per type (existing data)
let mockMessageTemplates: MessageTemplate[] = [
  // Intro Templates (5 variations)
  {
    id: '1',
    type: 'intro',
    content: 'Hi {name}! I saw your recent listing on {property_address}.',
    category: 'real_estate',
    variation_number: 1,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '2',
    type: 'intro',
    content: 'Hello {name}! I came across your beautiful property listing.',
    category: 'real_estate',
    variation_number: 2,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '3',
    type: 'intro',
    content: 'Hey {name}! Your recent property post caught my attention.',
    category: 'real_estate',
    variation_number: 3,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '4',
    type: 'intro',
    content: 'Hi there {name}! I noticed your impressive real estate portfolio.',
    category: 'real_estate',
    variation_number: 4,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '5',
    type: 'intro',
    content: 'Good morning {name}! I\'ve been following your listings and they look fantastic.',
    category: 'real_estate',
    variation_number: 5,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },

  // Hook Templates (5 variations)
  {
    id: '6',
    type: 'hook',
    content: 'Your photos look great, but I specialize in helping realtors like you get 3x more engagement with premium photography.',
    category: 'real_estate',
    variation_number: 1,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '7',
    type: 'hook',
    content: 'I help real estate agents showcase their properties with photography that drives faster sales.',
    category: 'real_estate',
    variation_number: 2,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '8',
    type: 'hook',
    content: 'As a real estate photographer, I create images that make listings stand out and sell quicker.',
    category: 'real_estate',
    variation_number: 3,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '9',
    type: 'hook',
    content: 'I specialize in premium property photography that helps agents get more showings and offers.',
    category: 'real_estate',
    variation_number: 4,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '10',
    type: 'hook',
    content: 'Your properties deserve photography that matches their quality - that\'s where I come in.',
    category: 'real_estate',
    variation_number: 5,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },

  // Body1 Templates (5 variations)
  {
    id: '11',
    type: 'body1',
    content: 'I work with top agents in the area and my photos typically help listings sell 20% faster.',
    category: 'real_estate',
    variation_number: 1,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '12',
    type: 'body1',
    content: 'My clients consistently see increased engagement and faster sales with professional photography.',
    category: 'real_estate',
    variation_number: 2,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '13',
    type: 'body1',
    content: 'I\'ve helped dozens of agents in our market improve their listing performance through better photography.',
    category: 'real_estate',
    variation_number: 3,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '14',
    type: 'body1',
    content: 'Professional photography makes such a difference - my clients often see 30% more online views.',
    category: 'real_estate',
    variation_number: 4,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '15',
    type: 'body1',
    content: 'Quality photos are everything in today\'s market - they can make or break a listing\'s success.',
    category: 'real_estate',
    variation_number: 5,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },

  // Body2 Templates (5 variations)
  {
    id: '16',
    type: 'body2',
    content: 'Would love to show you some before/after examples.',
    category: 'real_estate',
    variation_number: 1,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '17',
    type: 'body2',
    content: 'I\'d be happy to share my portfolio and discuss how I can help your listings shine.',
    category: 'real_estate',
    variation_number: 2,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '18',
    type: 'body2',
    content: 'Let me show you examples of how professional photography transformed similar properties.',
    category: 'real_estate',
    variation_number: 3,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '19',
    type: 'body2',
    content: 'I have some great case studies that demonstrate the impact of quality real estate photography.',
    category: 'real_estate',
    variation_number: 4,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '20',
    type: 'body2',
    content: 'My recent work showcases exactly how the right photography can elevate any property.',
    category: 'real_estate',
    variation_number: 5,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },

  // Ending Templates (5 variations)
  {
    id: '21',
    type: 'ending',
    content: 'When would be a good time for a quick 10-minute call this week?',
    category: 'real_estate',
    variation_number: 1,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '22',
    type: 'ending',
    content: 'Would you be open to a brief chat about how I could help with your listings?',
    category: 'real_estate',
    variation_number: 2,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '23',
    type: 'ending',
    content: 'Are you available for a quick conversation sometime this week?',
    category: 'real_estate',
    variation_number: 3,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '24',
    type: 'ending',
    content: 'Would you like to schedule a brief call to discuss your photography needs?',
    category: 'real_estate',
    variation_number: 4,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '25',
    type: 'ending',
    content: 'I\'d love to connect and explore how we might work together. When works best for you?',
    category: 'real_estate',
    variation_number: 5,
    is_active: true,
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-07-01T00:00:00Z'
  }
];

// Mock data (existing data with enhanced revenue tracking)
// let mockWeeklyReports: WeeklyReport[] = [
//   {
//     id: '1',
//     user_id: '1',
//     start_date: '2024-06-24',
//     end_date: '2024-06-30',
//     new_clients: 3,
//     paid_shoots: 5,
//     free_shoots: 2,
//     unique_clients: 7,
//     aov: 450,
//     revenue: 2250,
//     expenses: 300,
//     editing_cost: 150,
//     net_profit: 1800,
//     status: 'submitted',
//     created_at: '2024-06-30T10:00:00Z',
//     updated_at: '2024-06-30T10:00:00Z'
//   },
//   {
//     id: '2',
//     user_id: '4',
//     start_date: '2024-06-24',
//     end_date: '2024-06-30',
//     new_clients: 2,
//     paid_shoots: 4,
//     free_shoots: 1,
//     unique_clients: 5,
//     aov: 500,
//     revenue: 2000,
//     expenses: 250,
//     editing_cost: 100,
//     net_profit: 1650,
//     status: 'submitted',
//     created_at: '2024-06-30T11:00:00Z',
//     updated_at: '2024-06-30T11:00:00Z'
//   },
//   {
//     id: '3',
//     user_id: '5',
//     start_date: '2024-06-24',
//     end_date: '2024-06-30',
//     new_clients: 4,
//     paid_shoots: 6,
//     free_shoots: 3,
//     unique_clients: 8,
//     aov: 400,
//     revenue: 2400,
//     expenses: 400,
//     editing_cost: 200,
//     net_profit: 1800,
//     status: 'submitted',
//     created_at: '2024-06-30T12:00:00Z',
//     updated_at: '2024-06-30T12:00:00Z'
//   },
//   // Free user reports
//   {
//     id: '6',
//     user_id: '7',
//     start_date: '2024-06-24',
//     end_date: '2024-06-30',
//     new_clients: 1,
//     paid_shoots: 2,
//     free_shoots: 1,
//     unique_clients: 3,
//     aov: 300,
//     revenue: 600,
//     expenses: 100,
//     editing_cost: 50,
//     net_profit: 450,
//     status: 'submitted',
//     created_at: '2024-06-30T13:00:00Z',
//     updated_at: '2024-06-30T13:00:00Z'
//   },
//   {
//     id: '7',
//     user_id: '10',
//     start_date: '2024-07-01',
//     end_date: '2024-07-07',
//     new_clients: 2,
//     paid_shoots: 3,
//     free_shoots: 1,
//     unique_clients: 4,
//     aov: 350,
//     revenue: 1050,
//     expenses: 150,
//     editing_cost: 75,
//     net_profit: 825,
//     status: 'submitted',
//     created_at: '2024-07-07T14:00:00Z',
//     updated_at: '2024-07-07T14:00:00Z'
//   },
//   // Additional historical data for highest revenue tracking
//   {
//     id: '4',
//     user_id: '1',
//     start_date: '2024-05-27',
//     end_date: '2024-06-02',
//     new_clients: 5,
//     paid_shoots: 8,
//     free_shoots: 1,
//     unique_clients: 9,
//     aov: 520,
//     revenue: 4160,
//     expenses: 450,
//     editing_cost: 240,
//     net_profit: 3470,
//     status: 'submitted',
//     created_at: '2024-06-02T10:00:00Z',
//     updated_at: '2024-06-02T10:00:00Z'
//   },
//   {
//     id: '5',
//     user_id: '4',
//     start_date: '2024-06-03',
//     end_date: '2024-06-09',
//     new_clients: 3,
//     paid_shoots: 6,
//     free_shoots: 2,
//     unique_clients: 7,
//     aov: 550,
//     revenue: 3300,
//     expenses: 300,
//     editing_cost: 180,
//     net_profit: 2820,
//     status: 'submitted',
//     created_at: '2024-06-09T11:00:00Z',
//     updated_at: '2024-06-09T11:00:00Z'
//   }
// ];

let mockWeeklyReports: WeeklyReport[] = []

// Commented out - migrated to 8base
// let mockGoals: Goal[] = [
//   {
//     id: '1',
//     user_id: '1',
//     month_start: '2024-07-01',
//     low_goal_shoots: 15,
//     success_goal_shoots: 25,
//     actual_shoots: 12,
//     low_goal_revenue: 6000,
//     success_goal_revenue: 10000,
//     actual_revenue: 5400,
//     aov: 450,
//     status: 'active',
//     created_at: '2024-07-01T00:00:00Z',
//     updated_at: '2024-07-01T00:00:00Z'
//   },
//   {
//     id: '2',
//     user_id: '4',
//     month_start: '2024-07-01',
//     low_goal_shoots: 12,
//     success_goal_shoots: 20,
//     actual_shoots: 8,
//     low_goal_revenue: 5000,
//     success_goal_revenue: 8000,
//     actual_revenue: 4000,
//     aov: 500,
//     status: 'active',
//     created_at: '2024-07-01T00:00:00Z',
//     updated_at: '2024-07-01T00:00:00Z'
//   },
//   {
//     id: '3',
//     user_id: '7',
//     month_start: '2024-07-01',
//     low_goal_shoots: 5,
//     success_goal_shoots: 10,
//     actual_shoots: 3,
//     low_goal_revenue: 1500,
//     success_goal_revenue: 3000,
//     actual_revenue: 900,
//     aov: 300,
//     status: 'active',
//     created_at: '2024-07-01T00:00:00Z',
//     updated_at: '2024-07-01T00:00:00Z'
//   },
//   {
//     id: '4',
//     user_id: '10',
//     month_start: '2024-07-01',
//     low_goal_shoots: 8,
//     success_goal_shoots: 15,
//     actual_shoots: 6,
//     low_goal_revenue: 2400,
//     success_goal_revenue: 5000,
//     actual_revenue: 2100,
//     aov: 350,
//     status: 'active',
//     created_at: '2024-07-01T00:00:00Z',
//     updated_at: '2024-07-01T00:00:00Z'
//   }
// ];

let mockPricing: Pricing[] = [
  {
    id: '1',
    user_id: '1',
    service_name: 'Real Estate Photography',
    your_price: 450,
    competitor_price: 400,
    estimated_cost: 100,
    estimated_profit: 350,
    status: 'active',
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z'
  }
];

let mockNotes: Note[] = [
  {
    id: '1',
    target_type: 'student',
    target_id: '1',
    user_id: '1',
    content: 'John is making excellent progress with his pricing strategy. He\'s gained confidence in charging premium rates.',
    visibility: 'public',
    created_at: '2024-06-25T15:00:00Z',
    created_by: '2',
    created_by_name: 'Sarah Coach'
  },
  {
    id: '2',
    target_type: 'call',
    target_id: '1',
    user_id: '1',
    content: 'Student seemed a bit overwhelmed with lead generation tactics. Need to break it down into smaller steps.',
    visibility: 'private',
    created_at: '2024-06-25T15:30:00Z',
    created_by: '2',
    created_by_name: 'Sarah Coach'
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // Users Management (existing methods)
  async getUsers(): Promise<User[]> {
    await delay(300);
    return mockUsers;
  },

  async createUser(user: Omit<User, 'id' | 'created_at'>): Promise<User> {
    await delay(300);
    const newUser: User = {
      ...user,
      id: (mockUsers.length + 1).toString(),
      created_at: new Date().toISOString()
    };
    mockUsers.push(newUser);
    return newUser;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    await delay(300);
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    
    mockUsers[index] = { ...mockUsers[index], ...updates };
    return mockUsers[index];
  },

  async updateCoachingTermDates(userId: string, startDate: string, endDate: string): Promise<User> {
    await delay(300);
    const index = mockUsers.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('User not found');
    
    mockUsers[index] = { 
      ...mockUsers[index], 
      coaching_term_start: startDate,
      coaching_term_end: endDate
    };
    return mockUsers[index];
  },

  async assignStudentToCoach(studentId: string, coachId: string | null): Promise<User> {
    await delay(300);
    const studentIndex = mockUsers.findIndex(u => u.id === studentId);
    if (studentIndex === -1) throw new Error('Student not found');
    
    mockUsers[studentIndex] = { 
      ...mockUsers[studentIndex], 
      assigned_admin_id: coachId 
    };
    return mockUsers[studentIndex];
  },

  // Student Profiles (existing methods)
  async getStudentProfile(userId: string): Promise<StudentProfile | null> {
    await delay(300);
    return mockStudentProfiles.find(p => p.user_id === userId) || null;
  },

  async updateStudentProfile(userId: string, updates: Partial<StudentProfile>): Promise<StudentProfile> {
    await delay(300);
    const index = mockStudentProfiles.findIndex(p => p.user_id === userId);
    
    if (index === -1) {
      // Create new profile
      const newProfile: StudentProfile = {
        id: Date.now().toString(),
        user_id: userId,
        business_name: '',
        location: '',
        target_market: '',
        strengths: '',
        challenges: '',
        goals: '',
        preferred_contact_method: '',
        availability: '',
        notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...updates
      };
      mockStudentProfiles.push(newProfile);
      return newProfile;
    } else {
      mockStudentProfiles[index] = {
        ...mockStudentProfiles[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      return mockStudentProfiles[index];
    }
  },

  // Call Logs (existing methods)
  async getCallLogs(studentId?: string, coachId?: string): Promise<CallLog[]> {
    await delay(300);
    let filtered = mockCallLogs;
    
    if (studentId) {
      filtered = filtered.filter(c => c.student_id === studentId);
    }
    if (coachId) {
      filtered = filtered.filter(c => c.coach_id === coachId);
    }
    
    return filtered.sort((a, b) => new Date(b.call_date).getTime() - new Date(a.call_date).getTime());
  },

  async createCallLog(callLog: Omit<CallLog, 'id' | 'created_at' | 'updated_at'>): Promise<CallLog> {
    await delay(300);
    const newCallLog: CallLog = {
      ...callLog,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockCallLogs.push(newCallLog);
    return newCallLog;
  },

  // Enhanced Notes (existing methods)
  async getNotes(targetType: string, targetId: string, userRole?: string): Promise<Note[]> {
    await delay(300);
    let filtered = mockNotes.filter(n => n.target_type === targetType && n.target_id === targetId);
    
    // Filter private notes for non-coaches and non-super-admins
    if (userRole && userRole === 'user') {
      filtered = filtered.filter(n => n.visibility === 'public');
    }
    
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async createNote(note: Omit<Note, 'id' | 'created_at'>): Promise<Note> {
    await delay(300);
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    mockNotes.push(newNote);
    return newNote;
  },

  // Student Performance Analytics (existing methods)
  async getStudentHighestRevenue(userId: string): Promise<number> {
    await delay(300);
    const userReports = mockWeeklyReports.filter(r => r.user_id === userId);
    return userReports.length > 0 ? Math.max(...userReports.map(r => r.revenue)) : 0;
  },

  async getAllStudentsWithMetrics(): Promise<Array<User & { highestRevenue: number; totalReports: number; isActive: boolean }>> {
    await delay(300);
    const students = mockUsers.filter(u => u.role === 'user');
    
    return students.map(student => {
      const reports = mockWeeklyReports.filter(r => r.user_id === student.id);
      const highestRevenue = reports.length > 0 ? Math.max(...reports.map(r => r.revenue)) : 0;
      const lastReportDate = reports.length > 0 
        ? Math.max(...reports.map(r => new Date(r.created_at).getTime()))
        : 0;
      
      // Consider active if they've submitted a report in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const isActive = lastReportDate > thirtyDaysAgo.getTime();
      
      return {
        ...student,
        highestRevenue,
        totalReports: reports.length,
        isActive
      };
    });
  },

  // Weekly Reports (existing methods)
  async getWeeklyReports(userId?: string): Promise<WeeklyReport[]> {
    await delay(300);
    return userId ? mockWeeklyReports.filter(r => r.user_id === userId) : mockWeeklyReports;
  },

  async getWeeklyReportsByCoach(coachId: string): Promise<WeeklyReport[]> {
    await delay(300);
    const coachStudents = mockUsers.filter(u => u.assigned_admin_id === coachId);
    const studentIds = coachStudents.map(s => s.id);
    return mockWeeklyReports.filter(r => studentIds.includes(r.user_id));
  },

  async createWeeklyReport(report: Omit<WeeklyReport, 'id' | 'created_at' | 'updated_at'>): Promise<WeeklyReport> {
    await delay(300);
    const newReport: WeeklyReport = {
      ...report,
      id: Date.now().toString(),
      net_profit: report.revenue - report.expenses - report.editing_cost,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockWeeklyReports.push(newReport);
    return newReport;
  },

  async updateWeeklyReport(id: string, updates: Partial<WeeklyReport>): Promise<WeeklyReport> {
    await delay(300);
    const index = mockWeeklyReports.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Report not found');
    
    mockWeeklyReports[index] = {
      ...mockWeeklyReports[index],
      ...updates,
      net_profit: (updates.revenue || mockWeeklyReports[index].revenue) - 
                 (updates.expenses || mockWeeklyReports[index].expenses) - 
                 (updates.editing_cost || mockWeeklyReports[index].editing_cost),
      updated_at: new Date().toISOString()
    };
    return mockWeeklyReports[index];
  },

  // Goals (existing methods) - Return empty arrays for now since migrated to 8base
  async getGoals(userId?: string): Promise<Goal[]> {
    await delay(300);
    return [];
  },

  async getGoalsByCoach(coachId: string): Promise<Goal[]> {
    await delay(300);
    return [];
  },

  async createGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal> {
    await delay(300);
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return newGoal;
  },

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
    await delay(300);
    throw new Error('Goals migrated to 8base - use eightbaseService instead');
  },

  // Pricing (existing methods)
  async getPricing(userId?: string): Promise<Pricing[]> {
    await delay(300);
    return userId ? mockPricing.filter(p => p.user_id === userId) : mockPricing;
  },

  async createPricing(pricing: Omit<Pricing, 'id' | 'created_at' | 'updated_at'>): Promise<Pricing> {
    await delay(300);
    const newPricing: Pricing = {
      ...pricing,
      id: Date.now().toString(),
      estimated_profit: pricing.your_price - pricing.estimated_cost,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockPricing.push(newPricing);
    return newPricing;
  },

  async updatePricing(id: string, updates: Partial<Pricing>): Promise<Pricing> {
    await delay(300);
    const index = mockPricing.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Pricing not found');
    
    mockPricing[index] = {
      ...mockPricing[index],
      ...updates,
      estimated_profit: (updates.your_price || mockPricing[index].your_price) - 
                       (updates.estimated_cost || mockPricing[index].estimated_cost),
      updated_at: new Date().toISOString()
    };
    return mockPricing[index];
  },

  // Enhanced Leads with engagement tracking (existing methods)
  async getLeads(userId?: string): Promise<Lead[]> {
    await delay(300);
    return userId ? mockLeads.filter(l => l.user_id === userId) : mockLeads;
  },

  async getLeadsByCoach(coachId: string): Promise<Lead[]> {
    await delay(300);
    const coachStudents = mockUsers.filter(u => u.assigned_admin_id === coachId);
    const studentIds = coachStudents.map(s => s.id);
    return mockLeads.filter(l => studentIds.includes(l.user_id));
  },

  async createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> {
    await delay(300);
    const newLead: Lead = {
      ...lead,
      id: Date.now().toString(),
      engagement_tags: lead.engagement_tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockLeads.push(newLead);
    return newLead;
  },

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    await delay(300);
    const index = mockLeads.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Lead not found');
    
    mockLeads[index] = {
      ...mockLeads[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return mockLeads[index];
  },

  // New method for updating engagement tags (existing methods)
  async addEngagementTag(leadId: string, tag: EngagementTag): Promise<Lead> {
    await delay(300);
    const index = mockLeads.findIndex(l => l.id === leadId);
    if (index === -1) throw new Error('Lead not found');
    
    // Remove existing tag of same type if it exists
    const existingTags = mockLeads[index].engagement_tags.filter(t => t.type !== tag.type);
    existingTags.push(tag);
    
    mockLeads[index] = {
      ...mockLeads[index],
      engagement_tags: existingTags,
      updated_at: new Date().toISOString()
    };
    return mockLeads[index];
  },

  async removeEngagementTag(leadId: string, tagType: string): Promise<Lead> {
    await delay(300);
    const index = mockLeads.findIndex(l => l.id === leadId);
    if (index === -1) throw new Error('Lead not found');
    
    mockLeads[index] = {
      ...mockLeads[index],
      engagement_tags: mockLeads[index].engagement_tags.filter(t => t.type !== tagType),
      updated_at: new Date().toISOString()
    };
    return mockLeads[index];
  },

  // Enhanced Message Templates with random generation (existing methods)
  async getMessageTemplates(): Promise<MessageTemplate[]> {
    await delay(300);
    return mockMessageTemplates.filter(t => t.is_active);
  },

  async getTemplatesByType(type: MessageTemplateType): Promise<MessageTemplate[]> {
    await delay(300);
    return mockMessageTemplates.filter(t => t.type === type && t.is_active);
  },

  async updateMessageTemplate(id: string, updates: Partial<MessageTemplate>): Promise<MessageTemplate> {
    await delay(300);
    const index = mockMessageTemplates.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Template not found');
    
    mockMessageTemplates[index] = {
      ...mockMessageTemplates[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return mockMessageTemplates[index];
  },

  // Random script generation (existing methods)
  async generateRandomScript(): Promise<{intro: string, hook: string, body1: string, body2: string, ending: string}> {
    await delay(100);
    
    const getRandomTemplate = (type: MessageTemplateType): string => {
      const templates = mockMessageTemplates.filter(t => t.type === type && t.is_active);
      if (templates.length === 0) return '';
      const randomIndex = Math.floor(Math.random() * templates.length);
      return templates[randomIndex].content;
    };

    return {
      intro: getRandomTemplate('intro'),
      hook: getRandomTemplate('hook'),
      body1: getRandomTemplate('body1'),
      body2: getRandomTemplate('body2'),
      ending: getRandomTemplate('ending')
    };
  },

  // Profit Margin Calculator API methods (existing methods)
  
  // Global Variables
  async getGlobalVariables(userId: string): Promise<GlobalVariables | null> {
    await delay(300);
    return mockGlobalVariables.find(g => g.user_id === userId) || null;
  },

  async updateGlobalVariables(userId: string, updates: Partial<Omit<GlobalVariables, 'id' | 'user_id' | 'created_at'>>): Promise<GlobalVariables> {
    await delay(300);
    const index = mockGlobalVariables.findIndex(g => g.user_id === userId);
    
    if (index === -1) {
      // Create new global variables
      const newGlobalVars: GlobalVariables = {
        id: Date.now().toString(),
        user_id: userId,
        hourly_pay: 50,
        cost_per_photo: 1.25,
        target_profit_margin: 40,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...updates
      };
      mockGlobalVariables.push(newGlobalVars);
      return newGlobalVars;
    } else {
      mockGlobalVariables[index] = {
        ...mockGlobalVariables[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      return mockGlobalVariables[index];
    }
  },

  // Products (existing methods)
  async getProducts(userId: string): Promise<Product[]> {
    await delay(300);
    return mockProducts.filter(p => p.user_id === userId);
  },

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    await delay(300);
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockProducts.push(newProduct);
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    await delay(300);
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    
    mockProducts[index] = {
      ...mockProducts[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return mockProducts[index];
  },

  async deleteProduct(id: string): Promise<void> {
    await delay(300);
    const productIndex = mockProducts.findIndex(p => p.id === id);
    if (productIndex === -1) throw new Error('Product not found');
    
    // Delete product and all its subitems
    mockProducts.splice(productIndex, 1);
    mockSubitems = mockSubitems.filter(s => s.product_id !== id);
  },

  // Subitems (existing methods)
  async getSubitems(productId: string): Promise<Subitem[]> {
    await delay(300);
    return mockSubitems.filter(s => s.product_id === productId);
  },

  async createSubitem(subitem: Omit<Subitem, 'id' | 'created_at' | 'updated_at'>): Promise<Subitem> {
    await delay(300);
    const newSubitem: Subitem = {
      ...subitem,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockSubitems.push(newSubitem);
    return newSubitem;
  },

  async updateSubitem(id: string, updates: Partial<Subitem>): Promise<Subitem> {
    await delay(300);
    const index = mockSubitems.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Subitem not found');
    
    mockSubitems[index] = {
      ...mockSubitems[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return mockSubitems[index];
  },

  async deleteSubitem(id: string): Promise<void> {
    await delay(300);
    const index = mockSubitems.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Subitem not found');
    
    mockSubitems.splice(index, 1);
  },

  // NEW KPI METHODS

  // Time Frame Utilities
  createTimeFrameFilter,

  // Student KPI Data
  async getStudentKPIData(studentId: string, timeFrame: TimeFrameFilter): Promise<StudentKPIData> {
    await delay(300);
    
    const student = mockUsers.find(u => u.id === studentId && u.role === 'user');
    if (!student) throw new Error('Student not found');
    
    const coach = student.assigned_admin_id ? mockUsers.find(u => u.id === student.assigned_admin_id) : null;
    const leads = mockLeads.filter(l => l.user_id === studentId);
    const calls = mockCallLogs.filter(c => c.student_id === studentId);
    
    // Filter data within time frame
    const leadsInPeriod = leads.filter(l => isWithinTimeFrame(l.created_at, timeFrame));
    const callsInPeriod = calls.filter(c => isWithinTimeFrame(c.created_at, timeFrame));
    
    // Calculate lead metrics
    const leadsBySource = leadsInPeriod.reduce((acc, lead) => {
      acc[lead.lead_source] = (acc[lead.lead_source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const leadsByStatus = leadsInPeriod.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate DM metrics
    const totalDMsSent = leadsInPeriod.reduce((count, lead) => {
      return count + lead.engagement_tags.filter(tag => 
        tag.type === 'dm_sent' && isWithinTimeFrame(tag.completed_date, timeFrame)
      ).length;
    }, 0);
    
    const followUpDMsSent = leadsInPeriod.reduce((count, lead) => {
      return count + lead.engagement_tags.filter(tag => 
        tag.type === 'follow_up_dm_sent' && isWithinTimeFrame(tag.completed_date, timeFrame)
      ).length;
    }, 0);
    
    const initialDMsSent = totalDMsSent - followUpDMsSent;
    
    // Calculate call metrics
    const initialCalls = callsInPeriod.filter(c => c.call_type === 'scheduled').length;
    const followUpCalls = callsInPeriod.filter(c => c.call_type === 'follow_up').length;
    
    // Calculate conversion and engagement rates
    const convertedLeads = leadsInPeriod.filter(l => l.status === 'converted').length;
    const conversionRate = leadsInPeriod.length > 0 ? (convertedLeads / leadsInPeriod.length) * 100 : 0;
    
    const completedEngagements = leadsInPeriod.filter(lead => {
      const requiredTags: string[] = ['follow_day_engagement', 'engagement_day_1', 'dm_sent'];
      return requiredTags.every(reqTag => 
        lead.engagement_tags.some(tag => tag.type === reqTag)
      );
    }).length;
    const engagementCompletionRate = leadsInPeriod.length > 0 ? (completedEngagements / leadsInPeriod.length) * 100 : 0;
    
    // Calculate time metrics
    const avgTimeToFirstContact = leadsInPeriod.reduce((sum, lead) => {
      const firstContact = lead.engagement_tags.find(tag => tag.type === 'dm_sent' || tag.type === 'initial_call_done');
      if (firstContact) {
        const daysDiff = Math.floor((new Date(firstContact.completed_date).getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24));
        return sum + daysDiff;
      }
      return sum;
    }, 0);
    const avgTimeToFirstContactDays = leadsInPeriod.length > 0 ? avgTimeToFirstContact / leadsInPeriod.length : 0;
    
    const avgTimeToConversion = convertedLeads > 0 ? leadsInPeriod
      .filter(l => l.status === 'converted')
      .reduce((sum, lead) => {
        const daysDiff = Math.floor((new Date(lead.updated_at).getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24));
        return sum + daysDiff;
      }, 0) / convertedLeads : 0;
    
    // Determine activity trend (simplified)
    const recentActivity = leads.filter(l => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return new Date(l.updated_at) > sevenDaysAgo;
    }).length;
    
    const olderActivity = leads.filter(l => {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const leadDate = new Date(l.updated_at);
      return leadDate > fourteenDaysAgo && leadDate <= sevenDaysAgo;
    }).length;
    
    let activityTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentActivity > olderActivity) activityTrend = 'increasing';
    else if (recentActivity < olderActivity) activityTrend = 'decreasing';
    
    // Last activity date
    const allActivities = [
      ...leads.map(l => l.updated_at),
      ...calls.map(c => c.created_at)
    ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    return {
      student_id: studentId,
      student_name: student.name,
      student_email: student.email,
      assigned_coach_id: student.assigned_admin_id,
      coach_name: coach?.name || null,
      is_paid_user: student.has_paid,
      
      // Lead Generation KPIs
      total_leads: leads.length,
      new_leads: leadsInPeriod.length,
      leads_by_source: leadsBySource,
      leads_by_status: leadsByStatus,
      
      // Outreach KPIs
      total_dms_sent: totalDMsSent,
      initial_dms_sent: initialDMsSent,
      follow_up_dms_sent: followUpDMsSent,
      
      // Call Activity KPIs
      total_calls_made: callsInPeriod.length,
      initial_calls_made: initialCalls,
      follow_up_calls_made: followUpCalls,
      
      // Engagement KPIs
      engagement_completion_rate: engagementCompletionRate,
      conversion_rate: conversionRate,
      
      // Time-based metrics
      avg_time_to_first_contact: avgTimeToFirstContactDays,
      avg_time_to_conversion: avgTimeToConversion,
      
      // Activity trends
      activity_trend: activityTrend,
      last_activity_date: allActivities.length > 0 ? allActivities[0] : null,
      
      // Time frame info
      time_frame: timeFrame
    };
  },

  // Coach KPI Summary
  async getCoachKPISummary(coachId: string, timeFrame: TimeFrameFilter): Promise<CoachKPISummary> {
    await delay(300);
    
    const coach = mockUsers.find(u => u.id === coachId && (u.role === 'coach' || u.role === 'coach_manager'));
    if (!coach) throw new Error('Coach not found');
    
    const students = mockUsers.filter(u => u.assigned_admin_id === coachId);
    const studentIds = students.map(s => s.id);
    
    const allLeads = mockLeads.filter(l => studentIds.includes(l.user_id));
    const allCalls = mockCallLogs.filter(c => c.coach_id === coachId);
    
    // Filter data within time frame
    const leadsInPeriod = allLeads.filter(l => isWithinTimeFrame(l.created_at, timeFrame));
    const callsInPeriod = allCalls.filter(c => isWithinTimeFrame(c.created_at, timeFrame));
    
    // Calculate metrics
    const activeStudents = students.filter(student => {
      const studentLeads = leadsInPeriod.filter(l => l.user_id === student.id);
      const studentCalls = callsInPeriod.filter(c => c.student_id === student.id);
      return studentLeads.length > 0 || studentCalls.length > 0;
    }).length;
    
    const paidStudents = students.filter(s => s.has_paid).length;
    const freeStudents = students.length - paidStudents;
    
    const totalDMsSent = leadsInPeriod.reduce((count, lead) => {
      return count + lead.engagement_tags.filter(tag => 
        (tag.type === 'dm_sent' || tag.type === 'follow_up_dm_sent') && 
        isWithinTimeFrame(tag.completed_date, timeFrame)
      ).length;
    }, 0);
    
    // Calculate average conversion rate across students
    const studentConversionRates = students.map(student => {
      const studentLeads = leadsInPeriod.filter(l => l.user_id === student.id);
      if (studentLeads.length === 0) return 0;
      const converted = studentLeads.filter(l => l.status === 'converted').length;
      return (converted / studentLeads.length) * 100;
    });
    const avgConversionRate = studentConversionRates.length > 0 
      ? studentConversionRates.reduce((sum, rate) => sum + rate, 0) / studentConversionRates.length 
      : 0;
    
    // Calculate average engagement completion rate
    const studentEngagementRates = students.map(student => {
      const studentLeads = leadsInPeriod.filter(l => l.user_id === student.id);
      if (studentLeads.length === 0) return 0;
      const completedEngagements = studentLeads.filter(lead => {
        const requiredTags: string[] = ['follow_day_engagement', 'engagement_day_1', 'dm_sent'];
        return requiredTags.every(reqTag => 
          lead.engagement_tags.some(tag => tag.type === reqTag)
        );
      }).length;
      return (completedEngagements / studentLeads.length) * 100;
    });
    const avgEngagementRate = studentEngagementRates.length > 0 
      ? studentEngagementRates.reduce((sum, rate) => sum + rate, 0) / studentEngagementRates.length 
      : 0;
    
    // Students above benchmarks (simplified - using conversion rate as example)
    const studentsAboveBenchmarks = studentConversionRates.filter(rate => rate >= defaultBenchmarks.monthly_conversion_rate).length;
    
    // Students needing attention (no activity in 7+ days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const studentsNeedingAttention = students.filter(student => {
      const studentLeads = allLeads.filter(l => l.user_id === student.id);
      const studentCalls = allCalls.filter(c => c.student_id === student.id);
      const lastActivity = [
        ...studentLeads.map(l => l.updated_at),
        ...studentCalls.map(c => c.created_at)
      ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
      
      return !lastActivity || new Date(lastActivity) <= sevenDaysAgo;
    }).length;
    
    return {
      coach_id: coachId,
      coach_name: coach.name,
      total_students: students.length,
      active_students: activeStudents,
      paid_students: paidStudents,
      free_students: freeStudents,
      
      // Aggregate student performance
      total_leads_generated: leadsInPeriod.length,
      total_dms_sent: totalDMsSent,
      total_calls_made: callsInPeriod.length,
      
      // Coach effectiveness metrics
      avg_student_conversion_rate: avgConversionRate,
      avg_student_engagement_rate: avgEngagementRate,
      students_above_benchmarks: studentsAboveBenchmarks,
      
      // Recent activity
      recent_calls_logged: callsInPeriod.length,
      students_needing_attention: studentsNeedingAttention,
      
      time_frame: timeFrame
    };
  },

  // Multiple Student KPIs (for admin dashboards)
  async getMultipleStudentKPIs(studentIds: string[], timeFrame: TimeFrameFilter): Promise<StudentKPIData[]> {
    await delay(300);
    const kpis = await Promise.all(
      studentIds.map(id => this.getStudentKPIData(id, timeFrame))
    );
    return kpis;
  },

  // Student Activity Summary (simplified overview for dashboards)
  async getStudentActivitySummary(studentIds: string[], timeFrame: TimeFrameFilter): Promise<StudentActivitySummary[]> {
    await delay(300);
    
    const summaries = await Promise.all(studentIds.map(async (studentId) => {
      const student = mockUsers.find(u => u.id === studentId);
      if (!student) throw new Error(`Student ${studentId} not found`);
      
      const leads = mockLeads.filter(l => l.user_id === studentId);
      const calls = mockCallLogs.filter(c => c.student_id === studentId);
      
      const recentLeads = leads.filter(l => isWithinTimeFrame(l.created_at, timeFrame)).length;
      const recentDMs = leads.reduce((count, lead) => {
        return count + lead.engagement_tags.filter(tag => 
          (tag.type === 'dm_sent' || tag.type === 'follow_up_dm_sent') && 
          isWithinTimeFrame(tag.completed_date, timeFrame)
        ).length;
      }, 0);
      const recentCalls = calls.filter(c => isWithinTimeFrame(c.created_at, timeFrame)).length;
      
      // Last activity
      const allActivities = [
        ...leads.map(l => l.updated_at),
        ...calls.map(c => c.created_at)
      ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      const lastActivity = allActivities.length > 0 ? allActivities[0] : null;
      
      // Performance score (0-100 based on benchmarks)
      let score = 0;
      const timeFrameDays = Math.floor((new Date(timeFrame.endDate).getTime() - new Date(timeFrame.startDate).getTime()) / (1000 * 60 * 60 * 24));
      const weeklyMultiplier = timeFrameDays / 7;
      const monthlyMultiplier = timeFrameDays / 30;
      
      // Score based on leads (40% weight)
      const expectedLeads = timeFrameDays <= 7 ? defaultBenchmarks.weekly_new_leads : defaultBenchmarks.monthly_new_leads * monthlyMultiplier;
      score += Math.min((recentLeads / expectedLeads) * 40, 40);
      
      // Score based on DMs (30% weight)
      const expectedDMs = timeFrameDays <= 7 ? defaultBenchmarks.weekly_dms_sent : defaultBenchmarks.monthly_dms_sent * monthlyMultiplier;
      score += Math.min((recentDMs / expectedDMs) * 30, 30);
      
      // Score based on calls (30% weight)
      const expectedCalls = timeFrameDays <= 7 ? defaultBenchmarks.weekly_calls_made : defaultBenchmarks.monthly_calls_made * monthlyMultiplier;
      score += Math.min((recentCalls / expectedCalls) * 30, 30);
      
      // Determine status
      let status: 'excellent' | 'good' | 'needs_attention' | 'inactive';
      if (score >= 80) status = 'excellent';
      else if (score >= 60) status = 'good';
      else if (lastActivity && new Date(lastActivity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) status = 'needs_attention';
      else status = 'inactive';
      
      // Generate alerts
      const alerts: string[] = [];
      if (recentLeads < expectedLeads * 0.5) alerts.push('Low lead generation');
      if (recentDMs < expectedDMs * 0.5) alerts.push('Behind on outreach');
      if (recentCalls < expectedCalls * 0.5) alerts.push('Few coaching calls');
      if (!lastActivity || new Date(lastActivity) <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        alerts.push('No recent activity');
      }
      
      return {
        student,
        recent_leads: recentLeads,
        recent_dms: recentDMs,
        recent_calls: recentCalls,
        last_activity: lastActivity,
        performance_score: Math.round(score),
        status,
        alerts
      };
    }));
    
    return summaries;
  },

  // KPI Chart Data for visualizations
  async getKPIChartData(studentIds: string[], timeFrame: TimeFrameFilter): Promise<KPIChartData[]> {
    await delay(300);
    
    const startDate = new Date(timeFrame.startDate);
    const endDate = new Date(timeFrame.endDate);
    const data: KPIChartData[] = [];
    
    // Generate daily data points
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      
      const dayLeads = mockLeads.filter(l => 
        studentIds.includes(l.user_id) && 
        l.created_at.startsWith(dateStr)
      ).length;
      
      const dayDMs = mockLeads
        .filter(l => studentIds.includes(l.user_id))
        .reduce((count, lead) => {
          return count + lead.engagement_tags.filter(tag => 
            (tag.type === 'dm_sent' || tag.type === 'follow_up_dm_sent') && 
            tag.completed_date.startsWith(dateStr)
          ).length;
        }, 0);
      
      const dayCalls = mockCallLogs.filter(c => 
        studentIds.includes(c.student_id) && 
        c.created_at.startsWith(dateStr)
      ).length;
      
      const dayConversions = mockLeads.filter(l => 
        studentIds.includes(l.user_id) && 
        l.status === 'converted' && 
        l.updated_at.startsWith(dateStr)
      ).length;
      
      data.push({
        date: dateStr,
        leads: dayLeads,
        dms: dayDMs,
        calls: dayCalls,
        conversions: dayConversions
      });
    }
    
    return data;
  },

  // Get KPI Benchmarks
  async getKPIBenchmarks(): Promise<KPIBenchmarks> {
    await delay(100);
    return defaultBenchmarks;
  },

  // Update KPI Benchmarks (for super admin)
  async updateKPIBenchmarks(updates: Partial<KPIBenchmarks>): Promise<KPIBenchmarks> {
    await delay(300);
    Object.assign(defaultBenchmarks, updates);
    return defaultBenchmarks;
  }
};