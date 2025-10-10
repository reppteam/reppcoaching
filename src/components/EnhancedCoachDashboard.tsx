import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/ThemeContext";
import { eightbaseService } from "../services/8baseService";
import { studentImpersonationService } from "../services/studentImpersonationService";
import { Header } from "./Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { CoachStudentEditProfile } from "./CoachStudentEditProfile";
import { CompanyWeekDisplay } from "./CompanyWeekDisplay";
import { LogCallModal } from "./LogCallModal";
import { CreateNoteModal } from "./CreateNoteModal";
import {
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  UserCheck,
  UserX,
  Eye,
  RefreshCw,
  FileText,
  Target,
  Phone,
  Mail,
  MapPin,
  Building,
  Camera,
  Star,
  Crown,
  Sparkles,
  Zap,
  Shield,
  Award,
  TrendingDown,
  User as UserIcon,
} from "lucide-react";
import { CallLog, Note, User, WeeklyReport } from "../types";

interface Coach {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  students?: {
    items: User[];
  };
}

interface CoachDashboardProps {
  className?: string;
}

export function EnhancedCoachDashboard({ className }: CoachDashboardProps) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showInactive, setShowInactive] = useState(false);
  const [showIncompleteTasks, setShowIncompleteTasks] = useState(false);
  const [recentCallLogs, setRecentCallLogs] = useState<CallLog[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [coachRecordId, setCoachRecordId] = useState<string | null>(null);

  // Load coach data
  useEffect(() => {
    const loadCoachData = async () => {
      if (!user?.email) return;

      try {
        setLoading(true);
        
        // First, get the Coach record by email
        const coachRecord = await eightbaseService.getCoachByEmail(user.email);
        if (coachRecord) {
          setCoachRecordId(coachRecord.id);
          setCoach(coachRecord);
          
          // Load all students and filter by coach assignment
          const allStudents = await eightbaseService.getAllStudents();
          console.log('All students fetched:', allStudents.length);
          console.log('Coach ID:', coachRecord.id);
          
          const assignedStudents = allStudents.filter((student: any) => {
            console.log(`Full student object for ${student.firstName} ${student.lastName}:`, student);
            console.log(`Student assignedCoach field:`, student.assignedCoach);
            console.log(`Student coach field:`, student.coach);
            
            const isAssigned = student.assignedCoach?.id === coachRecord.id || student.coach?.id === coachRecord.id;
            console.log(`Student ${student.firstName} ${student.lastName}:`, {
              studentId: student.id,
              assignedCoachId: student.assignedCoach?.id,
              coachId: student.coach?.id,
              expectedCoachId: coachRecord.id,
              isAssigned
            });
            return isAssigned;
          });
          
          console.log('Assigned students found:', assignedStudents.length);
          
          // Update the coach object with the assigned students
          setCoach(prev => prev ? {
            ...prev,
            students: {
              items: assignedStudents
            }
          } : null);
          
          // Load recent activity
          await loadRecentActivity(coachRecord.id);
        }
      } catch (error) {
        console.error("Error loading coach data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCoachData();
  }, [user?.email]);

  // Load recent activity
  const loadRecentActivity = async (coachId: string) => {
    try {
      // TODO: Implement getCallLogsByCoach and getNotesByCoach in 8baseService
      // For now, just set empty arrays
      setRecentCallLogs([]);
      setRecentNotes([]);
    } catch (error) {
      console.error("Error loading recent activity:", error);
    }
  };

  // Student utility functions - These are not used in the simplified view
  // Keeping them for future use when we restore the full dashboard

  // Modal handlers
  const handleViewStudentProfile = (studentId: string) => {
    console.log("Opening student profile for:", studentId);
    setSelectedStudentId(studentId);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedStudentId(null);
  };

  const handleLoginAsStudent = async (student: User) => {
    try {
      await studentImpersonationService.startImpersonation(student.id, user?.role || 'coach');
      // Redirect to student dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error("Error logging in as student:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading coach dashboard...</p>
        </div>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p>Coach not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      {user?.role !== "coach_manager" && <Header />}
      <main className="max-w-[90%] mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Coach Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back, {coach.firstName} {coach.lastName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => window.location.reload()}
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Recent Activity Section */}
          <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Your latest interactions with students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="calls" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-black">
                  <TabsTrigger value="calls">Recent Calls</TabsTrigger>
                  <TabsTrigger value="notes">Recent Notes</TabsTrigger>
                  <TabsTrigger value="reports">Recent Reports</TabsTrigger>
                </TabsList>
                
                <TabsContent value="calls" className="space-y-4 mt-4">
                  {recentCallLogs.length > 0 ? (
                    recentCallLogs.map((call) => (
                      <div key={call.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{new Date(call.call_date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {call.call_type} - {call.call_duration} minutes
                            </p>
                          </div>
                          <Badge variant="outline">{call.student_mood}</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent call logs</p>
                  )}
                </TabsContent>

                <TabsContent value="notes" className="space-y-4 mt-4">
                  {recentNotes.length > 0 ? (
                    recentNotes.map((note) => (
                      <div key={note.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{note.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(note.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={note.visibility === "public" ? "default" : "secondary"}>
                            {note.visibility}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent notes</p>
                  )}
                </TabsContent>

                <TabsContent value="reports" className="space-y-4 mt-4">
                  <p className="text-gray-500 text-center py-4">Recent reports will be shown here</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* My Students Section */}
          <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                My Students ({coach.students?.items?.length || 0})
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Manage and track your assigned students
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Student List */}
              <div className="space-y-4">
                {coach.students?.items && coach.students.items.length > 0 ? (
                  coach.students.items.map((student) => (
                    <div key={student.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{student.firstName} {student.lastName}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{student.email}</p>
                          <p className="text-xs text-gray-500">ID: {student.id}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleViewStudentProfile(student.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">No students assigned to this coach</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Student Edit Profile Modal */}
      {selectedStudentId && (
        <CoachStudentEditProfile
          studentId={selectedStudentId}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          activeTab={activeTab}
        />
      )}
    </div>
  );
}