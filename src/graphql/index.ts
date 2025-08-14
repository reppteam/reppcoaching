// GraphQL Queries and Mutations for 8base
// Updated to match actual 8base schema naming conventions

// ========================================
// CURRENT USER QUERY (for Auth0Context)
// ========================================

export const CURRENT_USER_QUERY = `
  query GetCurrentUser {
    user {
      id
      email
      status
      origin
      is8baseUser
      firstName
      lastName
      timezone
      avatar {
        downloadUrl
      }
      role
      assignedAdminId
      accessStart
      accessEnd
      hasPaid
      isActive
      coachingTermStart
      coachingTermEnd
      createdAt
      updatedAt
      roles {
        items {
          id
          name
        }
      }
      student {
        id
        phone
        businessName
        location
        targetMarket
        strengths
        challenges
        goals
        preferredContactMethod
        availability
        notes
      }
      coach {
        id
        isActive
      }
    }
  }
`;

// ========================================
// USER QUERIES AND MUTATIONS
// ========================================

export const GET_USERS = `
  query GetUsers {
    usersList {
      items {
        id
        email
        status
        origin
        is8base
        firstName
        lastName
        timezone
        avatar {
          downloadUrl
        }
        roles {
          items {
            id
            name
          }
        }
        assignedCoach {
          id
          fullName
          email
        }
        createdAt
        updatedAt
        student {
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
        }
        coach {
          id
        }
      }
    }
  }
`;

export const GET_USER_BY_FILTER = `
  query GetUserByFilter($filter: UserFilter) {
    usersList(filter: $filter) {
      items {
        id
        email
        status
        origin
        is8base
        firstName
        lastName
        timezone
        avatar {
          downloadUrl
        }
        roles {
          items {
            id
            name
          }
        }
        assignedCoach {
          id
          fullName
          email
        }
        createdAt
        updatedAt
        student {
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
        }
        coach {
          id
        }
      }
    }
  }
`;

export const CREATE_USER = `
  mutation CreateUser($data: UserCreateInput!) {
    userCreate(data: $data) {
      id
      email
      firstName
      lastName
      createdAt
    }
  }
`;

export const UPDATE_USER = `
  mutation UpdateUser($id: ID!, $data: UserUpdateInput!) {
    userUpdate(id: $id, data: $data) {
      id
      email
      firstName
      lastName
      updatedAt
    }
  }
`;

export const DELETE_USER = `
  mutation DeleteUser($id: ID!) {
    userDestroy(id: $id) {
      id
    }
  }
`;

export const ASSIGN_STUDENT_TO_COACH = `
  mutation AssignStudentToCoach($id: ID!, $assignedCoachId: String) {
    userUpdate(id: $id, data: { assignedCoach: { connect: { id: $assignedCoachId } } }) {
      id
      assignedCoach {
        id
        fullName
        email
      }
      updatedAt
    }
  }
`;

// This mutation is disabled because coachingTermStart and coachingTermEnd fields don't exist in the current 8base schema
// export const UPDATE_COACHING_TERM_DATES = `
//   mutation UpdateCoachingTermDates($id: ID!, $coachingTermStart: Date!, $coachingTermEnd: Date!) {
//     userUpdate(id: $id, data: { 
//       coachingTermStart: $coachingTermStart, 
//       coachingTermEnd: $coachingTermEnd 
//     }) {
//       id
//       coachingTermStart
//       coachingTermEnd
//       updatedAt
//     }
//   }
// `;

// ========================================
// STUDENT PROFILE QUERIES AND MUTATIONS
// ========================================

export const GET_STUDENT_PROFILE_BY_FILTER = `
  query GetStudentProfileByFilter($filter: StudentFilter) {
    studentsList(filter: $filter) {
      items {
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
        createdAt
        updatedAt
        student {
          id
          email
          firstName
          lastName
        }
      }
    }
  }
`;

export const UPDATE_STUDENT_PROFILE = `
  mutation UpdateStudentProfile($id: ID!, $data: StudentUpdateInput!) {
    studentProfileUpdate(id: $id, data: $data) {
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
      updatedAt
    }
  }
`;

