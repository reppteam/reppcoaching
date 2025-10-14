import { eightbaseService } from './8baseService';

export interface TestStudentData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  business_name: string;
  location: string;
  target_market: string;
  strengths: string;
  challenges: string;
  goals: string;
  preferred_contact_method: string;
  availability: string;
  notes: string;
}

class TestStudentService {
  private testStudents: TestStudentData[] = [
    {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson.test@example.com",
      phone: "+1-555-0101",
      business_name: "Sarah's Consulting LLC",
      location: "New York, NY",
      target_market: "Small Business Owners",
      strengths: "Strong communication skills, analytical thinking, customer service experience",
      challenges: "Time management, delegation, pricing strategy",
      goals: "Scale business to $100k revenue, hire first employee, establish recurring revenue streams",
      preferred_contact_method: "Email",
      availability: "Monday-Friday 9AM-5PM EST",
      notes: "Highly motivated entrepreneur looking to grow her consulting business. Has good foundation but needs help with scaling strategies."
    },
    {
      firstName: "Michael",
      lastName: "Chen",
      email: "michael.chen.test@example.com",
      phone: "+1-555-0102",
      business_name: "TechStart Solutions",
      location: "San Francisco, CA",
      target_market: "Tech Startups",
      strengths: "Technical expertise, problem-solving, innovation mindset",
      challenges: "Business development, sales, team management",
      goals: "Secure Series A funding, expand team to 20 employees, achieve product-market fit",
      preferred_contact_method: "Phone",
      availability: "Monday-Friday 10AM-6PM PST",
      notes: "Technical founder with strong product vision but needs guidance on business operations and growth strategies."
    },
    {
      firstName: "Emily",
      lastName: "Rodriguez",
      email: "emily.rodriguez.test@example.com",
      phone: "+1-555-0103",
      business_name: "Creative Marketing Co",
      location: "Austin, TX",
      target_market: "Local Service Businesses",
      strengths: "Creative thinking, social media expertise, client relationships",
      challenges: "Financial planning, operational efficiency, market expansion",
      goals: "Increase monthly revenue by 50%, expand to 3 new cities, build passive income streams",
      preferred_contact_method: "Email",
      availability: "Monday-Friday 8AM-4PM CST",
      notes: "Creative professional with strong client base but needs help with business systems and growth planning."
    },
    {
      firstName: "David",
      lastName: "Thompson",
      email: "david.thompson.test@example.com",
      phone: "+1-555-0104",
      business_name: "Thompson Fitness Studio",
      location: "Miami, FL",
      target_market: "Fitness Enthusiasts",
      strengths: "Fitness expertise, motivational skills, community building",
      challenges: "Marketing, pricing, competition",
      goals: "Open second location, develop online programs, reach $200k annual revenue",
      preferred_contact_method: "Text",
      availability: "Monday-Saturday 6AM-8PM EST",
      notes: "Experienced fitness trainer looking to expand his business and reach more clients through digital channels."
    },
    {
      firstName: "Lisa",
      lastName: "Williams",
      email: "lisa.williams.test@example.com",
      phone: "+1-555-0105",
      business_name: "Williams Legal Services",
      location: "Chicago, IL",
      target_market: "Small Business Legal Needs",
      strengths: "Legal expertise, attention to detail, client advocacy",
      challenges: "Business development, time management, work-life balance",
      goals: "Grow client base by 40%, implement better systems, achieve better work-life balance",
      preferred_contact_method: "Phone",
      availability: "Monday-Friday 9AM-5PM CST",
      notes: "Solo practitioner lawyer looking to grow her practice while maintaining quality service and personal time."
    }
  ];

