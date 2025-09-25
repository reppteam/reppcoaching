import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { eightbaseService } from "../services/8baseService";
import { User } from "../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  GraduationCap,
  Shield,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Target,
  Tag,
  X,
  Settings,
  Lock,
  Unlock,
  Crown,
  ShieldCheck,
  Users2,
} from "lucide-react";

export function CoachManagerDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersData = await eightbaseService.getAllUsersWithDetails();
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter users to show only Coach and Coach Manager roles
  const coachAndManagerUsers = users.filter(user => {
    const userRoles = user.role;
    return userRoles === 'coach' || userRoles === 'coach_manager';
  });

  console.log("Total users:", users.length);
  console.log("Coach and manager users:", coachAndManagerUsers.length);

  const filteredUsers = coachAndManagerUsers.filter((user) => {
    const matchesSearch =
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.is_active !== false) ||
      (statusFilter === "inactive" && user.is_active === false);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const students = users.filter((u) => u.role === "user");
  const coaches = coachAndManagerUsers.filter((u) => {
    const userRoles = u.roles?.items || [];
    return userRoles.some((role: any) => role.name === "Coach");
  });
  const coachManagers = coachAndManagerUsers.filter((u) => {
    const userRoles = u.roles?.items || [];
    return userRoles.some(
      (role: any) =>
        role.name === "coach_manager" ||
        role.name === "Coach Manager" ||
        role.name === "Administrator"
    );
  });
  const superAdmins = users.filter((u) => u.role === "super_admin");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-5 w-5 animate-pulse text-brand-blue" />
          <span className="text-black dark:text-white">Loading coach manager dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-black dark:text-white">
          <ShieldCheck className="h-6 w-6 text-brand-blue" />
          Coach Manager Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage coaches and coach managers, monitor performance and assignments
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  Total Coaches & Managers
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {coachAndManagerUsers.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-foreground">
                  {
                    coachAndManagerUsers.filter((u) => u.is_active !== false)
                      .length
                  }
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Coaches</p>
                <p className="text-2xl font-bold text-foreground">
                  {coaches.length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-600 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Coach Managers</p>
                <p className="text-2xl font-bold text-foreground">
                  {coachManagers.length}
                </p>
              </div>
              <ShieldCheck className="h-8 w-8 text-purple-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>Coach Management</CardTitle>
          <CardDescription>
            Search, filter, and manage coaches and coach managers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search Users</Label>
              <Input
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role-filter">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">Students</SelectItem>
                  <SelectItem value="coach">Coaches</SelectItem>
                  <SelectItem value="coach_manager">Coach Managers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Users Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Account Type</TableHead>
                {/* <TableHead>Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                        <Badge
                          key={user.role}
                          className={
                            user.role === "coach"
                              ? "bg-green-100 text-green-800"
                              : user.role === "coach_manager"
                              ? "bg-blue-100 text-blue-800"
                              : user.role === "super_admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {user.role}
                        </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.is_active !== false
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {user.is_active !== false ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.has_paid
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {user.has_paid ? "Paid" : "Free"}
                    </Badge>
                  </TableCell>
                  {/* <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