export const CREATE_STUDENT_PROFILE = `
  mutation CreateStudentProfile($data: StudentCreateInput!) {
    studentProfileCreate(data: $data) {
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
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_STUDENT_PROFILE = `
  mutation DeleteStudentProfile($id: ID!) {
    studentProfileDestroy(id: $id) {
      id
    }
  }
`;

// ========================================
// WEEKLY REPORT QUERIES AND MUTATIONS
// ========================================

export const GET_WEEKLY_REPORTS_BY_FILTER = `
  query GetWeeklyReportsByFilter($filter: WeeklyReportFilter) {
    weeklyReportsList(filter: $filter) {
      items {
        id
        start_date
        end_date
        new_clients
        paid_shoots
        free_shoots
        unique_clients
        aov
        revenue
        expenses
        editing_cost
        net_profit
        status
        createdAt
        updatedAt
        student {
          id
        }
      }
    }
  }
`;

export const CREATE_WEEKLY_REPORT = `
  mutation CreateWeeklyReport($data: WeeklyReportCreateInput!) {
    weeklyReportCreate(data: $data) {
      id
      start_date
      end_date
      new_clients
      paid_shoots
      free_shoots
      unique_clients
      aov
      revenue
      expenses
      editing_cost
      net_profit
      status
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_WEEKLY_REPORT = `
  mutation UpdateWeeklyReport($filter: WeeklyReportFilter!, $data: WeeklyReportUpdateByFilterInput!) {
    weeklyReportUpdateByFilter(filter: $filter, data: $data) {
      items {
        id
        start_date
        end_date
        new_clients
        paid_shoots
        free_shoots
        unique_clients
        aov
        revenue
        expenses
        editing_cost
        net_profit
        status
        updatedAt
      }
    }
  }
`;

export const DELETE_WEEKLY_REPORT = `
  mutation DeleteWeeklyReport($id: ID!) {
    weeklyReportDestroy(id: $id) {
      id
    }
  }
`;

// ========================================
// GOAL QUERIES AND MUTATIONS
// ========================================

export const GET_GOALS_BY_FILTER = `
  query GetGoalsByFilter($filter: GoalFilter) {
    goalsList(filter: $filter) {
      items {
    id
        month_start
        low_goal_shoots
        success_goal_shoots
        actual_shoots
        low_goal_revenue
        success_goal_revenue
        actual_revenue
        aov
    status
        createdAt
        updatedAt
        student {
          id
        }
      }
    }
  }
`;

export const CREATE_GOAL = `
  mutation CreateGoal($data: GoalCreateInput!) {
    goalCreate(data: $data) {
    id
      month_start
      low_goal_shoots
      success_goal_shoots
      actual_shoots
      low_goal_revenue
      success_goal_revenue
      actual_revenue
      aov
    status
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_GOAL = `
  mutation UpdateGoal($id: ID!, $data: GoalUpdateInput!) {
    goalUpdate(id: $id, data: $data) {
      id
      month_start
      low_goal_shoots
      success_goal_shoots
      actual_shoots
      low_goal_revenue
      success_goal_revenue
      actual_revenue
      aov
      status
      updatedAt
    }
  }
`;

export const DELETE_GOAL = `
  mutation DeleteGoal($id: ID!) {
    goalDestroy(id: $id) {
      id
    }
  }
`;

// ========================================
// PRICING QUERIES AND MUTATIONS
// ========================================

export const GET_PRICING_BY_FILTER = `
  query GetPricingByFilter($filter: PricingFilter) {
    pricingsList(filter: $filter) {
       items {
        id
        service_name
        your_price
        competitor_price
        estimated_cost
        estimated_profit
        status
      createdAt
      updatedAt
        student {
        id
      }
    }
    }
  }
`;

export const CREATE_PRICING = `
  mutation CreatePricing($data: PricingCreateInput!) {
    pricingCreate(data: $data) {
      id
      service_name
      your_price
      competitor_price
      estimated_cost
      estimated_profit
      status
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PRICING = `
  mutation UpdatePricing($id: ID!, $data: PricingUpdateInput!) {
    pricingUpdate(id: $id, data: $data) {
      id
      service_name
      your_price
      competitor_price
      estimated_cost
      estimated_profit
      status
      updatedAt
    }
  }
`;

export const DELETE_PRICING = `
  mutation DeletePricing($id: ID!) {
    pricingDestroy(id: $id) {
      id
    }
  }
`;

// ========================================
// COACH PRICING QUERIES AND MUTATIONS
// ========================================

export const GET_COACH_PRICING_BY_FILTER = `
  query GetCoachPricingByFilter($filter: CoachPricingFilter) {
    coachPricingsList(filter: $filter) {
      items {
      id
      name
      description
      price
      duration_weeks
        category
      packageFeatures
      status
        createdAt
        updatedAt
      user {
        id
          firstName
          lastName
          email
        }
      }
    }
  }
`;

export const CREATE_COACH_PRICING = `
  mutation CreateCoachPricing($data: CoachPricingCreateInput!) {
    coachPricingCreate(data: $data) {
      id
      name
      description
      price
      duration_weeks
      category
      packageFeatures
      status
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_COACH_PRICING = `
  mutation UpdateCoachPricing($id: ID!, $data: CoachPricingUpdateInput!) {
    coachPricingUpdate(id: $id, data: $data) {
      id
      name
      description
      price
      duration_weeks
      category
      packageFeatures
      status
      updatedAt
    }
  }
`;

export const DELETE_COACH_PRICING = `
  mutation DeleteCoachPricing($id: ID!) {
    coachPricingDestroy(id: $id) {
      id
    }
  }
`;

// ========================================
// LEAD QUERIES AND MUTATIONS
// ========================================

export const GET_LEADS_BY_FILTER = `
  query GetLeadsByFilter($filter: LeadFilter) {
    leadsList(filter: $filter) {
      items {
        id
        lead_name
        email
        phone
        instagram_handle
        lead_source
        initial_call_outcome
        date_of_initial_call
        last_followup_outcome
        date_of_last_followup
        next_followup_date
        message_sent
        followed_back
        followed_up
        status
        createdAt
        updatedAt
        user {
          id
        }
        engagementTag {
          items {
            id
            type
            completed_date
          }
        }
        script_Component {
          id
          intro
          hook
          body1
          body2
          ending
        }
      }
    }
  }
`;

export const GET_STUDENT_LEADS = `
  query GetStudentLeads($userId: ID!) {
    leadsList(
      filter: {
        user: {
          id: {
            equals: $userId
          }
        }
      }
    ) {
      items {
        id
        lead_name
        email
        phone
        instagram_handle
        lead_source
        initial_call_outcome
        date_of_initial_call
        last_followup_outcome
        date_of_last_followup
        next_followup_date
        message_sent
        followed_back
        followed_up
        status
        createdAt
        updatedAt
        deletedAt
      }
    }
  }
`;

export const CREATE_LEAD = `
  mutation CreateLead($data: LeadCreateInput!) {
    leadCreate(data: $data) {
      id
      lead_name
      email
      phone
      instagram_handle
      lead_source
      initial_call_outcome
      date_of_initial_call
      last_followup_outcome
      date_of_last_followup
      next_followup_date
      message_sent
      followed_back
      followed_up
      status
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_LEAD = `
  mutation UpdateLead($id: ID!, $data: LeadUpdateInput!) {
    leadUpdate(id: $id, data: $data) {
      id
      lead_name
      email
      phone
      instagram_handle
      lead_source
      initial_call_outcome
      date_of_initial_call
      last_followup_outcome
      date_of_last_followup
      next_followup_date
      message_sent
      followed_back
      followed_up
      status
      updatedAt
    }
  }
`;

export const UPDATE_LEAD_BY_FILTER = `
  mutation UpdateLeadByFilter($filter: LeadFilter!, $data: LeadUpdateByFilterInput!) {
    leadUpdateByFilter(filter: $filter, data: $data) {
      count
      items {
        id
        lead_name
        email
        phone
        instagram_handle
        lead_source
        initial_call_outcome
        date_of_initial_call
        last_followup_outcome
        date_of_last_followup
        next_followup_date
        message_sent
        followed_back
        followed_up
        status
        updatedAt
      }
    }
  }
`;

export const DELETE_LEAD = `
  mutation DeleteLead($id: ID!) {
    leadDestroy(id: $id) {
      id
    }
  }
`;

// ========================================
// ENGAGEMENT TAG QUERIES AND MUTATIONS
// ========================================

export const GET_ENGAGEMENT_TAGS_BY_FILTER = `
  query GetEngagementTagsByFilter($filter: EngagementTagFilter) {
    engagementTagsList(filter: $filter) {
      items {
        id
        type
        completed_date
        lead {
          id
          lead_name
          status
        }
      }
    }
  }
`;

export const CREATE_ENGAGEMENT_TAG = `
  mutation CreateEngagementTag($data: EngagementTagCreateInput!) {
    engagementTagCreate(data: $data) {
      id
      type
      completed_date
      lead {
        id
        lead_name
        status
      }
    }
  }
`;

export const UPDATE_ENGAGEMENT_TAG = `
  mutation UpdateEngagementTag($id: ID!, $data: EngagementTagUpdateInput!) {
    engagementTagUpdate(id: $id, data: $data) {
      id
      type
      completed_date
    }
  }
`;

export const DELETE_ENGAGEMENT_TAG = `
  mutation DeleteEngagementTag($id: ID!) {
    engagementTagDestroy(id: $id) {
      id
    }
  }
`;

// ========================================
// SCRIPT COMPONENTS QUERIES AND MUTATIONS
// ========================================

export const GET_SCRIPT_COMPONENTS_BY_FILTER = `
  query GetScriptComponentsByFilter($filter: ScriptComponentsFilter) {
    scriptComponentsList(filter: $filter) {
      items {
        id
        intro
        hook
        body1
        body2
        ending
        lead {
          id
          lead_name
        }
      }
    }
  }
`;

export const CREATE_SCRIPT_COMPONENTS = `
  mutation CreateScriptComponents($data: ScriptComponentsCreateInput!) {
    scriptComponentsCreate(data: $data) {
      id
      intro
      hook
      body1
      body2
      ending
      lead {
        id
        lead_name
      }
    }
  }
`;

export const UPDATE_SCRIPT_COMPONENTS = `
  mutation UpdateScriptComponents($id: ID!, $data: ScriptComponentsUpdateInput!) {
    scriptComponentsUpdate(id: $id, data: $data) {
      id
      intro
      hook
      body1
      body2
      ending
    }
  }
`;

export const DELETE_SCRIPT_COMPONENTS = `
  mutation DeleteScriptComponents($id: ID!) {
    scriptComponentsDestroy(id: $id) {
      id
    }
  }
`;

// ========================================
// CALL LOG QUERIES AND MUTATIONS
// ========================================

export const GET_CALL_LOGS_BY_FILTER = `
  query GetCallLogsByFilter($filter: CallLogFilter) {
    callLogsList(filter: $filter) {
      items {
        id
        call_date
        call_duration
        call_type
        topics_discussed
        outcome
        next_steps
        student_mood
        createdAt
        updatedAt
        student {
          id
        }
        coach {
          id
        }
      }
    }
  }
`;

export const CREATE_CALL_LOG = `
  mutation CreateCallLog($data: CallLogCreateInput!) {
    callLogCreate(data: $data) {
      id
      call_date
      call_duration
      call_type
      topics_discussed
      outcome
      next_steps
      student_mood
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_CALL_LOG = `
  mutation UpdateCallLog($id: ID!, $data: CallLogUpdateInput!) {
    callLogUpdate(id: $id, data: $data) {
      id
      call_date
      call_duration
      call_type
      topics_discussed
      outcome
      next_steps
      student_mood
      updatedAt
    }
  }
`;

export const DELETE_CALL_LOG = `
  mutation DeleteCallLog($id: ID!) {
    callLogDestroy(id: $id) {
      id
    }
  }
`;

// ========================================
// NOTE QUERIES AND MUTATIONS
// ========================================

export const GET_NOTES_BY_FILTER = `
  query GetNotesByFilter($filter: NoteFilter) {
    notesList(filter: $filter) {
      items {
        id
        targetType
        targetId
        userId
        content
        visibility
        createdAt
        createdBy
        createdByName
      }
    }
  }
`;

export const CREATE_NOTE = `
  mutation CreateNote($data: NoteCreateInput!) {
    noteCreate(data: $data) {
      id
      target_type
      target_id
      user_id
      content
      visibility
      createdAt
      created_by
      created_by_name
    }
  }
`;

export const UPDATE_NOTE = `
  mutation UpdateNote($id: ID!, $data: NoteUpdateInput!) {
    noteUpdate(id: $id, data: $data) {
      id
      target_type
      target_id
      user_id
      content
      visibility
      updatedAt
    }
  }
`;

export const DELETE_NOTE = `
  mutation DeleteNote($id: ID!) {
    noteDestroy(id: $id) {
      id
    }
  }
`;

// ========================================
// MESSAGE TEMPLATE QUERIES AND MUTATIONS
// ========================================

export const GET_MESSAGE_TEMPLATES_BY_FILTER = `
  query GetMessageTemplatesByFilter($filter: MessageTemplateFilter) {
    messageTemplatesList(filter: $filter) {
      items {
        id
        type
        content
        category
        variation_number
        is_active
        createdAt
        updatedAt
      }
    }
  }
`;

export const CREATE_MESSAGE_TEMPLATE = `
  mutation CreateMessageTemplate($data: MessageTemplateCreateInput!) {
    messageTemplateCreate(data: $data) {
      id
      type
      content
      category
      variation_number
      is_active
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_MESSAGE_TEMPLATE = `
  mutation UpdateMessageTemplate($id: ID!, $data: MessageTemplateUpdateInput!) {
    messageTemplateUpdate(id: $id, data: $data) {
      id
      type
      content
      category
      variation_number
      is_active
      updatedAt
    }
  }
`;

export const DELETE_MESSAGE_TEMPLATE = `
  mutation DeleteMessageTemplate($id: ID!) {
    messageTemplateDestroy(id: $id) {
      id
    }
  }
`;

// ========================================
// GLOBAL VARIABLES QUERIES AND MUTATIONS
// ========================================

export const GET_GLOBAL_VARIABLES_BY_FILTER = `
  query GetGlobalVariablesByFilter($filter: GlobalVariablesFilter) {
    globalVariablesList(filter: $filter) {
      items {
        id
        hourly_pay
        cost_per_photo
        target_profit_margin
        createdAt
        updatedAt
        student {
          id
        }
      }
    }
  }
`;

export const CREATE_GLOBAL_VARIABLES = `
  mutation CreateGlobalVariables($data: GlobalVariablesCreateInput!) {
    globalVariablesCreate(data: $data) {
      id
      hourly_pay
      cost_per_photo
      target_profit_margin
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_GLOBAL_VARIABLES = `
  mutation UpdateGlobalVariables($id: ID!, $data: GlobalVariablesUpdateInput!) {
    globalVariablesUpdate(id: $id, data: $data) {
      id
      hourly_pay
      cost_per_photo
      target_profit_margin
      updatedAt
    }
  }
`;

export const DELETE_GLOBAL_VARIABLES = `
  mutation DeleteGlobalVariables($id: ID!) {
    globalVariablesDestroy(id: $id) {
      id
    }
  }
`;

// ========================================
// PRODUCT QUERIES AND MUTATIONS
// ========================================

export const GET_PRODUCTS_BY_FILTER = `
  query GetProductsByFilter($filter: ProductFilter) {
    productsList(filter: $filter) {
      items {
        id
        name
        price
        createdAt
        updatedAt
        student {
          id
        }
        subitems {
          items {
            id
            type
            label
            value
            createdAt
            updatedAt
          }
        }
      }
    }
  }
`;

export const CREATE_PRODUCT = `
  mutation CreateProduct($data: ProductCreateInput!) {
    productCreate(data: $data) {
      id
      name
      price
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PRODUCT = `
  mutation UpdateProduct($id: ID!, $data: ProductUpdateInput!) {
    productUpdate(id: $id, data: $data) {
      id
      name
      price
      updatedAt
    }
  }
`;

export const DELETE_PRODUCT = `
  mutation DeleteProduct($id: ID!) {
    productDestroy(id: $id) {
      id
    }
  }
`;

// ========================================
// SUBITEM QUERIES AND MUTATIONS
// ========================================

export const GET_SUBITEMS_BY_FILTER = `
  query GetSubitemsByFilter($filter: SubitemFilter) {
    subitemsList(filter: $filter) {
      items {
        id
        type
        label
        value
        createdAt
        updatedAt
        product {
          id
          name
          price
        }
      }
    }
  }
`;

export const CREATE_SUBITEM = `
  mutation CreateSubitem($data: SubitemCreateInput!) {
    subitemCreate(data: $data) {
      id
      type
      label
      value
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_SUBITEM = `
  mutation UpdateSubitem($id: ID!, $data: SubitemUpdateInput!) {
    subitemUpdate(id: $id, data: $data) {
      id
      type
      label
      value
      updatedAt
    }
  }
`;

export const DELETE_SUBITEM = `
  mutation DeleteSubitem($id: ID!) {
    subitemDestroy(id: $id) {
      id
    }
  }
`;

// ========================================
// STUDENT PERFORMANCE ANALYTICS QUERIES
// ========================================

export const GET_STUDENT_HIGHEST_REVENUE_BY_FILTER = `
  query GetStudentHighestRevenueByFilter($filter: WeeklyReportFilter) {
    weeklyReportsList(
      filter: $filter
      sort: { revenue: DESC }
      first: 1
    ) {
      items {
        revenue
      }
    }
  }
`;

export const GET_ALL_STUDENTS_WITH_METRICS_BY_FILTER = `
  query GetAllStudentsWithMetricsByFilter($filter: UserFilter) {
    usersList(filter: $filter) {
      items {
        id
        firstName
        lastName
        email
        hasPaid
        isActive
        assignedAdminId
        createdAt
        weeklyReports {
          items {
            id
            revenue
            createdAt
          }
        }
      }
    }
  }
`;

// ========================================
// KPI SYSTEM QUERIES (for future implementation)
// ========================================

export const GET_STUDENT_KPI_DATA_BY_FILTER = `
  query GetStudentKPIDataByFilter($filter: StudentKPIDataFilter) {
    studentKPIDataList(filter: $filter) {
      items {
        student_id
        student_name
        student_email
        assigned_coach_id
        coach_name
        is_paid_user
        total_leads
        new_leads
        leads_by_source
        leads_by_status
        total_dms_sent
        initial_dms_sent
        follow_up_dms_sent
        total_calls_made
        initial_calls_made
        follow_up_calls_made
        engagement_completion_rate
        conversion_rate
        avg_time_to_first_contact
        avg_time_to_conversion
        activity_trend
        last_activity_date
        time_frame
      }
    }
  }
`;

export const GET_COACH_KPI_SUMMARY_BY_FILTER = `
  query GetCoachKPISummaryByFilter($filter: CoachKPISummaryFilter) {
    coachKPISummaryList(filter: $filter) {
          items {
        coach_id
        coach_name
        total_students
        active_students
        paid_students
        free_students
        total_leads_generated
        total_dms_sent
        total_calls_made
        avg_student_conversion_rate
        avg_student_engagement_rate
        students_above_benchmarks
        recent_calls_logged
        students_needing_attention
        time_frame
      }
    }
  }
`;

export const GET_MULTIPLE_STUDENT_KPIS = `
  query GetMultipleStudentKPIs($studentIds: [String!]!, $timeFrame: TimeFrameFilterInput!) {
    multipleStudentKPIs(studentIds: $studentIds, timeFrame: $timeFrame) {
      student_id
      student_name
      student_email
      assigned_coach_id
      coach_name
      is_paid_user
      total_leads
      new_leads
      leads_by_source
      leads_by_status
      total_dms_sent
      initial_dms_sent
      follow_up_dms_sent
      total_calls_made
      initial_calls_made
      follow_up_calls_made
      engagement_completion_rate
      conversion_rate
      avg_time_to_first_contact
      avg_time_to_conversion
      activity_trend
      last_activity_date
      time_frame
    }
  }
`;

export const GET_STUDENT_ACTIVITY_SUMMARY = `
  query GetStudentActivitySummary($studentIds: [String!]!, $timeFrame: TimeFrameFilterInput!) {
    studentActivitySummary(studentIds: $studentIds, timeFrame: $timeFrame) {
      student {
        id
        name
        email
        role
        has_paid
        assigned_admin_id
      }
      recent_leads
      recent_dms
      recent_calls
      last_activity
      performance_score
            status
      alerts
    }
  }
`;

export const GET_KPI_CHART_DATA = `
  query GetKPIChartData($studentIds: [String!]!, $timeFrame: TimeFrameFilterInput!) {
    kpiChartData(studentIds: $studentIds, timeFrame: $timeFrame) {
      date
      leads
      dms
      calls
      conversions
    }
  }
`;

export const GET_KPI_BENCHMARKS = `
  query GetKPIBenchmarks {
    kpiBenchmarks {
      weekly_new_leads
      weekly_dms_sent
      weekly_calls_made
      monthly_new_leads
      monthly_dms_sent
      monthly_calls_made
      monthly_conversion_rate
      target_engagement_completion_rate
      max_days_without_activity
    }
  }
`;

export const UPDATE_KPI_BENCHMARKS = `
  mutation UpdateKPIBenchmarks($updates: KPIBenchmarksUpdateInput!) {
    kpiBenchmarksUpdate(updates: $updates) {
      weekly_new_leads
      weekly_dms_sent
      weekly_calls_made
      monthly_new_leads
      monthly_dms_sent
      monthly_calls_made
      monthly_conversion_rate
      target_engagement_completion_rate
      max_days_without_activity
    }
  }
`;

// System-wide Analytics Queries
export const GET_PLATFORM_OVERVIEW = `
  query GetPlatformOverview {
    platformOverview {
      total_users
      total_students
      total_coaches
      total_coach_managers
      total_super_admins
      paid_students
      free_students
      active_students
      total_revenue
      total_leads
      total_reports
      total_goals
      conversion_rate
      engagement_rate
      avg_revenue_per_student
      avg_leads_per_student
    }
  }
`;

export const GET_COACH_ANALYTICS = `
  query GetCoachAnalytics($coachId: String) {
    coachAnalytics(coachId: $coachId) {
      coach_id
      coach_name
      coach_email
      assigned_students_count
      active_students_count
      total_revenue_generated
      total_leads_generated
      total_reports_submitted
      avg_student_progress
      avg_student_conversion_rate
      student_distribution {
        paid_count
        free_count
        active_count
        inactive_count
      }
      performance_metrics {
        leads_per_student
        revenue_per_student
        conversion_rate
        engagement_rate
      }
    }
  }
`;

export const GET_SYSTEM_STATISTICS = `
  query GetSystemStatistics {
    systemStatistics {
      user_growth {
        date
        new_users
        total_users
      }
      revenue_trends {
        date
        revenue
        paid_users
      }
      activity_metrics {
        date
        active_users
        leads_generated
        reports_submitted
      }
      performance_indicators {
        avg_conversion_rate
        avg_engagement_rate
        avg_revenue_per_user
        user_retention_rate
      }
    }
  }
`;

// Enhanced User Management Mutations
export const BULK_ASSIGN_STUDENTS_TO_COACH = `
  mutation BulkAssignStudentsToCoach($assignments: [StudentCoachAssignmentInput!]!) {
    bulkAssignStudentsToCoach(assignments: $assignments) {
      success
      message
      assignments {
        student_id
        coach_id
            status
      }
    }
  }
`;

export const BULK_UPDATE_USER_STATUS = `
  mutation BulkUpdateUserStatus($updates: [UserStatusUpdateInput!]!) {
    bulkUpdateUserStatus(updates: $updates) {
      success
      message
      updated_users {
        id
        status
        updated_at
      }
    }
  }
`;

export const GET_USER_ACTIVITY_LOG = `
  query GetUserActivityLog($userId: String, $timeFrame: TimeFrameFilterInput) {
    userActivityLog(userId: $userId, timeFrame: $timeFrame) {
      id
      user_id
      action
      details
      timestamp
      ip_address
      user_agent
    }
  }
`; 