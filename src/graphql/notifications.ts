import { gql } from '@apollo/client';

/**
 * GraphQL queries and mutations for notifications and activity tracking
 */

// ============================================================================
// NOTIFICATION OPERATIONS
// ============================================================================

export const GET_USER_NOTIFICATIONS = gql`
  query GetUserNotifications($userId: ID!) {
    notificationsList(
      filter: { user: { id: { equals: $userId } } }
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
  mutation BulkMarkNotificationsRead($userId: ID!) {
    notificationUpdateByFilter(
      filter: { user: { id: { equals: $userId } }, isRead: { equals: false } }
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
  query GetUserActivityLogs($userId: ID!, $limit: Int) {
    activityLogsList(
      filter: { user: { id: { equals: $userId } } }
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
  query GetActivitySummary($userId: ID!, $startDate: DateTime, $endDate: DateTime) {
    activityLogsList(
      filter: {
        user: { id: { equals: $userId } }
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
  query GetDashboardMetrics($userId: ID!) {
    # Weekly Reports
    weeklyReportsList(
      filter: { weekly_Report: { id: { equals: $userId } } }
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
      filter: { user: { id: { equals: $userId } } }
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
      filter: { student: { id: { equals: $userId } } }
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
  query GetWeeklyActivitySummary($userId: ID!, $weekStart: DateTime!) {
    weeklyReportsList(
      filter: {
        weekly_Report: { id: { equals: $userId } }
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
        user: { id: { equals: $userId } }
        createdAt: { gte: $weekStart }
      }
    ) {
      count
    }

    activityLogsList(
      filter: {
        user: { id: { equals: $userId } }
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
