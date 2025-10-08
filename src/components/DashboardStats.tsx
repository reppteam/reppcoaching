import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Users, 
  DollarSign, 
  Target,
  Activity,
  Calendar
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

function StatCard({ title, value, icon, trend, subtitle }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2 text-xs">
            {trend.isPositive ? (
              <>
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-green-600 font-medium">+{trend.value}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                <span className="text-red-600 font-medium">{trend.value}%</span>
              </>
            )}
            <span className="text-muted-foreground ml-1">from last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  stats: {
    totalReports: number;
    totalLeads: number;
    reportsThisWeek: number;
    leadsThisWeek: number;
    totalRevenue: number;
    avgRevenue: number;
    activeLeads: number;
    convertedLeads: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Weekly Reports"
        value={stats.reportsThisWeek}
        icon={<FileText className="h-4 w-4" />}
        subtitle={`${stats.totalReports} total reports`}
      />
      <StatCard
        title="New Leads This Week"
        value={stats.leadsThisWeek}
        icon={<Users className="h-4 w-4" />}
        subtitle={`${stats.totalLeads} total leads`}
      />
      <StatCard
        title="Total Revenue"
        value={`$${stats.totalRevenue.toLocaleString()}`}
        icon={<DollarSign className="h-4 w-4" />}
        subtitle={`Avg: $${Math.round(stats.avgRevenue).toLocaleString()}`}
      />
      <StatCard
        title="Active Leads"
        value={stats.activeLeads}
        icon={<Activity className="h-4 w-4" />}
        subtitle={`${stats.convertedLeads} converted`}
      />
    </div>
  );
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
}

function QuickActionCard({ title, description, icon, onClick, color }: QuickActionProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 rounded-lg ${color} flex items-center justify-center text-white`}>
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickActionsProps {
  onSubmitReport: () => void;
  onAddLead: () => void;
  onViewGoals: () => void;
  onCalculator: () => void;
}

export function QuickActions({ 
  onSubmitReport, 
  onAddLead, 
  onViewGoals,
  onCalculator 
}: QuickActionsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <QuickActionCard
        title="Submit Weekly Report"
        description="Track your weekly progress and metrics"
        icon={<FileText className="h-6 w-6" />}
        onClick={onSubmitReport}
        color="bg-blue-500"
      />
      <QuickActionCard
        title="Add New Lead"
        description="Track a new potential client"
        icon={<Users className="h-6 w-6" />}
        onClick={onAddLead}
        color="bg-green-500"
      />
      <QuickActionCard
        title="View Goals"
        description="Check your progress and set new targets"
        icon={<Target className="h-6 w-6" />}
        onClick={onViewGoals}
        color="bg-purple-500"
      />
      <QuickActionCard
        title="Profit Calculator"
        description="Calculate your service pricing and margins"
        icon={<DollarSign className="h-6 w-6" />}
        onClick={onCalculator}
        color="bg-orange-500"
      />
    </div>
  );
}

