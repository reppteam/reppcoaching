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
  Award,
  TrendingDown,
  Zap,
  Heart,
  Shield,
  Crown,
  Sparkles,
  Search,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";

interface Coach {
  id: string;
  bio: string;
  email: string;
  firstName: string;
  lastName: string;
  students: {
    items: Student[];
  };
}

interface Student {
  id: string;
  availability: string;
  business_name: string;
  challenges: string;
  createdAt: string;
  deletedAt?: string;
  email: string;
  firstName: string;
  goals: string;
  lastName: string;
  location: string;
  notes: string;
  phone: string;
  preferred_contact_method: string;
  strengths: string;
  target_market: string;
  updatedAt: string;
  student: {
    items: WeeklyReport[];
  };
}

interface WeeklyReport {
  id: string;
  free_shoots: number;
  expenses: number;
  end_date: string;
  editing_cost: number;
  createdAt: string;
  aov: number;
  net_profit: number;
  new_clients: number;
  paid_shoots: number;
  revenue: number;
  start_date: string;
  status: string;
  unique_clients: number;
  updatedAt: string;
}

// Calendar Component
interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

function CalendarComponent({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  className = "",
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateInRange = (date: Date) => {
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;
    return true;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleDateClick = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    if (isDateInRange(date)) {
      onDateSelect(date);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const isInRange = isDateInRange(date);
      const isSelected = isDateSelected(date);
      const isTodayDate = isToday(date);

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          disabled={!isInRange}
          className={`
            h-8 w-8 text-sm rounded-md transition-colors
            ${
              isInRange
                ? "hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer"
                : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
            }
            ${
              isSelected
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : isTodayDate
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                : "text-gray-700 dark:text-gray-300"
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 ${className}`}
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="h-8 w-8 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
    </div>
  );
}

export function EnhancedCoachDashboard() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [isLogCallModalOpen, setIsLogCallModalOpen] = useState(false);
  const [isCreateNoteModalOpen, setIsCreateNoteModalOpen] = useState(false);
  const [timeFrameFilter, setTimeFrameFilter] = useState<
    "week" | "month" | "custom" | "all"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "name">("recent");
  const [showInactive, setShowInactive] = useState(false);
  const [showIncompleteTasks, setShowIncompleteTasks] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (user?.email) {
      loadCoachData();
    }
  }, [user]);

  const loadCoachData = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      setError(null);

      // Step 1: Get all coaches and filter by email
      const coaches = await eightbaseService.getCoachesByEmailFilter(
        user.email
      );

      if (!coaches || coaches.length === 0) {
        setError("No coach found with your email address.");
        return;
      }

      // Find exact email match
      const foundCoach = coaches.find(
        (c) => c.email.toLowerCase() === user.email.toLowerCase()
      );

      if (!foundCoach) {
        setError("No coach found with your exact email address.");
        return;
      }

      // Step 2: Get coach with students and reports using the second query
      const coachWithData = await eightbaseService.getCoachWithStudentsAndReports(
        foundCoach.id
      );

      if (coachWithData) {
        setCoach(coachWithData);
      } else {
        setError("Failed to load coach data.");
      }
    } catch (error) {
      console.error("Error loading coach data:", error);
      setError("An error occurred while loading your data.");
    } finally {
      setLoading(false);
    }
  };

  const getTotalRevenue = () => {
    if (!coach?.students?.items) return 0;

    return coach.students.items.reduce((total, student) => {
      const studentRevenue =
        student.student?.items?.reduce(
          (studentTotal, report) => studentTotal + (report.revenue || 0),
          0
        ) || 0;
      return total + studentRevenue;
    }, 0);
  };

  const getTotalNetProfit = () => {
    if (!coach?.students?.items) return 0;

    return coach.students.items.reduce((total, student) => {
      const studentProfit =
        student.student?.items?.reduce(
          (studentTotal, report) => studentTotal + (report.net_profit || 0),
          0
        ) || 0;
      return total + studentProfit;
    }, 0);
  };

  const getTotalShoots = () => {
    if (!coach?.students?.items) return 0;

    return coach.students.items.reduce((total, student) => {
      const studentShoots =
        student.student?.items?.reduce(
          (studentTotal, report) =>
            studentTotal +
            (report.paid_shoots || 0) +
            (report.free_shoots || 0),
          0
        ) || 0;
      return total + studentShoots;
    }, 0);
  };

  const getTotalClients = () => {
    if (!coach?.students?.items) return 0;

    return coach.students.items.reduce((total, student) => {
      const studentClients =
        student.student?.items?.reduce(
          (studentTotal, report) => studentTotal + (report.new_clients || 0),
          0
        ) || 0;
      return total + studentClients;
    }, 0);
  };

  const getTotalPaidShoots = () => {
    if (!coach?.students?.items) return 0;

    return coach.students.items.reduce((total, student) => {
      const studentPaidShoots =
        student.student?.items?.reduce(
          (studentTotal, report) => studentTotal + (report.paid_shoots || 0),
          0
        ) || 0;
      return total + studentPaidShoots;
    }, 0);
  };

  const getTotalFreeShoots = () => {
    if (!coach?.students?.items) return 0;

    return coach.students.items.reduce((total, student) => {
      const studentFreeShoots =
        student.student?.items?.reduce(
          (studentTotal, report) => studentTotal + (report.free_shoots || 0),
          0
        ) || 0;
      return total + studentFreeShoots;
    }, 0);
  };

  const getTotalExpenses = () => {
    if (!coach?.students?.items) return 0;

    return coach.students.items.reduce((total, student) => {
      const studentExpenses =
        student.student?.items?.reduce(
          (studentTotal, report) => studentTotal + (report.expenses || 0),
          0
        ) || 0;
      return total + studentExpenses;
    }, 0);
  };

  const getTotalEditingCost = () => {
    if (!coach?.students?.items) return 0;

    return coach.students.items.reduce((total, student) => {
      const studentEditingCost =
        student.student?.items?.reduce(
          (studentTotal, report) => studentTotal + (report.editing_cost || 0),
          0
        ) || 0;
      return total + studentEditingCost;
    }, 0);
  };

  const getAverageOrderValue = () => {
    const totalRevenue = getTotalRevenue();
    const totalShoots = getTotalShoots();
    return totalShoots > 0 ? totalRevenue / totalShoots : 0;
  };

  const getDateRange = (): { start: Date | null; end: Date | null } => {
    if (!coach?.students?.items) return { start: null, end: null };

    let earliestDate: Date | null = null;
    let latestDate: Date | null = null;

    coach.students.items.forEach((student) => {
      student.student?.items?.forEach((report) => {
        const reportDate = new Date(report.createdAt);
        if (!earliestDate || reportDate < earliestDate) {
          earliestDate = reportDate;
        }
        if (!latestDate || reportDate > latestDate) {
          latestDate = reportDate;
        }
      });
    });

    return { start: earliestDate, end: latestDate };
  };

  // Get date range based on selected filter
  const getFilteredDateRange = (): { start: Date | null; end: Date | null } => {
    const now = new Date();

    switch (timeFrameFilter) {
      case "week":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        return { start: weekStart, end: now };

      case "month":
        const monthStart = new Date(now);
        monthStart.setMonth(now.getMonth() - 1);
        return { start: monthStart, end: now };

      case "custom":
        if (customDateRange.start && customDateRange.end) {
          return {
            start: customDateRange.start,
            end: customDateRange.end,
          };
        }
        return { start: null, end: null };

      case "all":
      default:
        return { start: null, end: null };
    }
  };

  // Filter reports based on date range
  const getFilteredReports = (student: Student) => {
    const reports = student.student?.items || [];
    const dateRange = getFilteredDateRange();

    if (!dateRange.start || !dateRange.end) {
      return reports; // Return all reports if no date filter
    }

    return reports.filter((report) => {
      const reportDate = new Date(report.createdAt);
      return reportDate >= dateRange.start! && reportDate <= dateRange.end!;
    });
  };

  const getStudentTotalRevenue = (student: Student) => {
    return (
      student.student?.items?.reduce(
        (total, report) => total + (report.revenue || 0),
        0
      ) || 0
    );
  };

  const getStudentTotalProfit = (student: Student) => {
    return (
      student.student?.items?.reduce(
        (total, report) => total + (report.net_profit || 0),
        0
      ) || 0
    );
  };

  const getStudentTotalShoots = (student: Student) => {
    return (
      student.student?.items?.reduce(
        (total, report) =>
          total + (report.paid_shoots || 0) + (report.free_shoots || 0),
        0
      ) || 0
    );
  };

  const getStudentReportsCount = (student: Student) => {
    return student.student?.items?.length || 0;
  };

  const getStudentTotalFreeShoots = (student: Student) => {
    return (
      student.student?.items?.reduce(
        (total, report) => total + (report.free_shoots || 0),
        0
      ) || 0
    );
  };

  const getStudentTotalExpenses = (student: Student) => {
    return (
      student.student?.items?.reduce(
        (total, report) => total + (report.expenses || 0),
        0
      ) || 0
    );
  };

  const getStudentTotalEditingCost = (student: Student) => {
    return (
      student.student?.items?.reduce(
        (total, report) => total + (report.editing_cost || 0),
        0
      ) || 0
    );
  };

  const getStudentTotalNewClients = (student: Student) => {
    return (
      student.student?.items?.reduce(
        (total, report) => total + (report.new_clients || 0),
        0
      ) || 0
    );
  };

  const getStudentTotalPaidShoots = (student: Student) => {
    return (
      student.student?.items?.reduce(
        (total, report) => total + (report.paid_shoots || 0),
        0
      ) || 0
    );
  };

  // Filtered versions of calculation functions
  const getFilteredTotalRevenue = () => {
    if (!coach?.students?.items) return 0;

    return coach.students.items.reduce((total, student) => {
      const filteredReports = getFilteredReports(student);
      const studentRevenue = filteredReports.reduce(
        (studentTotal, report) => studentTotal + (report.revenue || 0),
        0
      );
      return total + studentRevenue;
    }, 0);
  };

  const getFilteredTotalNetProfit = () => {
    if (!coach?.students?.items) return 0;

    return coach.students.items.reduce((total, student) => {
      const filteredReports = getFilteredReports(student);
      const studentProfit = filteredReports.reduce(
        (studentTotal, report) => studentTotal + (report.net_profit || 0),
        0
      );
      return total + studentProfit;
    }, 0);
  };

  const getFilteredTotalShoots = () => {
    if (!coach?.students?.items) return 0;

    return coach.students.items.reduce((total, student) => {
      const filteredReports = getFilteredReports(student);
      const studentShoots = filteredReports.reduce(
        (studentTotal, report) =>
          studentTotal + (report.paid_shoots || 0) + (report.free_shoots || 0),
        0
      );
      return total + studentShoots;
    }, 0);
  };

  const getFilteredTotalClients = () => {
    if (!coach?.students?.items) return 0;

    return coach.students.items.reduce((total, student) => {
      const filteredReports = getFilteredReports(student);
      const studentClients = filteredReports.reduce(
        (studentTotal, report) => studentTotal + (report.new_clients || 0),
        0
      );
      return total + studentClients;
    }, 0);
  };

  const getFilteredTotalPaidShoots = () => {
    if (!coach?.students?.items) return 0;

    return coach.students.items.reduce((total, student) => {
      const filteredReports = getFilteredReports(student);
      const studentPaidShoots = filteredReports.reduce(
        (studentTotal, report) => studentTotal + (report.paid_shoots || 0),
        0
      );
      return total + studentPaidShoots;
    }, 0);
  };

  const getFilteredTotalFreeShoots = () => {
    if (!coach?.students?.items) return 0;

    return coach.students.items.reduce((total, student) => {
      const filteredReports = getFilteredReports(student);
      const studentFreeShoots = filteredReports.reduce(
        (studentTotal, report) => studentTotal + (report.free_shoots || 0),
        0
      );
      return total + studentFreeShoots;
    }, 0);
  };

  const getFilteredTotalExpenses = () => {
    if (!coach?.students?.items) return 0;

    return coach.students.items.reduce((total, student) => {
      const filteredReports = getFilteredReports(student);
      const studentExpenses = filteredReports.reduce(
        (studentTotal, report) => studentTotal + (report.expenses || 0),
        0
      );
      return total + studentExpenses;
    }, 0);
  };

  const getFilteredTotalEditingCost = () => {
    if (!coach?.students?.items) return 0;

    return coach.students.items.reduce((total, student) => {
      const filteredReports = getFilteredReports(student);
      const studentEditingCost = filteredReports.reduce(
        (studentTotal, report) => studentTotal + (report.editing_cost || 0),
        0
      );
      return total + studentEditingCost;
    }, 0);
  };

  const getFilteredAverageOrderValue = () => {
    const totalRevenue = getFilteredTotalRevenue();
    const totalShoots = getFilteredTotalShoots();
    return totalShoots > 0 ? totalRevenue / totalShoots : 0;
  };

  const getStudentAverageOrderValue = (student: Student) => {
    const reports = student.student?.items || [];
    if (reports.length === 0) return 0;
    const totalAOV = reports.reduce(
      (total, report) => total + (report.aov || 0),
      0
    );
    return totalAOV / reports.length;
  };

  const getStudentLatestReport = (student: Student) => {
    const reports = student.student?.items || [];
    if (reports?.length === 0) return null;
    // Create a copy of the array before sorting to avoid read-only property error
    return [...reports].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  };

  const getStudentsWithoutRecentReports = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return (
      coach?.students?.items?.filter((student) => {
        const reports = student.student?.items || [];
        const hasRecentReport = reports.some(
          (report) => new Date(report.createdAt) > sevenDaysAgo
        );
        return !hasRecentReport;
      }) || []
    );
  };

  const handleViewStudentProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveTab("profile");
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedStudentId(null);
  };

  const handleLogCall = async (callData: any) => {
    try {
      console.log("Logging call:", callData);
      await eightbaseService.createCallLog({
        student_id: callData.studentId,
        coach_id: coach?.id || "",
        call_date: callData.date,
        call_duration: callData.duration,
        call_type: callData.callType,
        student_mood: callData.studentMood,
        topics_discussed: callData.topics ? [callData.topics] : [],
        outcome: callData.outcome,
        next_steps: callData.nextSteps || "",
      });
      console.log("Call logged successfully");
      // Optionally refresh the dashboard data or show a success message
    } catch (error) {
      console.error("Error logging call:", error);
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  const handleCreateNote = async (noteData: any) => {
    try {
      console.log("Creating note:", noteData);
      await eightbaseService.createNote({
        target_type: noteData.target,
        target_id: noteData.studentId || "",
        user_id: coach?.id || "",
        title: noteData.title,
        content: noteData.content,
        visibility: noteData.visibility,
        created_by: user?.id || "",
        created_by_name: `${user?.firstName || ""} ${user?.lastName ||
          ""}`.trim(),
      });
      console.log("Note created successfully");
      // Optionally refresh the dashboard data or show a success message
    } catch (error) {
      console.error("Error creating note:", error);
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  const handleLoginAsStudent = async (student: Student) => {
    // Instead of opening a new tab, open the student profile modal
    // The modal already has the profit calculator integrated
    setSelectedStudentId(student.id);
    setActiveTab("profit");
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your coach dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={loadCoachData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="text-center py-12">
        <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Coach Data Found</h3>
        <p className="text-muted-foreground">
          Unable to load your coach information.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      {user?.role !== "coach_manager" && <Header />}
      <main className="max-w-[90%] mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Dashboard Header - Hide for coach managers */}

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Welcome, {coach.firstName} {coach.lastName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Coach Dashboard - Manage your students and track performance
              </p>
              <div className="mt-2">
                <CompanyWeekDisplay variant="compact" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-black dark:text-white">
              <Button
                onClick={loadCoachData}
                variant="outline"
                size="sm"
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary"
                onClick={() => setIsLogCallModalOpen(true)}
              >
                <Phone className="h-4 w-4 mr-2" />
                Log a Call
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:text-white"
                onClick={() => setIsCreateNoteModalOpen(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Create a Note
              </Button>
            </div>
          </div>

          {/* Enhanced Summary Cards with Detailed Metrics and Filter Options */}
          <div className="space-y-4">
            {/* Filter Options for Summary Cards */}
            <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Summary Card Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={timeFrameFilter === "week" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeFrameFilter("week")}
                    className="text-xs"
                  >
                    Week-to-Date
                  </Button>
                  <Button
                    variant={
                      timeFrameFilter === "month" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setTimeFrameFilter("month")}
                    className="text-xs"
                  >
                    Month-to-Date
                  </Button>
                  <Button
                    variant={
                      timeFrameFilter === "custom" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => {
                      setTimeFrameFilter("custom");
                      setShowDatePicker(!showDatePicker);
                    }}
                    className="text-xs"
                  >
                    <CalendarDays className="h-3 w-3 mr-1" />
                    Custom Range
                  </Button>
                  <Button
                    variant={timeFrameFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeFrameFilter("all")}
                    className="text-xs"
                  >
                    All Time
                  </Button>
                </div>

                {/* Custom Date Range Picker */}
                {timeFrameFilter === "custom" && showDatePicker && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Select Date Range
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Choose start and end dates to filter your data
                      </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Start Date Calendar */}
                      <div className="flex-1">
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Start Date
                          </label>
                          {customDateRange.start && (
                            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                              Selected:{" "}
                              {customDateRange.start.toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <CalendarComponent
                          selectedDate={customDateRange.start}
                          onDateSelect={(date) =>
                            setCustomDateRange((prev) => ({
                              ...prev,
                              start: date,
                            }))
                          }
                          maxDate={customDateRange.end || new Date()}
                          className="w-full"
                        />
                      </div>

                      {/* End Date Calendar */}
                      <div className="flex-1">
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            End Date
                          </label>
                          {customDateRange.end && (
                            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                              Selected:{" "}
                              {customDateRange.end.toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <CalendarComponent
                          selectedDate={customDateRange.end}
                          onDateSelect={(date) =>
                            setCustomDateRange((prev) => ({
                              ...prev,
                              end: date,
                            }))
                          }
                          minDate={customDateRange.start || undefined}
                          maxDate={new Date()}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-2 text-black dark:text-white">
                        {customDateRange.start && customDateRange.end && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            Showing data from{" "}
                            {customDateRange.start.toLocaleDateString()} to{" "}
                            {customDateRange.end.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCustomDateRange({ start: null, end: null });
                            setTimeFrameFilter("all");
                            setShowDatePicker(false);
                          }}
                          className="text-xs"
                        >
                          Clear & Close
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setShowDatePicker(false)}
                          className="text-xs"
                          disabled={
                            !customDateRange.start || !customDateRange.end
                          }
                        >
                          Apply Filter
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    My Students
                  </CardTitle>
                  <Users className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {coach.students?.items?.length || 0}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Under your guidance
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Revenue
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${getFilteredTotalRevenue().toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Combined student revenue
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Net Profit
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${getFilteredTotalNetProfit().toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    After expenses & editing costs
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    AOV
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${getFilteredAverageOrderValue().toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Average order value
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    New Clients
                  </CardTitle>
                  <UserCheck className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {getFilteredTotalClients()}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total new clients
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Paid Shoots
                  </CardTitle>
                  <Camera className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {getFilteredTotalPaidShoots()}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Revenue-generating shoots
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Free Shoots
                  </CardTitle>
                  <Camera className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {getFilteredTotalFreeShoots()}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Marketing & portfolio shoots
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Expenses
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    $
                    {(
                      getFilteredTotalExpenses() + getFilteredTotalEditingCost()
                    ).toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Expenses + editing costs
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Company Week Display & Performance Overview */}
            <div className="grid grid-cols-1 gap-4">
              <CompanyWeekDisplay variant="detailed" />
              {/* <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Performance Overview</CardTitle>
              <Activity className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Reports:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {coach.students?.items?.reduce((total, student) => 
                      total + (student.student?.items?.length || 0), 0) || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg. per Student:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {coach.students?.items?.length > 0 
                      ? Math.round((coach.students.items.reduce((total, student) => 
                          total + (student.student?.items?.length || 0), 0) || 0) / coach.students.items.length)
                      : '0'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card> */}
            </div>

            {/* Alerts Section - Exact match to image */}
            {getStudentsWithoutRecentReports().length > 0 && (
              <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-black dark:text-white">
                    <AlertCircle className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      Alerts
                    </CardTitle>
                  </div>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Items requiring your attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getStudentsWithoutRecentReports().map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-black"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {student.firstName} {student.lastName}: No weekly
                              report submitted in the last 7 days.
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Review
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* My Students Section - Exact match to image */}
          <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    My Students
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Manage your assigned students and their progress
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            {/* Search and Filter Bar */}
            <div className="px-6 pb-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search students by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Sort Options */}
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="recent">Most Recent Activity</option>
                    <option value="oldest">Oldest Activity</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>

                {/* Filter Options */}
                <div className="flex gap-2">
                  <Button
                    variant={showInactive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowInactive(!showInactive)}
                    className="text-xs"
                  >
                    Include Inactive
                  </Button>
                  <Button
                    variant={showIncompleteTasks ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowIncompleteTasks(!showIncompleteTasks)}
                    className="text-xs"
                  >
                    Incomplete Tasks
                  </Button>
                </div>
              </div>
            </div>

            <CardContent>
              <div className="space-y-4">
                {coach.students?.items
                  ?.filter((student) => {
                    // Search filter
                    const matchesSearch =
                      searchTerm === "" ||
                      (student.firstName &&
                        student.firstName
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())) ||
                      (student.lastName &&
                        student.lastName
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())) ||
                      (student.email &&
                        student.email
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()));

                    // Active/Inactive filter
                    const hasRecentReports = student.student?.items?.some(
                      (report) =>
                        new Date(report.createdAt) >
                        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    );
                    const matchesActiveFilter =
                      showInactive || hasRecentReports;

                    // Incomplete tasks filter
                    const hasIncompleteTasks = !hasRecentReports;
                    const matchesIncompleteFilter =
                      !showIncompleteTasks || hasIncompleteTasks;

                    return (
                      matchesSearch &&
                      matchesActiveFilter &&
                      matchesIncompleteFilter
                    );
                  })
                  .sort((a, b) => {
                    // Sorting logic
                    switch (sortBy) {
                      case "recent":
                        const aRecent =
                          a.student?.items?.[0]?.createdAt || a.createdAt;
                        const bRecent =
                          b.student?.items?.[0]?.createdAt || b.createdAt;
                        return (
                          new Date(bRecent).getTime() -
                          new Date(aRecent).getTime()
                        );
                      case "oldest":
                        const aOldest =
                          a.student?.items?.[0]?.createdAt || a.createdAt;
                        const bOldest =
                          b.student?.items?.[0]?.createdAt || b.createdAt;
                        return (
                          new Date(aOldest).getTime() -
                          new Date(bOldest).getTime()
                        );
                      case "name":
                        return `${a.firstName} ${a.lastName}`.localeCompare(
                          `${b.firstName} ${b.lastName}`
                        );
                      default:
                        return 0;
                    }
                  })
                  .map((student) => {
                    const reports = student.student?.items || [];
                    const totalRevenue = getStudentTotalRevenue(student);
                    const totalProfit = getStudentTotalProfit(student);
                    const totalFreeShoots = getStudentTotalFreeShoots(student);
                    const totalExpenses = getStudentTotalExpenses(student);
                    const totalEditingCost = getStudentTotalEditingCost(
                      student
                    );
                    const totalNewClients = getStudentTotalNewClients(student);
                    const totalPaidShoots = getStudentTotalPaidShoots(student);
                    const avgAOV = getStudentAverageOrderValue(student);
                    const latestReport = getStudentLatestReport(student);
                    const recentReports = reports.filter(
                      (r) =>
                        new Date(r.createdAt) >
                        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    ).length;

                    return (
                      <div
                        key={student.id}
                        className="border border-gray-200 dark:border-gray-600 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-black shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="p-3 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              {recentReports > 0 && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                              )}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 text-black dark:text-white">
                                {student.firstName} {student.lastName}
                                {totalRevenue > 1000 && (
                                  <Crown className="h-4 w-4 text-yellow-500" />
                                )}
                                {recentReports > 0 && (
                                  <Sparkles className="h-4 w-4 text-blue-500" />
                                )}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {student.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                recentReports === 0
                                  ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                  : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              }`}
                            >
                              {recentReports === 0 ? "Inactive" : "Active"}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
                              onClick={() =>
                                handleViewStudentProfile(student.id)
                              }
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Profile
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
                              onClick={() => handleLoginAsStudent(student)}
                            >
                              <User className="h-4 w-4 mr-1" />
                              View Profit Calculator
                            </Button>
                          </div>
                        </div>

                        {/* First Row - Basic Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-black dark:border-gray-700 hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-2 text-black dark:text-white mb-2">
                              <FileText className="h-4 w-4 text-blue-500" />
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Reports
                              </p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {reports.length}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-black dark:border-gray-700 hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-2 text-black dark:text-white mb-2">
                              <Clock className="h-4 w-4 text-green-500" />
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Recent Reports
                              </p>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {recentReports}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-black dark:border-gray-700 hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-2 text-black dark:text-white mb-2">
                              <TrendingUp className="h-4 w-4 text-emerald-500" />
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Revenue
                              </p>
                            </div>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                              ${totalRevenue.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-black dark:border-gray-700 hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-2 text-black dark:text-white mb-2">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Net Profit
                              </p>
                            </div>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                              ${totalProfit.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Second Row - Shoot Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-black dark:border-gray-700 hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-2 text-black dark:text-white mb-2">
                              <Camera className="h-4 w-4 text-purple-500" />
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Paid Shoots
                              </p>
                            </div>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {totalPaidShoots}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-black dark:border-gray-700 hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-2 text-black dark:text-white mb-2">
                              <Zap className="h-4 w-4 text-orange-500" />
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Free Shoots
                              </p>
                            </div>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                              {totalFreeShoots}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-black dark:border-gray-700 hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-2 text-black dark:text-white mb-2">
                              <UserCheck className="h-4 w-4 text-indigo-500" />
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                New Clients
                              </p>
                            </div>
                            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                              {totalNewClients}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-black dark:border-gray-700 hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-2 text-black dark:text-white mb-2">
                              <BarChart3 className="h-4 w-4 text-cyan-500" />
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Avg AOV
                              </p>
                            </div>
                            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                              ${Math.round(avgAOV).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Third Row - Cost Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-black dark:border-gray-700 hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-2 text-black dark:text-white mb-2">
                              <TrendingDown className="h-4 w-4 text-red-500" />
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Expenses
                              </p>
                            </div>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                              ${totalExpenses.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-black dark:border-gray-700 hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-2 text-black dark:text-white mb-2">
                              <Shield className="h-4 w-4 text-amber-500" />
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Editing Cost
                              </p>
                            </div>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                              ${totalEditingCost.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-black dark:border-gray-700 hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-2 text-black dark:text-white mb-2">
                              <Award className="h-4 w-4 text-pink-500" />
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Latest Status
                              </p>
                            </div>
                            <div className="flex items-center">
                              {latestReport ? (
                                <Badge
                                  variant="default"
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-3 py-1"
                                >
                                  {latestReport.status || "Completed"}
                                </Badge>
                              ) : (
                                <span className="text-gray-500 text-sm">
                                  No Reports
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Latest Report Details */}
                        {latestReport && (
                          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2 text-black dark:text-white mb-3">
                              <Star className="h-5 w-5 text-yellow-500" />
                              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                Latest Report Details
                              </h4>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                <div className="flex items-center gap-1 mb-1">
                                  <Calendar className="h-3 w-3 text-blue-500" />
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    Period
                                  </span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {new Date(
                                    latestReport.start_date
                                  ).toLocaleDateString()}{" "}
                                  -{" "}
                                  {new Date(
                                    latestReport.end_date
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                <div className="flex items-center gap-1 mb-1">
                                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    Revenue
                                  </span>
                                </div>
                                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                  $
                                  {latestReport.revenue?.toLocaleString() ||
                                    "0"}
                                </p>
                              </div>
                              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                <div className="flex items-center gap-1 mb-1">
                                  <DollarSign className="h-3 w-3 text-green-500" />
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    Profit
                                  </span>
                                </div>
                                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                  $
                                  {latestReport.net_profit?.toLocaleString() ||
                                    "0"}
                                </p>
                              </div>
                              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                <div className="flex items-center gap-1 mb-1">
                                  <Clock className="h-3 w-3 text-purple-500" />
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    Submitted
                                  </span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {new Date(
                                    latestReport.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Weekly Reports / Performance Tabs - Exact match to image */}
          <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Weekly Reports
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Latest submissions from your students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="reports" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-black">
                  <TabsTrigger
                    value="reports"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
                  >
                    Recent Weekly Reports
                  </TabsTrigger>
                  <TabsTrigger
                    value="performance"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
                  >
                    Performance
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="reports" className="space-y-4 mt-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                      Latest submissions from your students
                    </h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-200 dark:border-gray-700">
                            <TableHead className="text-gray-600 dark:text-gray-400 font-medium">
                              Student
                            </TableHead>
                            <TableHead className="text-gray-600 dark:text-gray-400 font-medium">
                              Week
                            </TableHead>
                            <TableHead className="text-gray-600 dark:text-gray-400 font-medium">
                              Revenue
                            </TableHead>
                            <TableHead className="text-gray-600 dark:text-gray-400 font-medium">
                              Profit
                            </TableHead>
                            <TableHead className="text-gray-600 dark:text-gray-400 font-medium">
                              Paid Shoots
                            </TableHead>
                            <TableHead className="text-gray-600 dark:text-gray-400 font-medium">
                              Free Shoots
                            </TableHead>
                            <TableHead className="text-gray-600 dark:text-gray-400 font-medium">
                              New Clients
                            </TableHead>
                            <TableHead className="text-gray-600 dark:text-gray-400 font-medium">
                              AOV
                            </TableHead>
                            <TableHead className="text-gray-600 dark:text-gray-400 font-medium">
                              Expenses
                            </TableHead>
                            <TableHead className="text-gray-600 dark:text-gray-400 font-medium">
                              Status
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {coach.students?.items
                            ?.flatMap(
                              (student) =>
                                student.student?.items?.map((report) => ({
                                  student,
                                  report,
                                })) || []
                            )
                            .slice(0, 5)
                            .map(({ student, report }) => (
                              <TableRow
                                key={report.id}
                                className="border-gray-200 dark:border-gray-700"
                              >
                                <TableCell className="font-medium text-gray-900 dark:text-white">
                                  {student.firstName} {student.lastName}
                                </TableCell>
                                <TableCell className="text-gray-600 dark:text-gray-400">
                                  {new Date(
                                    report.start_date
                                  ).toLocaleDateString()}{" "}
                                  -{" "}
                                  {new Date(
                                    report.end_date
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-gray-900 dark:text-white">
                                  ${report.revenue?.toLocaleString() || "0"}
                                </TableCell>
                                <TableCell className="text-green-600 dark:text-green-400">
                                  ${report.net_profit?.toLocaleString() || "0"}
                                </TableCell>
                                <TableCell className="text-gray-900 dark:text-white">
                                  {report.paid_shoots || 0}
                                </TableCell>
                                <TableCell className="text-gray-900 dark:text-white">
                                  {report.free_shoots || 0}
                                </TableCell>
                                <TableCell className="text-gray-900 dark:text-white">
                                  {report.new_clients || 0}
                                </TableCell>
                                <TableCell className="text-gray-900 dark:text-white">
                                  ${report.aov?.toLocaleString() || "0"}
                                </TableCell>
                                <TableCell className="text-red-600 dark:text-red-400">
                                  ${(report.expenses || 0).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="default"
                                    className="bg-blue-600 dark:bg-blue-500 text-white"
                                  >
                                    {report.status || "Submitted"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4 mt-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                      Student performance metrics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {coach.students?.items?.map((student) => {
                        const reports = student.student?.items || [];
                        const totalRevenue = getStudentTotalRevenue(student);
                        const totalProfit = getStudentTotalProfit(student);
                        const totalShoots = getStudentTotalShoots(student);

                        return (
                          <Card
                            key={student.id}
                            className="bg-white dark:bg-black border border-gray-200 dark:border-gray-600"
                          >
                            <CardHeader>
                              <CardTitle className="text-sm text-gray-900 dark:text-white">
                                {student.firstName} {student.lastName}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Total Revenue
                                  </span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    ${totalRevenue.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Net Profit
                                  </span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    ${totalProfit.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Total Shoots
                                  </span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {totalShoots}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Reports
                                  </span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {reports.length}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Student Edit Profile Modal */}
      <CoachStudentEditProfile
        studentId={selectedStudentId || ""}
        isOpen={isEditModalOpen && !!selectedStudentId}
        onClose={handleCloseEditModal}
        activeTab={activeTab}
      />

      {/* Log Call Modal */}
      <LogCallModal
        isOpen={isLogCallModalOpen}
        onClose={() => setIsLogCallModalOpen(false)}
        students={coach?.students?.items || []}
        onLogCall={handleLogCall}
      />

      {/* Create Note Modal */}
      <CreateNoteModal
        isOpen={isCreateNoteModalOpen}
        onClose={() => setIsCreateNoteModalOpen(false)}
        students={coach?.students?.items || []}
        onCreateNote={handleCreateNote}
      />
    </div>
  );
}
