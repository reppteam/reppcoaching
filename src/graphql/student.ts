import { gql } from '@apollo/client';

// Query to get student by email
export const GET_STUDENT_BY_EMAIL = gql`
  query GetStudentByEmail($email: String!) {
    usersList(filter: { email: { equals: $email } }) {
      items {
        id
        firstName
        lastName
        email
        roles {
          items {
            id
            name
          }
        }
        assigned_admin_id
        access_start
        access_end
        has_paid
        createdAt
        is_active
      }
    }
  }
`;

// Query to get all students
export const GET_ALL_STUDENTS = gql`
  query GetAllStudents {
    usersList {
      items {
        id
        firstName
        lastName
        email
        roles {
          items {
            id
            name
          }
        }
        assigned_admin_id
        access_start
        access_end
        has_paid
        createdAt
        is_active
      }
    }
  }
`;

// Query to get student by ID
export const GET_STUDENT_BY_ID = gql`
  query GetStudentById($id: ID!) {
    user(id: $id) {
      id
      firstName
      lastName
      email
      roles {
        items {
          id
          name
        }
      }
      assigned_admin_id
      access_start
      access_end
      has_paid
      createdAt
      is_active
    }
  }
`;

// Mutation to create a new student
export const CREATE_STUDENT = gql`
  mutation CreateStudent($input: UserCreateInput!) {
    userCreate(data: $input) {
      id
      firstName
      lastName
      email
      roles {
        items {
          id
          name
        }
      }
      assigned_admin_id
      access_start
      access_end
      has_paid
      createdAt
      is_active
    }
  }
`;

// Mutation to update student
export const UPDATE_STUDENT = gql`
  mutation UpdateStudent($id: ID!, $input: UserUpdateInput!) {
    userUpdate(filter: { id: { equals: $id } }, data: $input) {
      id
      firstName
      lastName
      email
      roles {
        items {
          id
          name
        }
      }
      assigned_admin_id
      access_start
      access_end
      has_paid
      createdAt
      is_active
    }
  }
`;

// Mutation to delete student
export const DELETE_STUDENT = gql`
  mutation DeleteStudent($id: ID!) {
    userDestroy(filter: { id: { equals: $id } }) {
      success
    }
  }
`;

// Removed authenticateStudent query as it doesn't exist in the schema

// Query to get student's weekly reports
export const GET_STUDENT_WEEKLY_REPORTS = gql`
  query GetStudentWeeklyReports($studentId: ID!) {
    weeklyReportsList(filter: { weekly_Report: { id: { equals: $studentId } } }) {
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
      }
    }
  }
`;

// Query to get student's goals
export const GET_STUDENT_GOALS = gql`
  query GetStudentGoals($studentId: ID!) {
    goalsList(filter: { student: { id: { equals: $studentId } } }) {
      items {
        id
        title
        description
        target_value
        current_value
        goal_type
        deadline
        priority
        status
        month_start
        low_goal_shoots
        success_goal_shoots
        actual_shoots
        low_goal_revenue
        success_goal_revenue
        actual_revenue
        aov
        student {
          id
          _description
          __typename
        }
        goal {
          id
          _description
          __typename
        }
        _description
        __typename
      }
    }
  }
`; 