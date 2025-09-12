import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { eightbaseService } from '../services/8baseService';
import { Lead, MessageTemplate, EngagementTag, EngagementTagType, EngagementTagInfo, MessageTemplateType } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { 
  Plus, 
  MessageSquare, 
  Instagram, 
  Copy, 
  Edit,
  Check,
  X,
  MessageCircle,
  PhoneCall,
  Users,
  Target,
  ChevronDown,
  ChevronUp,
  Mail,
  Save,
  Filter,
  Download,
  Upload,
  Settings2,
  Shuffle,
  Settings,
  Wand2,
  Eye,
  Phone
} from 'lucide-react';

// Enhanced engagement tag configuration that matches the image design
const ENGAGEMENT_TAG_CONFIG: Record<EngagementTagType, EngagementTagInfo> = {
  follow_day_engagement: {
    type: 'follow_day_engagement',
    label: 'Follow Day',
    description: 'Engaged with their content on follow day',
    color: 'bg-blue-600 text-white',
    icon: '👥'
  },
  engagement_day_1: {
    type: 'engagement_day_1',
    label: 'Day 1',
    description: 'Engaged with content on day 1',
    color: 'bg-green-600 text-white',
    icon: '📱'
  },
  engagement_day_2: {
    type: 'engagement_day_2',
    label: 'Day 2',
    description: 'Engaged with content on day 2',
    color: 'bg-purple-600 text-white',
    icon: '💬'
  },
  dm_sent: {
    type: 'dm_sent',
    label: 'DM Sent',
    description: 'Direct message sent',
    color: 'bg-orange-600 text-white',
    icon: '📩'
  },
  initial_call_done: {
    type: 'initial_call_done',
    label: 'Initial Call',
    description: 'First call completed',
    color: 'bg-red-600 text-white',
    icon: '📞'
  },
  follow_up_call_done: {
    type: 'follow_up_call_done',
    label: 'Follow-up Call',
    description: 'Follow-up call completed',
    color: 'bg-blue-500 text-white',
    icon: '🔄'
  },
  follow_up_dm_sent: {
    type: 'follow_up_dm_sent',
    label: 'Follow-up DM',
    description: 'Follow-up message sent',
    color: 'bg-pink-600 text-white',
    icon: '📬'
  }
};

interface EnhancedStudentLeadManagementProps {
  // Optional props for coach view
  studentId?: string;
  isCoachView?: boolean;
}

