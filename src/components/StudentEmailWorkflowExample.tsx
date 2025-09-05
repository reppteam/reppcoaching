import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { 
  getAllStudents, 
  getStudentByEmail, 
  updateStudentByEmail, 
  updateStudentAndAssignCoachByEmail,
  findUpdateAndAssignCoachByEmail 
} from '../utils/profileUpdateUtils';

export function StudentEmailWorkflowExample() {
  const [studentEmail, setStudentEmail] = useState('');
  const [coachEmail, setCoachEmail] = useState('');
  const [studentData, setStudentData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    business_name: '',
    location: '',
    goals: '',
    notes: ''
  });
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGetAllStudents = async () => {
    setLoading(true);
    try {
      const students = await getAllStudents();
      setAllStudents(students);
      console.log('All students:', students);
    } catch (error) {
      console.error('Failed to get all students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStudentByEmail = async () => {
    if (!studentEmail) return;
    
    setLoading(true);
    try {
      const student = await getStudentByEmail(studentEmail);
      setSelectedStudent(student);
      if (student) {
        setStudentData({
          firstName: student.firstName || '',
          lastName: student.lastName || '',
          phone: student.phone || '',
          business_name: student.business_name || '',
          location: student.location || '',
          goals: student.goals || '',
          notes: student.notes || ''
        });
      }
      console.log('Student found by email:', student);
    } catch (error) {
      console.error('Failed to get student by email:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStudent = async () => {
    if (!studentEmail) return;
    
    setLoading(true);
    try {
      const updatedStudent = await updateStudentByEmail(studentEmail, studentData);
      setResult(updatedStudent);
      console.log('Student updated:', updatedStudent);
    } catch (error) {
      console.error('Failed to update student:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAndAssignCoach = async () => {
    if (!studentEmail || !coachEmail) return;
    
    setLoading(true);
    try {
      const result = await updateStudentAndAssignCoachByEmail(studentEmail, studentData, coachEmail);
      setResult(result);
      console.log('Student updated and coach assigned:', result);
    } catch (error) {
      console.error('Failed to update student and assign coach:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteWorkflow = async () => {
    if (!studentEmail || !coachEmail) return;
    
    setLoading(true);
    try {
      const result = await findUpdateAndAssignCoachByEmail(studentEmail, studentData, coachEmail);
      setResult(result);
      console.log('Complete workflow finished:', result);
    } catch (error) {
      console.error('Complete workflow failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Email Workflow Example</CardTitle>
          <CardDescription>
            This demonstrates the workflow: Get all students → Filter by email → Update student → Assign coach
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 1: Get All Students */}
          <div className="space-y-2">
            <Label>Step 1: Get All Students</Label>
            <Button onClick={handleGetAllStudents} disabled={loading}>
              {loading ? 'Loading...' : 'Get All Students'}
            </Button>
            {allStudents.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Found {allStudents.length} students
              </p>
            )}
          </div>

          {/* Step 2: Filter by Email */}
          <div className="space-y-2">
            <Label htmlFor="student-email">Step 2: Student Email to Find</Label>
            <div className="flex gap-2">
              <Input
                id="student-email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="student@example.com"
              />
              <Button onClick={handleGetStudentByEmail} disabled={loading || !studentEmail}>
                Find Student
              </Button>
            </div>
            {selectedStudent && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Found:</strong> {selectedStudent.firstName} {selectedStudent.lastName} 
                  ({selectedStudent.email})
                </p>
                {selectedStudent.coach && (
                  <p className="text-sm">
                    <strong>Current Coach:</strong> {selectedStudent.coach.firstName} {selectedStudent.coach.lastName}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Step 3: Update Student Data */}
          <div className="space-y-2">
            <Label>Step 3: Update Student Data</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first-name">First Name</Label>
                <Input
                  id="first-name"
                  value={studentData.firstName}
                  onChange={(e) => setStudentData(prev => ({...prev, firstName: e.target.value}))}
                />
              </div>
              <div>
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  id="last-name"
                  value={studentData.lastName}
                  onChange={(e) => setStudentData(prev => ({...prev, lastName: e.target.value}))}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={studentData.phone}
                  onChange={(e) => setStudentData(prev => ({...prev, phone: e.target.value}))}
                />
              </div>
              <div>
                <Label htmlFor="business-name">Business Name</Label>
                <Input
                  id="business-name"
                  value={studentData.business_name}
                  onChange={(e) => setStudentData(prev => ({...prev, business_name: e.target.value}))}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={studentData.location}
                  onChange={(e) => setStudentData(prev => ({...prev, location: e.target.value}))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="goals">Goals</Label>
              <Textarea
                id="goals"
                value={studentData.goals}
                onChange={(e) => setStudentData(prev => ({...prev, goals: e.target.value}))}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={studentData.notes}
                onChange={(e) => setStudentData(prev => ({...prev, notes: e.target.value}))}
                rows={3}
              />
            </div>
          </div>

          {/* Step 4: Assign Coach */}
          <div className="space-y-2">
            <Label htmlFor="coach-email">Step 4: Coach Email to Assign</Label>
            <Input
              id="coach-email"
              value={coachEmail}
              onChange={(e) => setCoachEmail(e.target.value)}
              placeholder="coach@example.com"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleUpdateStudent} disabled={loading || !studentEmail}>
              Update Student Only
            </Button>
            <Button onClick={handleUpdateAndAssignCoach} disabled={loading || !studentEmail || !coachEmail}>
              Update & Assign Coach
            </Button>
            <Button onClick={handleCompleteWorkflow} disabled={loading || !studentEmail || !coachEmail}>
              Complete Workflow
            </Button>
          </div>

          {/* Results */}
          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Success!</h4>
              <pre className="text-xs text-green-700 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {/* All Students List */}
          {allStudents.length > 0 && (
            <div className="space-y-2">
              <Label>All Students ({allStudents.length})</Label>
              <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
                {allStudents.map((student) => (
                  <div key={student.id} className="flex justify-between items-center p-2 hover:bg-muted rounded">
                    <div>
                      <span className="font-medium">{student.firstName} {student.lastName}</span>
                      <span className="text-sm text-muted-foreground ml-2">({student.email})</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setStudentEmail(student.email);
                        setStudentData({
                          firstName: student.firstName || '',
                          lastName: student.lastName || '',
                          phone: student.phone || '',
                          business_name: student.business_name || '',
                          location: student.location || '',
                          goals: student.goals || '',
                          notes: student.notes || ''
                        });
                      }}
                    >
                      Select
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
