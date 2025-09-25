import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { eightbaseService } from '../services/8baseService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Activity,
  Server,
  Database,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Wifi,
  Shield,
  Zap,
  Loader2,
  Eye,
  EyeOff,
  Settings,
  BarChart3
} from 'lucide-react';

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeConnections: number;
  databaseConnections: number;
  apiResponseTime: number;
  errorRate: number;
  uptime: number;
  lastBackup: string;
  systemStatus: 'healthy' | 'warning' | 'critical';
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export function SuperAdminSystemMonitor() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (user?.role === 'super_admin') {
      loadSystemMetrics();
    }
  }, [user, autoRefresh]);

  const loadSystemMetrics = async () => {
    try {
      // Simulate system metrics (in a real app, these would come from your backend)
      const mockMetrics: SystemMetrics = {
        cpuUsage: Math.floor(Math.random() * 30) + 20, // 20-50%
        memoryUsage: Math.floor(Math.random() * 40) + 30, // 30-70%
        diskUsage: Math.floor(Math.random() * 20) + 60, // 60-80%
        networkLatency: Math.floor(Math.random() * 50) + 10, // 10-60ms
        activeConnections: Math.floor(Math.random() * 100) + 50, // 50-150
        databaseConnections: Math.floor(Math.random() * 20) + 10, // 10-30
        apiResponseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
        errorRate: Math.random() * 2, // 0-2%
        uptime: Math.floor(Math.random() * 100) + 900, // 900-1000 hours
        lastBackup: new Date(Date.now() - Math.random() * 86400000).toISOString(), // Within last 24h
        systemStatus: Math.random() > 0.8 ? 'warning' : 'healthy'
      };

      setMetrics(mockMetrics);
      
      // Generate mock alerts
      const mockAlerts: SystemAlert[] = [
        {
          id: '1',
          type: 'info',
          title: 'System Backup Completed',
          message: 'Daily backup completed successfully at 02:00 AM',
          timestamp: new Date().toISOString(),
          severity: 'low'
        },
        {
          id: '2',
          type: 'warning',
          title: 'High Memory Usage',
          message: 'Memory usage is above 70% threshold',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          severity: 'medium'
        },
        {
          id: '3',
          type: 'success',
          title: 'Database Optimization',
          message: 'Database performance optimization completed',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          severity: 'low'
        }
      ];

      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Failed to load system metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Activity className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatUptime = (hours: number) => {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">
            Only Super Admins can access system monitoring.
          </p>
        </div>
      </div>
    );
  }

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-brand-blue" />
          <span className="text-black dark:text-white">Loading system metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="flex items-center gap-2 text-black dark:text-white">
            <Server className="h-6 w-6 text-brand-blue" />
            System Monitor
          </h2>
          <p className="text-muted-foreground">
            Real-time system health and performance monitoring
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
          <Button 
            variant={autoRefresh ? 'default' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button variant="outline" onClick={loadSystemMetrics}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">System Status</p>
                <p className="text-2xl font-bold">{metrics.systemStatus.toUpperCase()}</p>
              </div>
              <div className={`p-2 rounded-full ${getStatusColor(metrics.systemStatus)}`}>
                {metrics.systemStatus === 'healthy' ? (
                  <CheckCircle className="h-6 w-6" />
                ) : metrics.systemStatus === 'warning' ? (
                  <AlertTriangle className="h-6 w-6" />
                ) : (
                  <XCircle className="h-6 w-6" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">{formatUptime(metrics.uptime)}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Connections</p>
                <p className="text-2xl font-bold">{metrics.activeConnections}</p>
              </div>
              <Wifi className="h-8 w-8 text-green-600 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Error Rate</p>
                <p className="text-2xl font-bold">{metrics.errorRate.toFixed(2)}%</p>
              </div>
              <Zap className="h-8 w-8 text-orange-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resource Usage</CardTitle>
            <CardDescription>
              Current system resource utilization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm text-muted-foreground">{metrics.cpuUsage}%</span>
              </div>
              <Progress value={metrics.cpuUsage} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-muted-foreground">{metrics.memoryUsage}%</span>
              </div>
              <Progress value={metrics.memoryUsage} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Disk Usage</span>
                <span className="text-sm text-muted-foreground">{metrics.diskUsage}%</span>
              </div>
              <Progress value={metrics.diskUsage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network & Database</CardTitle>
            <CardDescription>
              Network and database performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600">{metrics.networkLatency}ms</div>
                <div className="text-xs text-muted-foreground">Network Latency</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">{metrics.apiResponseTime}ms</div>
                <div className="text-xs text-muted-foreground">API Response</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-purple-50 rounded">
                <div className="text-2xl font-bold text-purple-600">{metrics.databaseConnections}</div>
                <div className="text-xs text-muted-foreground">DB Connections</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded">
                <div className="text-2xl font-bold text-orange-600">{metrics.activeConnections}</div>
                <div className="text-xs text-muted-foreground">Active Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
          <CardDescription>
            Recent system notifications and warnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <p className="text-muted-foreground">No active alerts</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <Alert key={alert.id}>
                  <div className="flex items-start space-x-3">
                    <div className={`p-1 rounded ${getSeverityColor(alert.severity)}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{alert.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <AlertDescription className="mt-1">
                        {alert.message}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics (Conditional) */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed System Information</CardTitle>
            <CardDescription>
              Advanced system metrics and configuration details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Backup Information</h4>
                <p className="text-sm text-muted-foreground">
                  Last backup: {new Date(metrics.lastBackup).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: <span className="text-green-600">Successful</span>
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Performance Trends</h4>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm">CPU usage trending down</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Memory usage increasing</span>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Security Status</h4>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm">All systems secure</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Last security scan: 2 hours ago
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common system maintenance tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              <Database className="mr-2 h-4 w-4" />
              Backup Database
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              System Settings
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              Performance Report
            </Button>
            <Button variant="outline" size="sm">
              <Shield className="mr-2 h-4 w-4" />
              Security Scan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 