export function EnhancedStudentLeadManagement({ studentId, isCoachView = false }: EnhancedStudentLeadManagementProps) {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [templatesDialogOpen, setTemplatesDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [expandedLeads, setExpandedLeads] = useState<Set<string>>(new Set());

  // Form state for new lead
  const [formData, setFormData] = useState<Partial<Lead>>({
    lead_name: '',
    email: '',
    phone: '',
    instagram_handle: '',
    lead_source: 'Instagram',
    status: 'new',
    engagementTag: [],
    script_components: {
      intro: '',
      hook: '',
      body1: '',
      body2: '',
      ending: ''
    }
  });

  const loadData = useCallback(async () => {
    const targetUserId = isCoachView && studentId ? studentId : user?.id;
    if (!targetUserId) return;
    
    setLoading(true);
    try {
      const [leadsData, templatesData] = await Promise.all([
        eightbaseService.getStudentLeads(targetUserId),
        eightbaseService.getMessageTemplates()
      ]);
      
      setLeads(leadsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Failed to load leads:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, studentId, isCoachView]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Template variations organized by type
  const templateVariations = useMemo(() => {
    const variations: Record<MessageTemplateType, MessageTemplate[]> = {
      intro: [],
      hook: [],
      body1: [],
      body2: [],
      ending: []
    };

    templates.forEach(template => {
      if (variations[template.type]) {
        variations[template.type].push(template);
      }
    });

    // Sort each type by variation number
    Object.keys(variations).forEach(type => {
      variations[type as MessageTemplateType].sort((a, b) => a.variation_number - b.variation_number);
    });

    return variations;
  }, [templates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUserId = isCoachView && studentId ? studentId : user?.id;
    if (!targetUserId || !formData.lead_name) return;

    try {
      const leadData = {
        ...formData,
        user_id: targetUserId,
        engagementTag: formData.engagementTag || [],
        message_sent: false,
        followed_back: false,
        followed_up: false
      } as Omit<Lead, 'id' | 'created_at' | 'updated_at'>;

      await eightbaseService.createLead(leadData);
      await loadData();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create lead:', error);
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
      engagementTag: [],
      script_components: {
        intro: '',
        hook: '',
        body1: '',
        body2: '',
        ending: ''
      }
    });
  };

  const toggleEngagementTag = async (leadId: string, tagType: EngagementTagType) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const existingTag = lead.engagementTag.find(t => t.type === tagType);
    
    try {
      if (existingTag && existingTag.id) {
        await eightbaseService.removeEngagementTag(existingTag.id);
      } else {
        const newTag: EngagementTag = {
          type: tagType,
          completed_date: new Date().toISOString()
        };
        await eightbaseService.addEngagementTag(leadId, newTag);
      }
      await loadData();
    } catch (error) {
      console.error('Failed to toggle engagement tag:', error);
    }
  };

  const generateRandomScript = async () => {
    try {
      const randomScript = await eightbaseService.generateRandomScript();
      return randomScript;
    } catch (error) {
      console.error('Failed to generate random script:', error);
      return {
        intro: '',
        hook: '',
        body1: '',
        body2: '',
        ending: ''
      };
    }
  };

  const generateScript = (lead: Lead) => {
    const script = Object.values(lead.script_components).join('\n\n');
    return script;
  };

  const applyRandomScriptToLead = async (leadId: string) => {
    try {
      const randomScript = await generateRandomScript();
      await eightbaseService.updateLead(leadId, {
        script_components: randomScript
      });
      await loadData();
    } catch (error) {
      console.error('Failed to apply random script:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleLeadExpanded = (leadId: string) => {
    const newExpanded = new Set(expandedLeads);
    if (newExpanded.has(leadId)) {
      newExpanded.delete(leadId);
    } else {
      newExpanded.add(leadId);
    }
    setExpandedLeads(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: 'New', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
      contacted: { label: 'Contacted', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      qualified: { label: 'Qualified', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      converted: { label: 'Converted', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      lost: { label: 'Lost', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getSourceIcon = (source: string) => {
    const icons: Record<string, string> = {
      'Instagram': '📱',
      'Facebook': '📘',
      'Zillow': '🏠',
      'Realtor.com': '🏡',
      'Referral': '👥',
      'Website': '🌐',
      'Other': '📋'
    };
    return icons[source] || '📋';
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 animate-pulse text-blue-600" />
          <span>Loading leads...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Matches image layout */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            Lead Management & Outreach
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage outreach leads and engagement progress with potential clients
          </p>
        </div>
        {(!isCoachView || user?.role === 'coach') && (
          <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        )}
      </div>

      {/* Content Layout - Matches image design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Leads Panel - Left Side (2/3 width) */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">Active Leads</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Click on any lead to expand and manage engagement progress
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm font-medium">
                    {leads.length} Total
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {leads.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No leads yet.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Add your first lead to start tracking outreach progress.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {leads.map((lead) => {
                    const isExpanded = expandedLeads.has(lead.id);
                    return (
                      <div key={lead.id} className="group">
                        {/* Lead Header Row */}
                        <div 
                          className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          onClick={() => toggleLeadExpanded(lead.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3">
                                  <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">{lead.lead_name}</h3>
                                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                      <div className="flex items-center space-x-1">
                                        <span>{getSourceIcon(lead.lead_source)}</span>
                                        <span>{lead.lead_source}</span>
                                      </div>
                                      <span>•</span>
                                      <span>Added {new Date(lead.created_at).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              {/* Status Badge */}
                              {getStatusBadge(lead.status)}
                              
                              {/* Engagement Tags Summary */}
                              <div className="flex flex-wrap gap-1">
                                {lead.engagementTag.slice(0, 2).map((tag) => {
                                  const config = ENGAGEMENT_TAG_CONFIG[tag.type];
                                  return (
                                    <Badge 
                                      key={tag.type} 
                                      className={`text-xs ${config.color}`}
                                    >
                                      {config.icon}
                                    </Badge>
                                  );
                                })}
                                {lead.engagementTag.length > 2 && (
                                  <Badge className="text-xs bg-gray-100 text-gray-600">
                                    +{lead.engagementTag.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 space-y-4">
                            
                            {/* Contact Information */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                                <Users className="h-4 w-4" />
                                Contact Information
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                {lead.email && (
                                  <div className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-700 rounded border">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-900 dark:text-white">{lead.email}</span>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => copyToClipboard(lead.email!)}
                                      className="ml-auto h-6 w-6 p-0"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                                {lead.phone && (
                                  <div className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-700 rounded border">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-900 dark:text-white">{formatPhoneNumber(lead.phone)}</span>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => copyToClipboard(lead.phone!)}
                                      className="ml-auto h-6 w-6 p-0"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                                {lead.instagram_handle && (
                                  <div className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-700 rounded border">
                                    <Instagram className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-900 dark:text-white">{lead.instagram_handle}</span>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => copyToClipboard(lead.instagram_handle!)}
                                      className="ml-auto h-6 w-6 p-0"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Engagement Progress - Matches image design */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                                <Target className="h-4 w-4" />
                                Engagement Progress
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {Object.values(ENGAGEMENT_TAG_CONFIG).map((config) => {
                                  const isCompleted = lead.engagementTag.some(t => t.type === config.type);
                                  const completedTag = lead.engagementTag.find(t => t.type === config.type);
                                  
                                  return (
                                    <div
                                      key={config.type}
                                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                        isCompleted 
                                          ? `${config.color} border-current shadow-sm` 
                                          : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                                      }`}
                                      onClick={() => toggleEngagementTag(lead.id, config.type)}
                                    >
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-lg">{config.icon}</span>
                                          <span className="text-sm font-medium">{config.label}</span>
                                        </div>
                                        {isCompleted && <Check className="h-4 w-4" />}
                                      </div>
                                      {completedTag && (
                                        <div className="text-xs opacity-90">
                                          {new Date(completedTag.completed_date).toLocaleDateString()}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* DM Script Section */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium flex items-center gap-2 text-gray-900 dark:text-white">
                                  <MessageCircle className="h-4 w-4" />
                                  DM Script
                                </h4>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyRandomScriptToLead(lead.id)}
                                  >
                                    <Shuffle className="mr-1 h-3 w-3" />
                                    Random
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(generateScript(lead))}
                                  >
                                    <Copy className="mr-1 h-3 w-3" />
                                    Copy
                                  </Button>
                                </div>
                              </div>
                              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border text-sm whitespace-pre-line min-h-[100px]">
                                {generateScript(lead) || 'No script created yet. Click "Random" to generate one automatically using your DM templates.'}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Side (1/3 width) */}
        <div className="space-y-4">
          
          {/* Quick DM Templates Card */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-blue-600" />
                    Quick DM Templates
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
                    5 variations per section - randomly mixed
                  </CardDescription>
                </div>
                <Dialog open={templatesDialogOpen} onOpenChange={setTemplatesDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Manage DM Templates</DialogTitle>
                      <DialogDescription>
                        Edit your 5 variations for each message section to avoid spam detection.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Template management content will be implemented here.
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    const script = await generateRandomScript();
                    copyToClipboard(Object.values(script).join('\n\n'));
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Shuffle className="mr-2 h-4 w-4" />
                  Generate Random Script
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>How it works:</strong> Each script randomly selects 1 of 5 variations from each section to create unique messages.
                </p>
                
                {Object.entries(templateVariations).map(([type, templates]) => (
                  templates.length > 0 && (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm capitalize text-gray-900 dark:text-white">{type} ({templates.length})</h4>
                        <Badge variant="outline" className="text-xs">
                          {templates.length}/5
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 border rounded p-2 bg-gray-50 dark:bg-gray-700">
                        {templates[0]?.content.substring(0, 60)}...
                      </div>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Engagement Guide Card */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Engagement Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="text-sm space-y-3">
                <div className="flex items-start gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <Badge className="bg-blue-100 text-blue-800 text-xs shrink-0">👥 Follow Day</Badge>
                  <span className="text-xs text-gray-700 dark:text-gray-300">Like 2-3 recent posts, watch their stories</span>
                </div>
                <div className="flex items-start gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <Badge className="bg-green-100 text-green-800 text-xs shrink-0">📱 Day 1</Badge>
                  <span className="text-xs text-gray-700 dark:text-gray-300">Comment on their latest post</span>
                </div>
                <div className="flex items-start gap-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <Badge className="bg-purple-100 text-purple-800 text-xs shrink-0">💬 Day 2</Badge>
                  <span className="text-xs text-gray-700 dark:text-gray-300">View their stories, react to a few</span>
                </div>
                <div className="flex items-start gap-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                  <Badge className="bg-orange-100 text-orange-800 text-xs shrink-0">📩 DM</Badge>
                  <span className="text-xs text-gray-700 dark:text-gray-300">Send personalized message</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Add Lead Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Add New Lead</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Add a new potential client to your outreach pipeline.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lead_name" className="text-gray-900 dark:text-white">Lead Name *</Label>
                <Input
                  id="lead_name"
                  value={formData.lead_name || ''}
                  onChange={(e) => setFormData({...formData, lead_name: e.target.value})}
                  placeholder="Jennifer Martinez"
                  required
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-900 dark:text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="jennifer@coldwellbanker.com"
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="text-gray-900 dark:text-white">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="(555) 123-4567"
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="instagram_handle" className="text-gray-900 dark:text-white">Instagram Handle</Label>
                <Input
                  id="instagram_handle"
                  value={formData.instagram_handle || ''}
                  onChange={(e) => setFormData({...formData, instagram_handle: e.target.value})}
                  placeholder="@jenmartinez_realtor"
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source" className="text-gray-900 dark:text-white">Source</Label>
                <Select 
                  value={formData.lead_source || 'Instagram'} 
                  onValueChange={(value) => setFormData({...formData, lead_source: value})}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectItem value="Instagram" className="text-gray-900 dark:text-white">📱 Instagram</SelectItem>
                    <SelectItem value="Facebook" className="text-gray-900 dark:text-white">📘 Facebook</SelectItem>
                    <SelectItem value="Zillow" className="text-gray-900 dark:text-white">🏠 Zillow</SelectItem>
                    <SelectItem value="Realtor.com" className="text-gray-900 dark:text-white">🏡 Realtor.com</SelectItem>
                    <SelectItem value="Referral" className="text-gray-900 dark:text-white">👥 Referral</SelectItem>
                    <SelectItem value="Website" className="text-gray-900 dark:text-white">🌐 Website</SelectItem>
                    <SelectItem value="Other" className="text-gray-900 dark:text-white">📋 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status" className="text-gray-900 dark:text-white">Status</Label>
                <Select 
                  value={formData.status || 'new'} 
                  onValueChange={(value) => setFormData({...formData, status: value as any})}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectItem value="new" className="text-gray-900 dark:text-white">New</SelectItem>
                    <SelectItem value="contacted" className="text-gray-900 dark:text-white">Contacted</SelectItem>
                    <SelectItem value="qualified" className="text-gray-900 dark:text-white">Qualified</SelectItem>
                    <SelectItem value="converted" className="text-gray-900 dark:text-white">Converted</SelectItem>
                    <SelectItem value="lost" className="text-gray-900 dark:text-white">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Lead
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
