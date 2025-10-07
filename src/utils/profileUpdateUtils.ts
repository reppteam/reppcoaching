import { eightbaseService } from '../services/8baseService';

/**
 * Utility functions for updating user profiles based on their role
 * This ensures we update the correct model (Student or Coach) instead of the User model directly
 */

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
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
  bio?: string;
  profileImage?: any;
}

/**
 * Updates a user's profile by targeting the appropriate model (Student or Coach) based on their role
 * @param userId - The user's ID
 * @param userRole - The user's role (student, coach, coach_manager, etc.)
 * @param profileData - The data to update
 * @returns Promise with the updated profile data
 */
export async function updateUserProfileByRole(
  userId: string, 
  userRole: string, 
  profileData: ProfileUpdateData
): Promise<any> {
  try {
    console.log(`Updating profile for user ${userId} with role ${userRole}`);
    
    // Determine which model to update based on role
    switch (userRole.toLowerCase()) {
      case 'student':
      case 'user':
        console.log('Updating Student record');
        return await eightbaseService.updateStudentByUserId(userId, profileData);
        
      case 'coach':
      case 'coach_manager':
        console.log('Updating Coach record');
        return await eightbaseService.updateCoachByUserId(userId, profileData);
        
      default:
        throw new Error(`Unsupported user role for profile update: ${userRole}`);
    }
  } catch (error) {
    console.error('Failed to update user profile:', error);
    throw error;
  }
}

/**
 * Updates a Student profile specifically
 * @param userId - The user's ID
 * @param studentData - The student data to update
 * @returns Promise with the updated student data
 */
export async function updateStudentProfile(
  userId: string, 
  studentData: ProfileUpdateData
): Promise<any> {
  return await eightbaseService.updateStudentByUserId(userId, studentData);
}

/**
 * Updates a Coach profile specifically
 * @param userId - The user's ID
 * @param coachData - The coach data to update
 * @returns Promise with the updated coach data
 */
export async function updateCoachProfile(
  userId: string, 
  coachData: ProfileUpdateData
): Promise<any> {
  return await eightbaseService.updateCoachByUserId(userId, coachData);
}

/**
 * Determines the appropriate model to update based on user role
 * @param userRole - The user's role
 * @returns The model name ('Student' or 'Coach')
 */
export function getModelForRole(userRole: string): 'Student' | 'Coach' {
  switch (userRole.toLowerCase()) {
    case 'student':
    case 'user':
      return 'Student';
    case 'coach':
    case 'coach_manager':
      return 'Coach';
    default:
      throw new Error(`Unsupported user role: ${userRole}`);
  }
}

/**
 * Assigns a coach to a student by updating the Student table record
 * @param studentUserId - The student's user ID
 * @param coachUserId - The coach's user ID
 * @returns Promise with the updated student data
 */
export async function assignCoachToStudent(
  studentUserId: string, 
  coachUserId: string
): Promise<any> {
  return await eightbaseService.assignCoachToStudent(studentUserId, coachUserId);
}

/**
 * Disconnects a coach from a student by updating the Student table record
 * @param studentId - The student's ID
 * @param coachId - The coach's ID
 * @returns Promise with the updated student data
 */
export async function disconnectCoachFromStudent(
  studentId: string,
  coachId: string
): Promise<any> {
  return await eightbaseService.disconnectCoachFromStudent(studentId, coachId);
}

/**
 * Get all students from the Student table
 * @returns Promise with array of all students
 */
export async function getAllStudents(): Promise<any> {
  return await eightbaseService.getAllStudents();
}

/**
 * Get a specific student by email
 * @param email - The student's email address
 * @returns Promise with the student data or null if not found
 */
export async function getStudentByEmail(email: string): Promise<any> {
  return await eightbaseService.getStudentByEmail(email);
}

/**
 * Update a student by email
 * @param email - The student's email address
 * @param studentData - The data to update
 * @returns Promise with the updated student data
 */
export async function updateStudentByEmail(email: string, studentData: any): Promise<any> {
  return await eightbaseService.updateStudentByEmail(email, studentData);
}

/**
 * Update a student and assign a coach by email
 * @param email - The student's email address
 * @param studentData - The data to update
 * @param coachEmail - The coach's email address
 * @returns Promise with the updated student data
 */
export async function updateStudentAndAssignCoachByEmail(
  email: string, 
  studentData: any, 
  coachEmail: string
): Promise<any> {
  return await eightbaseService.updateStudentAndAssignCoachByEmail(email, studentData, coachEmail);
}

/**
 * Complete workflow: Get all students, filter by email, update student, and assign coach
 * @param studentEmail - The student's email to find and update
 * @param studentData - The data to update
 * @param coachEmail - The coach's email to assign
 * @returns Promise with the updated student data
 */
export async function findUpdateAndAssignCoachByEmail(
  studentEmail: string,
  studentData: any,
  coachEmail: string
): Promise<any> {
  try {
    console.log('Starting complete workflow: Get all students, filter by email, update, and assign coach');
    
    // Step 1: Get all students
    console.log('Step 1: Getting all students...');
    const allStudents = await getAllStudents();
    console.log(`Found ${allStudents.length} total students`);
    
    // Step 2: Filter by email (client-side filtering)
    console.log(`Step 2: Filtering students by email: ${studentEmail}`);
    const filteredStudents = allStudents.filter((student: any) => 
      student.email && student.email.toLowerCase() === studentEmail.toLowerCase()
    );
    
    if (filteredStudents.length === 0) {
      throw new Error(`No student found with email: ${studentEmail}`);
    }
    
    console.log(`Found ${filteredStudents.length} student(s) with email: ${studentEmail}`);
    
    // Step 3: Update student and assign coach
    console.log('Step 3: Updating student and assigning coach...');
    const result = await updateStudentAndAssignCoachByEmail(studentEmail, studentData, coachEmail);
    
    console.log('Complete workflow finished successfully');
    return result;
  } catch (error) {
    console.error('Complete workflow failed:', error);
    throw error;
  }
}
