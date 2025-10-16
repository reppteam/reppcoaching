import { gql } from '@apollo/client';

/**
 * GraphQL queries and mutations for notifications and activity tracking
 */

// ============================================================================
// NOTIFICATION OPERATIONS
// ============================================================================

export const GET_USER_NOTIFICATIONS = gql`
  query GetUserNotifications($studentId: ID!) {
    notificationsList(
      filter: { student: { id: { equals: $studentId } } }
      sort: { createdAt: DESC }
    ) {
      items {
        id
        type
        title
        message
        actionText
        actionLink
        isRead
        priority
        createdAt
        updatedAt
      }
    }
  }
`;

export const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($data: NotificationCreateInput!) {
    notificationCreate(data: $data) {
      id
      type
      title
      message
      actionText
      actionLink
      isRead
      priority
      createdAt
      updatedAt
    }
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    notificationUpdate(filter: { id: $id }, data: { isRead: true }) {
      id
      isRead
      updatedAt
    }
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    notificationDelete(filter: { id: $id }) {
      success
    }
  }
`;

export const BULK_MARK_NOTIFICATIONS_READ = gql`
  mutation BulkMarkNotificationsRead($studentId: ID!) {
    notificationUpdateByFilter(
      filter: { student: { id: { equals: $studentId } }, isRead: { equals: false } }
      data: { isRead: true }
    ) {
      items {
        id
        isRead
      }
    }
  }
`;

// ============================================================================
// ACTIVITY LOG OPERATIONS
// ============================================================================

export const GET_USER_ACTIVITY_LOGS = gql`
  query GetUserActivityLogs($studentId: ID!, $limit: Int) {
    activityLogsList(
      filter: { student: { id: { equals: $studentId } } }
      sort: { createdAt: DESC }
      first: $limit
    ) {
      items {
        id
        activityType
        description
        metadata
        createdAt
      }
    }
  }
`;

export const CREATE_ACTIVITY_LOG = gql`
  mutation CreateActivityLog($data: ActivityLogCreateInput!) {
    activityLogCreate(data: $data) {
      id
      activityType
      description
      metadata
      createdAt
    }
  }
`;

export const GET_ACTIVITY_SUMMARY = gql`
  query GetActivitySummary($studentId: ID!, $startDate: DateTime, $endDate: DateTime) {
    activityLogsList(
      filter: {
        student: { id: { equals: $studentId } }
        createdAt: { gte: $startDate, lte: $endDate }
      }
    ) {
      items {
        id
        activityType
        createdAt
      }
      count
    }
  }
`;

// ============================================================================
// DASHBOARD ANALYTICS OPERATIONS
// ============================================================================

export const GET_DASHBOARD_METRICS = gql`
  query GetDashboardMetrics($studentId: ID!) {
    # Weekly Reports
    weeklyReportsList(
      filter: { student: { id: { equals: $studentId } } }
      sort: { createdAt: DESC }
    ) {
      items {
        id
        revenue
        net_profit
        paid_shoots
        createdAt
      }
      count
    }

    # Leads
    leadsList(
      filter: { student: { id: { equals: $studentId } } }
      sort: { createdAt: DESC }
    ) {
      items {
        id
        status
        createdAt
      }
      count
    }

    # Goals
    goalsList(
      filter: { student: { id: { equals: $studentId } } }
      sort: { createdAt: DESC }
    ) {
      items {
        id
        status
        target_value
        current_value
        createdAt
      }
      count
    }
  }
`;

export const GET_WEEKLY_ACTIVITY_SUMMARY = gql`
  query GetWeeklyActivitySummary($studentId: ID!, $weekStart: DateTime!) {
    weeklyReportsList(
      filter: {
        student: { id: { equals: $studentId } }
        createdAt: { gte: $weekStart }
      }
    ) {
      count
      items {
        id
        revenue
        net_profit
      }
    }

    leadsList(
      filter: {
        student: { id: { equals: $studentId } }
        createdAt: { gte: $weekStart }
      }
    ) {
      count
    }

    activityLogsList(
      filter: {
        student: { id: { equals: $studentId } }
        createdAt: { gte: $weekStart }
      }
    ) {
      count
      items {
        activityType
      }
    }
  }
`;

// ============================================================================
// USER ENGAGEMENT TRACKING
// ============================================================================

export const TRACK_USER_ENGAGEMENT = gql`
  mutation TrackUserEngagement($data: UserEngagementCreateInput!) {
    userEngagementCreate(data: $data) {
      id
      userId
      eventType
      eventData
      timestamp
    }
  }
`;

export const GET_USER_ENGAGEMENT_STATS = gql`
  query GetUserEngagementStats($userId: ID!, $startDate: DateTime, $endDate: DateTime) {
    userEngagementsList(
      filter: {
        userId: { equals: $userId }
        timestamp: { gte: $startDate, lte: $endDate }
      }
    ) {
      items {
        id
        eventType
        timestamp
      }
      count
    }
  }
`;

// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================

export const GET_USER_NOTIFICATION_PREFERENCES = gql`
  query GetUserNotificationPreferences($userId: ID!) {
    userNotificationPreferences(userId: $userId) {
      id
      emailNotifications
      pushNotifications
      reportReminders
      leadReminders
      weeklyDigest
      reminderThreshold
    }
  }
`;

export const UPDATE_NOTIFICATION_PREFERENCES = gql`
  mutation UpdateNotificationPreferences($userId: ID!, $data: NotificationPreferencesInput!) {
    updateUserNotificationPreferences(userId: $userId, data: $data) {
      id
      emailNotifications
      pushNotifications
      reportReminders
      leadReminders
      weeklyDigest
      reminderThreshold
    }
  }
`;

// ============================================================================
// PERSONALIZED COACH NOTIFICATIONS
// ============================================================================

export const CREATE_PERSONALIZED_NOTIFICATION = gql`
  mutation CreatePersonalizedNotification($data: NotificationCreateInput!) {
    notificationCreate(data: $data) {
      id
      type
      title
      message
      priority
      isRead
      createdAt
      updatedAt
      student {
        id
        firstName
        lastName
        email
      }
      coach {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export const GET_COACH_NOTIFICATIONS = gql`
  query GetCoachNotifications($coachId: ID!) {
    notificationsList(
      filter: { 
        coach: { id: { equals: $coachId } }
        type: { equals: "COACH_MESSAGE" }
      }
      sort: { createdAt: DESC }
    ) {
      items {
        id
        type
        title
        message
        priority
        isRead
        createdAt
        updatedAt
        student {
          id
          firstName
          lastName
          email
        }
      }
    }
  }
`;