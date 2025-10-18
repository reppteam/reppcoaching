import { gql } from '@apollo/client';

// ============================================================================
// TODO ITEMS OPERATIONS
// ============================================================================

export const GET_SIMPLE_TODOS = gql`
  query GetSimpleTodos($userId: ID!) {
    todoListsList(filter: {
      assignedTo: { id: { equals: $userId } }
    }) {
      items {
        id
        title
        status
      }
    }
  }
`;

export const GET_TODOS_BY_USER = gql`
  query GetTodosByUser($userId: ID!) {
    todoListsList(filter: {
      assignedTo: { id: { equals: $userId } }
    }, orderBy: [createdAt_DESC]) {
      items {
        id
        title
        description
        category
        priority
        status
        dueDate
        completedAt
        completionNotes
        createdAt
        updatedAt
        assignedTo {
          id
          firstName
          lastName
          email
        }
        assignedBy {
          id
          firstName
          lastName
          email
        }
      }
    }
  }
`;

export const GET_ALL_TODOS = gql`
  query GetAllTodos($first: Int, $skip: Int, $filter: TodoListFilter) {
    todoListsList(first: $first, skip: $skip, filter: $filter, orderBy: [createdAt_DESC]) {
      items {
        id
        title
        description
        category
        priority
        status
        dueDate
        completedAt
        completionNotes
        createdAt
        updatedAt
        assignedTo {
          id
          firstName
          lastName
          email
        }
        assignedBy {
          id
          firstName
          lastName
          email
        }
      }
      count
    }
  }
`;

export const GET_TODO_BY_ID = gql`
  query GetTodoById($id: ID!) {
    todoList(id: $id) {
      id
      title
      description
      category
      priority
      status
      dueDate
      completedAt
      completionNotes
      createdAt
      updatedAt
      assignedTo {
        id
        firstName
        lastName
        email
      }
      assignedBy {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export const CREATE_TODO = gql`
  mutation CreateTodo($data: TodoListCreateInput!) {
    todoListCreate(data: $data) {
      id
      title
      description
      category
      priority
      status
      dueDate
      completedAt
      completionNotes
      createdAt
      updatedAt
      assignedTo {
        id
        firstName
        lastName
        email
      }
      assignedBy {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export const UPDATE_TODO = gql`
  mutation UpdateTodo($id: ID!, $data: TodoListUpdateInput!) {
    todoListUpdate(filter: { id: $id }, data: $data) {
      id
      title
      description
      category
      priority
      status
      dueDate
      completedAt
      completionNotes
      createdAt
      updatedAt
      assignedTo {
        id
        firstName
        lastName
        email
      }
      assignedBy {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    todoListDelete(filter: { id: $id }) {
      success
    }
  }
`;

// ============================================================================
// REMINDERS OPERATIONS
// ============================================================================

export const GET_REMINDERS_BY_USER = gql`
  query GetRemindersByUser($userId: ID!) {
    remindersList(filter: {
      user: { id: { equals: $userId } }
    }, orderBy: [reminderDate_ASC, reminderTime_ASC]) {
      items {
        id
        title
        description
        reminderDate
        reminderTime
        type
        isActive
        isRecurring
        recurringPattern
        relatedTodoId
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

export const GET_ACTIVE_REMINDERS = gql`
  query GetActiveReminders($userId: ID!) {
    remindersList(filter: {
      user: { id: { equals: $userId } }
      isActive: { equals: true }
      reminderDate: { lte: "${new Date().toISOString().split('T')[0]}" }
    }, orderBy: [reminderDate_ASC, reminderTime_ASC]) {
      items {
        id
        title
        description
        reminderDate
        reminderTime
        type
        isActive
        isRecurring
        recurringPattern
        relatedTodoId
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

export const CREATE_REMINDER = gql`
  mutation CreateReminder($data: ReminderCreateInput!) {
    reminderCreate(data: $data) {
      id
      title
      description
      reminderDate
      reminderTime
      type
      isActive
      isRecurring
      recurringPattern
      relatedTodoId
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
`;

export const UPDATE_REMINDER = gql`
  mutation UpdateReminder($id: ID!, $data: ReminderUpdateInput!) {
    reminderUpdate(filter: { id: $id }, data: $data) {
      id
      title
      description
      reminderDate
      reminderTime
      type
      isActive
      isRecurring
      recurringPattern
      relatedTodoId
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
`;

export const DELETE_REMINDER = gql`
  mutation DeleteReminder($id: ID!) {
    reminderDelete(filter: { id: $id }) {
      success
    }
  }
`;

// ============================================================================
// TODO LISTS OPERATIONS
// ============================================================================

export const GET_TODO_LISTS_BY_USER = gql`
  query GetTodoListsByUser($userId: ID!) {
    todoListsList(filter: {
      or: [
        { owner: { id: { equals: $userId } } }
        { sharedWith: { contains: $userId } }
      ]
    }, orderBy: [updatedAt_DESC]) {
      items {
        id
        title
        description
        isShared
        sharedWith
        createdAt
        updatedAt
        owner {
          id
          firstName
          lastName
          email
        }
        todos {
          id
          title
          description
          category
          priority
          status
          dueDate
          completedAt
          createdAt
          updatedAt
        }
      }
    }
  }
`;

export const CREATE_TODO_LIST = gql`
  mutation CreateTodoList($data: TodoListCreateInput!) {
    todoListCreate(data: $data) {
      id
      title
      description
      isShared
      sharedWith
      createdAt
      updatedAt
      owner {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export const UPDATE_TODO_LIST = gql`
  mutation UpdateTodoList($id: ID!, $data: TodoListUpdateInput!) {
    todoListUpdate(filter: { id: $id }, data: $data) {
      id
      title
      description
      isShared
      sharedWith
      createdAt
      updatedAt
      owner {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

export const DELETE_TODO_LIST = gql`
  mutation DeleteTodoList($id: ID!) {
    todoListDelete(filter: { id: $id }) {
      success
    }
  }
`;

// ============================================================================
// SUBSCRIPTIONS FOR REAL-TIME UPDATES
// ============================================================================

export const TODO_SUBSCRIPTION = gql`
  subscription TodoSubscription($userId: ID!) {
    todo(filter: { assignedTo: { id: { equals: $userId } } }) {
      mutation
      node {
        id
        title
        description
        category
        priority
        status
        dueDate
        completedAt
        completionNotes
        createdAt
        updatedAt
        assignedTo {
          id
          firstName
          lastName
          email
        }
        assignedBy {
          id
          firstName
          lastName
          email
        }
      }
    }
  }
`;

export const REMINDER_SUBSCRIPTION = gql`
  subscription ReminderSubscription($userId: ID!) {
    reminder(filter: { user: { id: { equals: $userId } } }) {
      mutation
      node {
        id
        title
        description
        reminderDate
        reminderTime
        type
        isActive
        isRecurring
        recurringPattern
        relatedTodoId
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
