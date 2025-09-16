import { eightbaseService } from './8baseService';

export interface StudentImpersonationData {
  studentId: string;
  studentName: string;
  studentEmail: string;
  originalUserRole: string;
  impersonationStartTime: Date;
}

class StudentImpersonationService {
  private impersonationData: StudentImpersonationData | null = null;

  /**
   * Start impersonating a student
   * @param studentId - The ID of the student to impersonate
   * @param originalUserRole - The role of the user doing the impersonation
   */
  async startImpersonation(studentId: string, originalUserRole: string): Promise<StudentImpersonationData> {
    try {
      // Get student data
      const student = await eightbaseService.getStudentById(studentId);
      
      if (!student) {
        throw new Error('Student not found');
      }

      // Create impersonation data
      this.impersonationData = {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        studentEmail: student.email,
        originalUserRole,
        impersonationStartTime: new Date()
      };

      // Store in session storage for persistence across page reloads
      sessionStorage.setItem('studentImpersonation', JSON.stringify(this.impersonationData));

      return this.impersonationData;
    } catch (error) {
      console.error('Error starting student impersonation:', error);
      throw error;
    }
  }

  /**
   * Stop impersonation and return to original user
   */
  stopImpersonation(): void {
    this.impersonationData = null;
    sessionStorage.removeItem('studentImpersonation');
  }

  /**
   * Get current impersonation data
   */
  getCurrentImpersonation(): StudentImpersonationData | null {
    if (this.impersonationData) {
      return this.impersonationData;
    }

    // Try to restore from session storage
    const stored = sessionStorage.getItem('studentImpersonation');
    if (stored) {
      try {
        this.impersonationData = JSON.parse(stored);
        return this.impersonationData;
      } catch (error) {
        console.error('Error parsing stored impersonation data:', error);
        sessionStorage.removeItem('studentImpersonation');
      }
    }

    return null;
  }

  /**
   * Check if currently impersonating a student
   */
  isImpersonating(): boolean {
    return this.getCurrentImpersonation() !== null;
  }

  /**
   * Get the student ID being impersonated
   */
  getImpersonatedStudentId(): string | null {
    const impersonation = this.getCurrentImpersonation();
    return impersonation?.studentId || null;
  }

  /**
   * Get impersonation duration in minutes
   */
  getImpersonationDuration(): number {
    const impersonation = this.getCurrentImpersonation();
    if (!impersonation) return 0;

    const now = new Date();
    const start = new Date(impersonation.impersonationStartTime);
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
  }

  /**
   * Validate that the impersonation is still valid (not expired)
   */
  isImpersonationValid(): boolean {
    const impersonation = this.getCurrentImpersonation();
    if (!impersonation) return false;

    // Check if impersonation has been active for more than 2 hours
    const duration = this.getImpersonationDuration();
    return duration < 120; // 2 hours in minutes
  }
}

// Export singleton instance
export const studentImpersonationService = new StudentImpersonationService();
