import { client } from '../8baseClient';
import {
  GET_STUDENT_BY_EMAIL, 
  GET_ALL_STUDENTS,
  CREATE_STUDENT,
  UPDATE_STUDENT,
  DELETE_STUDENT,
  GET_STUDENT_WEEKLY_REPORTS,
  GET_STUDENT_GOALS
} from '../graphql/student';
import { User } from '../types';

export interface AuthResponse {
  user: User;
  token: string;
}

export interface StudentInput {
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  assigned_admin_id?: string;
  access_start?: string;
  access_end?: string;
  has_paid?: boolean;
  is_active?: boolean;
}

class GraphQLService {
  // Removed authenticateStudent method as the query doesn't exist in the schema

  // Get student by email
  async getStudentByEmail(email: string): Promise<User | null> {
    try {
      const { data } = await client.query({
        query: GET_STUDENT_BY_EMAIL,
        variables: { email },
        fetchPolicy: 'cache-first'
      });

      return data.usersList?.items?.[0] || null;
    } catch (error) {
      console.error('Error fetching student by email:', error);
      return null;
    }
  }

  // Get all students
  async getAllStudents(): Promise<User[]> {
    try {
      const { data } = await client.query({
        query: GET_ALL_STUDENTS,
        fetchPolicy: 'cache-first'
      });

      return data.usersList?.items || [];
    } catch (error) {
      console.error('Error fetching all students:', error);
      return [];
    }
  }

  // Create a new student
  async createStudent(input: StudentInput): Promise<User> {
    try {
      const { data } = await client.mutate({
        mutation: CREATE_STUDENT,
        variables: { input },
        refetchQueries: [{ query: GET_ALL_STUDENTS }]
      });

      return data.userCreate;
    } catch (error) {
      console.error('Error creating student:', error);
      throw new Error('Failed to create student');
    }
  }

  // Update student
  async updateStudent(id: string, input: StudentInput): Promise<User> {
    try {
      const { data } = await client.mutate({
        mutation: UPDATE_STUDENT,
        variables: { id, input },
        refetchQueries: [{ query: GET_ALL_STUDENTS }]
      });

      return data.userUpdate;
    } catch (error) {
      console.error('Error updating student:', error);
      throw new Error('Failed to update student');
    }
  }

  // Delete student
  async deleteStudent(id: string): Promise<boolean> {
    try {
      await client.mutate({
        mutation: DELETE_STUDENT,
        variables: { id },
        refetchQueries: [{ query: GET_ALL_STUDENTS }]
      });

      return true;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw new Error('Failed to delete student');
    }
  }

  // Get student's weekly reports
  async getStudentWeeklyReports(studentId: string) {
    try {
      const { data } = await client.query({
        query: GET_STUDENT_WEEKLY_REPORTS,
        variables: { studentId },
        fetchPolicy: 'cache-first'
      });

      return data.weeklyReportsList?.items || [];
    } catch (error) {
      console.error('Error fetching student weekly reports:', error);
      return [];
    }
  }

  // Get student's goals
  async getStudentGoals(studentId: string) {
    try {
      const { data } = await client.query({
        query: GET_STUDENT_GOALS,
        variables: { studentId },
        fetchPolicy: 'cache-first'
      });

      return data.goalsList?.items || [];
    } catch (error) {
      console.error('Error fetching student goals:', error);
      return [];
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('authToken');
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

export const graphqlService = new GraphQLService(); 