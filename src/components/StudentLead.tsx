import React, { useState, useEffect } from 'react';
import { eightbaseService } from '../services/8baseService';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  Plus, 
  MessageSquare, 
  Calendar, 
  Phone, 
  Instagram, 
  Users, 
  Target,
  Edit,
  Eye,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  UserPlus,
  MessageCircle,
  PhoneCall,
  Mail
} from 'lucide-react';
import { Lead, EngagementTag, EngagementTagType } from '../types';

export const StudentLead: React.FC = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingLead, setAddingLead] = useState(false);
  const [editingLead, setEditingLead] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    lead_name: '',
    email: '',
    phone: '',
    instagram_handle: '',
    lead_source: 'Instagram',
    status: 'new' as 'new' | 'contacted' | 'qualified' | 'converted' | 'lost',
    engagementTag: [] as EngagementTag[]
  });

  useEffect(() => {
    if (user?.id) {
      loadLeads();
    }
  }, [user?.id]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await eightbaseService.getStudentLeads(user?.id || '');
      setLeads(data);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const leadData = {
        lead_name: formData.lead_name,
        email: formData.email,
        phone: formData.phone,
        instagram_handle: formData.instagram_handle,
        lead_source: formData.lead_source,
        status: formData.status,
        user_id: user.id,
        message_sent: false,
        followed_back: false,
        followed_up: false,
        engagementTag: [], // Initialize as empty array
        script_components: {
          intro: '',
          hook: '',
          body1: '',
          body2: '',
          ending: ''
        }
      };

      const lead = await eightbaseService.createLead(leadData);
      setLeads([lead, ...leads]);
      setAddingLead(false);
      resetForm();
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  const handleUpdate = async (leadId: string) => {
    try {
      // Only include the basic lead fields that can be updated
      // engagementTag field is completely excluded from updates
      const updateData = {
        lead_name: formData.lead_name,
        email: formData.email,
        phone: formData.phone,
        instagram_handle: formData.instagram_handle,
        lead_source: formData.lead_source,
        status: formData.status
      };
      
      const updatedLead = await eightbaseService.updateLead(leadId, updateData);
      setLeads(leads.map(l => l.id === leadId ? updatedLead : l));
      setEditingLead(null);
      resetForm();
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      lead_name: '',
      email: '',
      phone: '',
      instagram_handle: '',
      lead_source: 'Instagram',
      status: 'new',
      engagementTag: []
    });
  };

  const toggleEngagementTag = async (leadId: string, tagType: EngagementTagType) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    try {
      let updateData: any = {};
      
      // Map engagement tag types to lead boolean fields
      switch (tagType) {
        case 'dm_sent':
          updateData.message_sent = !lead.message_sent;
          break;
        case 'follow_day_engagement':
          updateData.followed_back = !lead.followed_back;
          break;
        case 'follow_up_dm_sent':
          updateData.followed_up = !lead.followed_up;
          break;
        default:
          console.warn('Unsupported engagement tag type for student leads:', tagType);
          return;
      }
      
      await eightbaseService.updateLead(leadId, updateData);
      await loadLeads();
    } catch (error) {
      console.error('Failed to toggle engagement tag:', error);
    }
  };

  // Example function showing how to update engagementTag field directly (if needed)
  const updateEngagementTagField = async (leadId: string, engagementTags: EngagementTag[]) => {
    try {
      const updateData: any = {
        // Basic fields
        lead_name: formData.lead_name,
        email: formData.email,
        phone: formData.phone,
        instagram_handle: formData.instagram_handle,
        lead_source: formData.lead_source,
        status: formData.status
      };

      const updatedLead = await eightbaseService.updateLead(leadId, updateData);
      setLeads(leads.map(l => l.id === leadId ? updatedLead : l));
    } catch (error) {
      console.error('Error updating engagement tag field:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      qualified: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      converted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return variants[status as keyof typeof variants] || variants.new;
  };

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'facebook': return <MessageSquare className="h-4 w-4" />;
      case 'referral': return <Users className="h-4 w-4" />;
      case 'website': return <Target className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lead Management</h2>
          <p className="text-muted-foreground">
            Track and manage your potential clients
          </p>
        </div>
        <Dialog open={addingLead} onOpenChange={setAddingLead}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
              <DialogDescription>
                Add a new potential client to your pipeline
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lead_name">Lead Name *</Label>
                  <Input
                    id="lead_name"
                    value={formData.lead_name}
                    onChange={(e) => setFormData({...formData, lead_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lead_source">Lead Source</Label>
                  <Select value={formData.lead_source} onValueChange={(value) => setFormData({...formData, lead_source: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="instagram_handle">Instagram Handle</Label>
                <Input
                  id="instagram_handle"
                  value={formData.instagram_handle}
                  onChange={(e) => setFormData({...formData, instagram_handle: e.target.value})}
                  placeholder="@username"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost') => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setAddingLead(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Lead</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
            <p className="text-xs text-muted-foreground">
              {leads.filter(l => l.status === 'new').length} new leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {leads.filter(l => l.status === 'converted').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {leads.length > 0 ? ((leads.filter(l => l.status === 'converted').length / leads.length) * 100).toFixed(1) : 0}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pipeline</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.filter(l => ['new', 'contacted', 'qualified'].includes(l.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              In progress leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Source</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.length > 0 ? 
                Object.entries(
                  leads.reduce((acc, lead) => {
                    acc[lead.lead_source] = (acc[lead.lead_source] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A' : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Most effective source
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Leads</CardTitle>
          <CardDescription>
            Manage your lead pipeline and track progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium">{lead.lead_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Added {new Date(lead.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getSourceIcon(lead.lead_source)}
                      <span className="text-sm">{lead.lead_source}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {lead.email && (
                        <div className="flex items-center gap-1 text-sm">
                          <MessageCircle className="h-3 w-3" />
                          {lead.email}
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <PhoneCall className="h-3 w-3" />
                          {lead.phone}
                        </div>
                      )}
                      {lead.instagram_handle && (
                        <div className="flex items-center gap-1 text-sm">
                          <Instagram className="h-3 w-3" />
                          {lead.instagram_handle}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(lead.status)}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {lead.followed_back && (
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                          Follow Day
                        </Badge>
                      )}
                      {lead.message_sent && (
                        <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800">
                          DM Sent
                        </Badge>
                      )}
                      {lead.followed_up && (
                        <Badge variant="outline" className="text-xs bg-pink-100 text-pink-800">
                          Follow-up DM
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setFormData({
                            lead_name: lead.lead_name,
                            email: lead.email || '',
                            phone: lead.phone || '',
                            instagram_handle: lead.instagram_handle || '',
                            lead_source: lead.lead_source,
                            status: lead.status,
                            engagementTag: [] // Initialize as empty array since we don't edit engagement tags here
                          });
                          setEditingLead(lead.id);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleEngagementTag(lead.id, 'follow_day_engagement')}
                        title="Mark Follow Day"
                        className={lead.followed_back ? 'bg-green-100 text-green-800' : ''}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleEngagementTag(lead.id, 'dm_sent')}
                        title="Mark DM Sent"
                        className={lead.message_sent ? 'bg-orange-100 text-orange-800' : ''}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleEngagementTag(lead.id, 'follow_up_dm_sent')}
                        title="Mark Follow-up DM"
                        className={lead.followed_up ? 'bg-pink-100 text-pink-800' : ''}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Lead Dialog */}
      <Dialog open={!!editingLead} onOpenChange={() => setEditingLead(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogDescription>
              Update lead information and status
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_lead_name">Lead Name</Label>
                <Input
                  id="edit_lead_name"
                  value={formData.lead_name}
                  onChange={(e) => setFormData({...formData, lead_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_lead_source">Lead Source</Label>
                <Select value={formData.lead_source} onValueChange={(value) => setFormData({...formData, lead_source: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_phone">Phone</Label>
                <Input
                  id="edit_phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_instagram_handle">Instagram Handle</Label>
              <Input
                id="edit_instagram_handle"
                value={formData.instagram_handle}
                onChange={(e) => setFormData({...formData, instagram_handle: e.target.value})}
                placeholder="@username"
              />
            </div>

            <div>
              <Label htmlFor="edit_status">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost') => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingLead(null)}>
                Cancel
              </Button>
              <Button onClick={() => editingLead && handleUpdate(editingLead)}>
                Update Lead
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