  /**
   * Create test students and assign them to all coaches
   */
  async createTestStudentsForAllCoaches(): Promise<{
    success: boolean;
    message: string;
    results: Array<{
      coachId: string;
      coachName: string;
      studentsCreated: number;
      errors: string[];
    }>;
  }> {
    try {
      console.log('=== CREATING TEST STUDENTS FOR ALL COACHES ===');
      
      // Get all coaches
      const coaches = await eightbaseService.getAllCoachesDirect();
      console.log(`Found ${coaches.length} coaches`);

      if (coaches.length === 0) {
        return {
          success: false,
          message: 'No coaches found to assign test students to',
          results: []
        };
      }

      const results = [];

      for (const coach of coaches) {
        console.log(`\nProcessing coach: ${coach.firstName} ${coach.lastName} (${coach.email})`);
        const coachResults = {
          coachId: coach.id,
          coachName: `${coach.firstName} ${coach.lastName}`,
          studentsCreated: 0,
          errors: [] as string[]
        };

        try {
          // Create one test student for this coach
          const testStudent = this.testStudents[Math.floor(Math.random() * this.testStudents.length)];
          
          // Modify email to make it unique for this coach
          const uniqueEmail = testStudent.email.replace('@example.com', `+coach${coach.id.slice(-4)}@example.com`);
          
          const studentData = {
            ...testStudent,
            email: uniqueEmail
          };

          console.log(`Creating test student: ${studentData.firstName} ${studentData.lastName}`);
          
          // Create the student
          const createdStudent = await this.createTestStudent(studentData, coach.id);
          
          if (createdStudent) {
            coachResults.studentsCreated = 1;
            console.log(`✓ Successfully created test student for coach ${coach.firstName} ${coach.lastName}`);
          } else {
            coachResults.errors.push('Failed to create student record');
          }

        } catch (error) {
          const errorMessage = `Error creating test student for coach ${coach.firstName} ${coach.lastName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(errorMessage);
          coachResults.errors.push(errorMessage);
        }

        results.push(coachResults);
      }

      const totalStudentsCreated = results.reduce((sum, result) => sum + result.studentsCreated, 0);
      const totalErrors = results.reduce((sum, result) => sum + result.errors.length, 0);

      console.log(`\n=== SUMMARY ===`);
      console.log(`Total coaches processed: ${coaches.length}`);
      console.log(`Total students created: ${totalStudentsCreated}`);
      console.log(`Total errors: ${totalErrors}`);

      return {
        success: totalStudentsCreated > 0,
        message: `Created ${totalStudentsCreated} test students for ${coaches.length} coaches. ${totalErrors} errors occurred.`,
        results
      };

    } catch (error) {
      console.error('Error in createTestStudentsForAllCoaches:', error);
      return {
        success: false,
        message: `Failed to create test students: ${error instanceof Error ? error.message : 'Unknown error'}`,
        results: []
      };
    }
  }

  /**
   * Create a single test student and assign to a coach
   */
  private async createTestStudent(studentData: TestStudentData, coachId: string): Promise<any> {
    try {
      // Step 1: Get role ID for 'Student' role
      let roleId = await eightbaseService.getRoleIdByName('Student');
      
      // Try alternative role names if 'Student' doesn't work
      if (!roleId) {
        console.log('Student role not found, trying alternative names...');
        roleId = await eightbaseService.getRoleIdByName('student');
      }
      
      if (!roleId) {
        roleId = await eightbaseService.getRoleIdByName('user');
      }
      
      if (!roleId) {
        throw new Error('Could not find role ID for student role. Tried: "Student", "student", "user"');
      }
      
      console.log('Found role ID:', roleId);

      // Step 2: Create User record
      const userData = {
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        email: studentData.email,
        access_start: new Date().toISOString().split('T')[0],
        access_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        has_paid: false,
        coaching_term_start: new Date().toISOString().split('T')[0],
        coaching_term_end: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
        is_active: true,
        roles: {
          connect: [{ id: roleId }]
        }
      };

      console.log('Creating user record:', userData);
      const createdUser = await eightbaseService.createUserDirect(userData);
      
      if (!createdUser) {
        throw new Error('Failed to create user record');
      }

      console.log('User created with ID:', createdUser.id);

      // Step 3: Create Student record
      const studentRecordData = {
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        email: studentData.email,
        phone: studentData.phone,
        business_name: studentData.business_name,
        location: studentData.location,
        target_market: studentData.target_market,
        strengths: studentData.strengths,
        challenges: studentData.challenges,
        goals: studentData.goals,
        preferred_contact_method: studentData.preferred_contact_method,
        availability: studentData.availability,
        notes: studentData.notes,
        user: {
          connect: { id: createdUser.id }
        }
      };

      console.log('Creating student record:', studentRecordData);
      const createdStudent = await eightbaseService.createStudentDirect(studentRecordData);
      
      if (!createdStudent) {
        throw new Error('Failed to create student record');
      }

      console.log('Student created with ID:', createdStudent.id);

      // Step 4: Assign student to coach
      console.log('Assigning student to coach:', coachId);
      await eightbaseService.assignStudentToCoach(createdStudent.id, coachId);
      
      console.log('✓ Student successfully assigned to coach');

      return createdStudent;

    } catch (error) {
      console.error('Error creating test student:', error);
      throw error;
    }
  }

  /**
   * Update existing coaches with LAUNCH or FRWRD tags (if they don't have them)
   */
  async updateCoachesWithTags(): Promise<{
    success: boolean;
    message: string;
    updated: number;
    errors: string[];
  }> {
    try {
      console.log('=== UPDATING COACHES WITH TAGS ===');
      
      const coaches = await eightbaseService.getAllCoachesDirect();
      console.log(`Found ${coaches.length} coaches to check`);

      let updated = 0;
      const errors: string[] = [];

      for (const coach of coaches) {
        try {
          // If coach doesn't have a coachType, assign one randomly
          if (!coach.coachType) {
            const coachType = Math.random() < 0.5 ? 'LAUNCH' : 'FRWRD';
            
            console.log(`Updating coach ${coach.firstName} ${coach.lastName} with tag: ${coachType}`);
            
            await eightbaseService.updateCoachDirect(coach.id, { coachType });
            updated++;
            
            console.log(`✓ Updated coach ${coach.firstName} ${coach.lastName} with tag: ${coachType}`);
          } else {
            console.log(`Coach ${coach.firstName} ${coach.lastName} already has tag: ${coach.coachType}`);
          }
        } catch (error) {
          const errorMessage = `Error updating coach ${coach.firstName} ${coach.lastName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(errorMessage);
          errors.push(errorMessage);
        }
      }

      console.log(`\n=== TAG UPDATE SUMMARY ===`);
      console.log(`Total coaches processed: ${coaches.length}`);
      console.log(`Coaches updated: ${updated}`);
      console.log(`Errors: ${errors.length}`);

      return {
        success: updated > 0 || errors.length === 0,
        message: `Updated ${updated} coaches with tags. ${errors.length} errors occurred.`,
        updated,
        errors
      };

    } catch (error) {
      console.error('Error updating coaches with tags:', error);
      return {
        success: false,
        message: `Failed to update coaches with tags: ${error instanceof Error ? error.message : 'Unknown error'}`,
        updated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
}

export const testStudentService = new TestStudentService();
