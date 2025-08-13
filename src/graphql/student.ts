import { gql } from '@apollo/client';

// Query to get student by email
export const GET_STUDENT_BY_EMAIL = gql`
  query GetStudentByEmail($email: String!) {
    studentByEmail(email: $email) {
      id
      name
      email
      role
      assigned_admin_id
      access_start
      access_end
      has_paid
      created_at
      is_active
    }
  }
`;

// Query to get all students
export const GET_ALL_STUDENTS = gql`
  query GetAllStudents {
    students {
      id
      name
      email
      role
      assigned_admin_id
      access_start
      access_end
      has_paid
      created_at
      is_active
    }
  }
`;

// Query to get student by ID
export const GET_STUDENT_BY_ID = gql`
  query GetStudentById($id: ID!) {
    student(id: $id) {
      id
      name
      email
      role
      assigned_admin_id
      access_start
      access_end
      has_paid
      created_at
      is_active
    }
  }
`;

// Mutation to create a new student
export const CREATE_STUDENT = gql`
  mutation CreateStudent($input: StudentInput!) {
    createStudent(input: $input) {
      id
      name
      email
      role
      assigned_admin_id
      access_start
      access_end
      has_paid
      created_at
      is_active
    }
  }
`;

// Mutation to update student
export const UPDATE_STUDENT = gql`
  mutation UpdateStudent($id: ID!, $input: StudentInput!) {
    updateStudent(id: $id, input: $input) {
      id
      name
      email
      role
      assigned_admin_id
      access_start
      access_end
      has_paid
      created_at
      is_active
    }
  }
`;

// Mutation to delete student
export const DELETE_STUDENT = gql`
  mutation DeleteStudent($id: ID!) {
    deleteStudent(id: $id) {
      id
    }
  }
`;

// Removed authenticateStudent query as it doesn't exist in the schema

// Query to get student's weekly reports
export const GET_STUDENT_WEEKLY_REPORTS = gql`
  query GetStudentWeeklyReports($studentId: ID!) {
    studentWeeklyReports(studentId: $studentId) {
      id
      user_id
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
      created_at
    }
  }
`;

// Query to get student's goals
export const GET_STUDENT_GOALS = gql`
  query GetStudentGoals($studentId: ID!) {
    studentGoals(studentId: $studentId) {
      id
      user_id
      month_start
      low_goal_shoots
      success_goal_shoots
      actual_shoots
      low_goal_revenue
      success_goal_revenue
      actual_revenue
      aov
      status
      created_at
    }
  }
`; 