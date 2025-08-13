import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { eightbaseService } from '../services/8baseService';
import { Lead, MessageTemplate, EngagementTag, EngagementTagType, EngagementTagInfo, MessageTemplateType, TemplateVariationSet } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { 
  Plus, 
  MessageSquare, 
  Calendar, 
  Phone, 
  Instagram, 
  Zap, 
  Copy, 
  Edit,
  Check,
  X,
  Hash,
  MessageCircle,
  PhoneCall,
  Users,
  Target,
  ChevronDown,
  ChevronUp,
  Clock,
  Mail,
  Save,
  Filter,
  SortAsc,
  SortDesc,
  Download,
  Upload,
  FileDown,
  FileUp,
  Settings2,
  ArrowUpDown,
  Shuffle,
  Settings,
  Wand2,
  Eye
} from 'lucide-react';

// Engagement tag configuration - matches 8base schema and image design
const ENGAGEMENT_TAG_CONFIG: Record<EngagementTagType, EngagementTagInfo> = {
  follow_day_engagement: {
    type: 'follow_day_engagement',
    label: 'Follow Day',
    description: 'Engaged with their content on follow day',
    color: 'bg-blue-600',
    icon: '👥'
  },
  engagement_day_1: {
    type: 'engagement_day_1',
    label: 'Day 1',
    description: 'Engaged with content on day 1',
    color: 'bg-green-600',
    icon: '📱'
  },
  engagement_day_2: {
    type: 'engagement_day_2',
    label: 'Day 2',
    description: 'Engaged with content on day 2',
    color: 'bg-purple-600',
    icon: '💬'
  },
  dm_sent: {
    type: 'dm_sent',
    label: 'DM Sent',
    description: 'Direct message sent',
    color: 'bg-orange-600',
    icon: '📩'
  },
  initial_call_done: {
    type: 'initial_call_done',
    label: 'Initial Call',
    description: 'First call completed',
    color: 'bg-red-600',
    icon: '📞'
  },
  follow_up_call_done: {
    type: 'follow_up_call_done',
    label: 'Follow-up Call',
    description: 'Follow-up call completed',
    color: 'bg-blue-500',
    icon: '🔄'
  },
  follow_up_dm_sent: {
    type: 'follow_up_dm_sent',
    label: 'Follow-up DM',
    description: 'Follow-up message sent',
    color: 'bg-pink-600',
    icon: '📬'
  }
};

type SortOption = 'created_asc' | 'created_desc' | 'contact_asc' | 'contact_desc';

interface LeadFilters {
  sources: string[];
  statuses: string[];
  engagementTags: EngagementTagType[];
}

export function Leads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scriptDialogOpen, setScriptDialogOpen] = useState(false);
  const [templatesDialogOpen, setTemplatesDialogOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [expandedLeads, setExpandedLeads] = useState<Set<string>>(new Set());
  const [editingField, setEditingField] = useState<{leadId: string, field: string} | null>(null);
  const [tempValue, setTempValue] = useState('');

  // Template management
  const [editingTemplates, setEditingTemplates] = useState<Record<string, string>>({});

  // Sorting and filtering state
  const [sortBy, setSortBy] = useState<SortOption>('created_desc');
  const [filters, setFilters] = useState<LeadFilters>({
    sources: [],
    statuses: [],
    engagementTags: []
  });

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<Partial<Lead>[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  // Form states
  const [formData, setFormData] = useState<Partial<Lead>>({
    lead_name: '',
    email: '',
    phone: '',
    instagram_handle: '',
    lead_source: 'Instagram',
    status: 'new',
    engagement_tags: [],
    script_components: {
      intro: '',
      hook: '',
      body1: '',
      body2: '',
      ending: ''
    }
  });

  const loadData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [leadsData, templatesData] = await Promise.all([
        user.role === 'user' ? eightbaseService.getLeads(user.id) : eightbaseService.getLeadsByCoach(user.id),
        eightbaseService.getMessageTemplates()
      ]);
      
      setLeads(leadsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Failed to load leads:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

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

  // Computed values for filters
  const availableSources = useMemo(() => {
    const sources = Array.from(new Set(leads.map(lead => lead.lead_source)));
    return sources.sort();
  }, [leads]);

  const availableStatuses = useMemo(() => {
    const statuses = Array.from(new Set(leads.map(lead => lead.status)));
    return statuses.sort();
  }, [leads]);

  const availableEngagementTags = useMemo(() => {
    const tags = new Set<EngagementTagType>();
    leads.forEach(lead => {
      lead.engagement_tags.forEach(tag => tags.add(tag.type));
    });
    return Array.from(tags).sort();
  }, [leads]);

  // Filtered and sorted leads
  const filteredAndSortedLeads = useMemo(() => {
    let filtered = [...leads];

    // Apply filters
    if (filters.sources.length > 0) {
      filtered = filtered.filter(lead => filters.sources.includes(lead.lead_source));
    }
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(lead => filters.statuses.includes(lead.status));
    }
    if (filters.engagementTags.length > 0) {
      filtered = filtered.filter(lead => 
        filters.engagementTags.some(tag => 
          lead.engagement_tags.some(leadTag => leadTag.type === tag)
        )
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'created_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'contact_asc':
          const aContact = a.date_of_last_followup || a.created_at;
          const bContact = b.date_of_last_followup || b.created_at;
          return new Date(aContact).getTime() - new Date(bContact).getTime();
        case 'contact_desc':
          const aContactDesc = a.date_of_last_followup || a.created_at;
          const bContactDesc = b.date_of_last_followup || b.created_at;
          return new Date(bContactDesc).getTime() - new Date(aContactDesc).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [leads, filters, sortBy]);

  const activeFiltersCount = filters.sources.length + filters.statuses.length + filters.engagementTags.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.lead_name) return;

    try {
      const leadData = {
        ...formData,
        user_id: user.id,
        engagement_tags: formData.engagement_tags || [],
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
      engagement_tags: [],
      script_components: {
        intro: '',
        hook: '',
        body1: '',
        body2: '',
        ending: ''
      }
    });
  };

  const handleInlineUpdate = async (leadId: string, field: keyof Lead, value: any) => {
    try {
      await eightbaseService.updateLead(leadId, { [field]: value });
      await loadData();
    } catch (error) {
      console.error('Failed to update lead:', error);
    }
  };

  const startInlineEdit = (leadId: string, field: string, currentValue: string) => {
    setEditingField({ leadId, field });
    setTempValue(currentValue || '');
  };

  const saveInlineEdit = async () => {
    if (!editingField) return;
    
    try {
      await handleInlineUpdate(editingField.leadId, editingField.field as keyof Lead, tempValue);
      setEditingField(null);
      setTempValue('');
    } catch (error) {
      console.error('Failed to save inline edit:', error);
    }
  };

  const cancelInlineEdit = () => {
    setEditingField(null);
    setTempValue('');
  };

  const toggleEngagementTag = async (leadId: string, tagType: EngagementTagType) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const existingTag = lead.engagement_tags.find(t => t.type === tagType);
    
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

  const clearFilters = () => {
    setFilters({
      sources: [],
      statuses: [],
      engagementTags: []
    });
  };

  const updateFilter = (type: keyof LeadFilters, values: string[]) => {
    setFilters(prev => ({
      ...prev,
      [type]: values
    }));
  };

  // Enhanced script generation with random templates
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

  const updateTemplate = async (templateId: string, content: string) => {
    try {
      await eightbaseService.updateMessageTemplate(templateId, { content });
      await loadData();
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openScriptDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setScriptDialogOpen(true);
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

  // Export functionality
  const exportLeads = () => {
    const csvContent = [
      // Header
      ['Name', 'Email', 'Phone', 'Instagram', 'Source', 'Status', 'Created', 'Last Contact', 'Engagement Tags'].join(','),
      // Data
      ...filteredAndSortedLeads.map(lead => [
        `"${lead.lead_name}"`,
        `"${lead.email || ''}"`,
        `"${lead.phone || ''}"`,
        `"${lead.instagram_handle || ''}"`,
        `"${lead.lead_source}"`,
        `"${lead.status}"`,
        `"${new Date(lead.created_at).toLocaleDateString()}"`,
        `"${lead.date_of_last_followup ? new Date(lead.date_of_last_followup).toLocaleDateString() : ''}"`,
        `"${lead.engagement_tags.map(tag => ENGAGEMENT_TAG_CONFIG[tag.type].label).join('; ')}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Import functionality
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      parseCSV(csv);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csv: string) => {
    const lines = csv.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      setImportErrors(['CSV file must contain at least a header and one data row']);
      return;
    }

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
    const requiredHeaders = ['name'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      setImportErrors([`Missing required headers: ${missingHeaders.join(', ')}`]);
      return;
    }

    const preview: Partial<Lead>[] = [];
    const errors: string[] = [];

    for (let i = 1; i < Math.min(lines.length, 6); i++) { // Preview first 5 rows
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
      const row: Partial<Lead> = {
        lead_name: values[headers.indexOf('name')] || '',
        email: values[headers.indexOf('email')] || '',
        phone: values[headers.indexOf('phone')] || '',
        instagram_handle: values[headers.indexOf('instagram')] || '',
        lead_source: values[headers.indexOf('source')] || 'Other',
        status: (values[headers.indexOf('status')] as Lead['status']) || 'new',
        engagement_tags: []
      };

      if (!row.lead_name) {
        errors.push(`Row ${i}: Name is required`);
      }

      preview.push(row);
    }

    setImportPreview(preview);
    setImportErrors(errors);
  };

  const executeImport = async () => {
    if (!importFile || !user) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());

      let importedCount = 0;
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
          const leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'> = {
            user_id: user.id,
            lead_name: values[headers.indexOf('name')] || '',
            email: values[headers.indexOf('email')] || '',
            phone: values[headers.indexOf('phone')] || '',
            instagram_handle: values[headers.indexOf('instagram')] || '',
            lead_source: values[headers.indexOf('source')] || 'Other',
            status: (values[headers.indexOf('status')] as Lead['status']) || 'new',
            engagement_tags: [],
            script_components: {
              intro: '',
              hook: '',
              body1: '',
              body2: '',
              ending: ''
            },
            message_sent: false,
            followed_back: false,
            followed_up: false
          };

          if (leadData.lead_name) {
            await eightbaseService.createLead(leadData);
            importedCount++;
          }
        } catch (error) {
          errors.push(`Row ${i}: Failed to import - ${error}`);
        }
      }

      console.log(`Imported ${importedCount} leads with ${errors.length} errors`);
      await loadData();
      setImportDialogOpen(false);
      setImportFile(null);
      setImportPreview([]);
    };
    reader.readAsText(importFile);
  };

  const downloadTemplate = () => {
    const template = [
      'Name,Email,Phone,Instagram,Source,Status',
      'John Doe,john@example.com,(555) 123-4567,@johndoe,Instagram,new',
      'Jane Smith,jane@realty.com,(555) 987-6543,@janesmith_realtor,Zillow,contacted'
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leads-import-template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: 'New', color: 'bg-gray-100 text-gray-800' },
      contacted: { label: 'Contacted', color: 'bg-blue-100 text-blue-800' },
      qualified: { label: 'Qualified', color: 'bg-yellow-100 text-yellow-800' },
      converted: { label: 'Converted', color: 'bg-green-100 text-green-800' },
      lost: { label: 'Lost', color: 'bg-red-100 text-red-800' }
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
    // Simple phone formatting for display
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const getSortIcon = (option: SortOption) => {
    if (sortBy !== option) return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    return option.includes('desc') ? <SortDesc className="h-3 w-3" /> : <SortAsc className="h-3 w-3" />;
  };

  const InlineEditField = ({ 
    leadId, 
    field, 
    value, 
    icon, 
    placeholder, 
    type = 'text' 
  }: { 
    leadId: string; 
    field: string; 
    value: string; 
    icon: React.ReactNode; 
    placeholder: string;
    type?: string;
  }) => {
    const isEditing = editingField?.leadId === leadId && editingField?.field === field;
    
    return (
      <div className="flex items-center space-x-2 group">
        {icon}
        {isEditing ? (
          <div className="flex items-center space-x-1">
            <Input
              type={type}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="h-6 text-xs"
              placeholder={placeholder}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveInlineEdit();
                if (e.key === 'Escape') cancelInlineEdit();
              }}
            />
            <Button size="sm" variant="ghost" onClick={saveInlineEdit} className="h-6 w-6 p-0">
              <Save className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={cancelInlineEdit} className="h-6 w-6 p-0">
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div 
            className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded text-xs min-w-0 flex-1"
            onClick={() => startInlineEdit(leadId, field, value)}
          >
            {value ? (
              <span>{type === 'tel' ? formatPhoneNumber(value) : value}</span>
            ) : (
              <span className="text-muted-foreground italic">{placeholder}</span>
            )}
            <Edit className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 inline" />
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 animate-pulse text-brand-blue" />
          <span>Loading leads...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-brand-blue" />
            Lead Management & Outreach
          </h2>
          <p className="text-muted-foreground">
            Manage leads and track engagement progress in one place
          </p>
        </div>
        {user?.role === 'user' && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        )}
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Sort Controls */}
            <div className="flex items-center space-x-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_desc">
                    <div className="flex items-center space-x-2">
                      {getSortIcon('created_desc')}
                      <span>Newest First</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="created_asc">
                    <div className="flex items-center space-x-2">
                      {getSortIcon('created_asc')}
                      <span>Oldest First</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="contact_desc">
                    <div className="flex items-center space-x-2">
                      {getSortIcon('contact_desc')}
                      <span>Recent Contact</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="contact_asc">
                    <div className="flex items-center space-x-2">
                      {getSortIcon('contact_asc')}
                      <span>Oldest Contact</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Controls */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Leads</SheetTitle>
                  <SheetDescription>
                    Filter your leads by source, status, and engagement tags
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  {/* Source Filter */}
                  <div>
                    <Label className="text-sm font-medium">Sources</Label>
                    <div className="mt-2 space-y-2">
                      {availableSources.map(source => (
                        <div key={source} className="flex items-center space-x-2">
                          <Checkbox
                            id={`source-${source}`}
                            checked={filters.sources.includes(source)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateFilter('sources', [...filters.sources, source]);
                              } else {
                                updateFilter('sources', filters.sources.filter(s => s !== source));
                              }
                            }}
                          />
                          <label htmlFor={`source-${source}`} className="text-sm flex items-center space-x-1">
                            <span>{getSourceIcon(source)}</span>
                            <span>{source}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-2 space-y-2">
                      {availableStatuses.map(status => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status}`}
                            checked={filters.statuses.includes(status)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateFilter('statuses', [...filters.statuses, status]);
                              } else {
                                updateFilter('statuses', filters.statuses.filter(s => s !== status));
                              }
                            }}
                          />
                          <label htmlFor={`status-${status}`} className="text-sm capitalize">
                            {status}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Engagement Tags Filter */}
                  <div>
                    <Label className="text-sm font-medium">Engagement Tags</Label>
                    <div className="mt-2 space-y-2">
                      {availableEngagementTags.map(tag => {
                        const config = ENGAGEMENT_TAG_CONFIG[tag];
                        return (
                          <div key={tag} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tag-${tag}`}
                              checked={filters.engagementTags.includes(tag)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateFilter('engagementTags', [...filters.engagementTags, tag]);
                                } else {
                                  updateFilter('engagementTags', filters.engagementTags.filter(t => t !== tag));
                                }
                              }}
                            />
                            <label htmlFor={`tag-${tag}`} className="text-sm flex items-center space-x-1">
                              <span>{config.icon}</span>
                              <span>{config.label}</span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {activeFiltersCount > 0 && (
                    <Button variant="outline" onClick={clearFilters} className="w-full">
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Import/Export Controls */}
            <div className="flex items-center space-x-2">
              <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Import Leads</DialogTitle>
                    <DialogDescription>
                      Upload a CSV file to import multiple leads at once
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="csv-file">CSV File</Label>
                      <Input
                        id="csv-file"
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Select a CSV file with your leads data
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={downloadTemplate}>
                        <FileDown className="mr-2 h-3 w-3" />
                        Download Template
                      </Button>
                    </div>

                    {importPreview.length > 0 && (
                      <div>
                        <Label>Preview (first 5 rows)</Label>
                        <div className="mt-2 border rounded overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {importPreview.map((lead, index) => (
                                <TableRow key={index}>
                                  <TableCell>{lead.lead_name}</TableCell>
                                  <TableCell>{lead.email}</TableCell>
                                  <TableCell>{lead.phone}</TableCell>
                                  <TableCell>{lead.lead_source}</TableCell>
                                  <TableCell>{lead.status}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {importErrors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <h4 className="font-medium text-red-800 mb-2">Import Errors:</h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          {importErrors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={executeImport}
                        disabled={!importFile || importErrors.length > 0}
                      >
                        <FileUp className="mr-2 h-4 w-4" />
                        Import Leads
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="sm" onClick={exportLeads}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground ml-auto">
              {filteredAndSortedLeads.length} of {leads.length} leads
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              {filters.sources.map(source => (
                <Badge key={`source-${source}`} variant="secondary" className="text-xs">
                  {getSourceIcon(source)} {source}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('sources', filters.sources.filter(s => s !== source))}
                  />
                </Badge>
              ))}
              {filters.statuses.map(status => (
                <Badge key={`status-${status}`} variant="secondary" className="text-xs capitalize">
                  {status}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilter('statuses', filters.statuses.filter(s => s !== status))}
                  />
                </Badge>
              ))}
              {filters.engagementTags.map(tag => {
                const config = ENGAGEMENT_TAG_CONFIG[tag];
                return (
                  <Badge key={`tag-${tag}`} variant="secondary" className="text-xs">
                    {config.icon} {config.label}
                    <X 
                      className="ml-1 h-3 w-3 cursor-pointer" 
                      onClick={() => updateFilter('engagementTags', filters.engagementTags.filter(t => t !== tag))}
                    />
                  </Badge>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Leads List - Left Side */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Active Leads</CardTitle>
              <CardDescription>
                Click on a lead to expand outreach tools and engagement tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAndSortedLeads.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  {activeFiltersCount > 0 ? (
                    <>
                      <p className="text-muted-foreground">No leads match your current filters.</p>
                      <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">
                        Clear Filters
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-muted-foreground">No leads yet.</p>
                      {user?.role === 'user' && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Add your first lead to start tracking outreach progress.
                        </p>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAndSortedLeads.map((lead) => {
                    const isExpanded = expandedLeads.has(lead.id);
                    return (
                      <div key={lead.id} className="border rounded-lg overflow-hidden">
                        {/* Lead Header */}
                        <div 
                          className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleLeadExpanded(lead.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <div>
                                    <h3 className="font-medium">{lead.lead_name}</h3>
                                    
                                    {/* Contact Information */}
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                                      {lead.email && (
                                        <div className="flex items-center space-x-1">
                                          <Mail className="h-3 w-3" />
                                          <span>{lead.email}</span>
                                        </div>
                                      )}
                                      {lead.phone && (
                                        <div className="flex items-center space-x-1">
                                          <Phone className="h-3 w-3" />
                                          <span>{formatPhoneNumber(lead.phone)}</span>
                                        </div>
                                      )}
                                      {lead.instagram_handle && (
                                        <div className="flex items-center space-x-1">
                                          <Instagram className="h-3 w-3" />
                                          <span>{lead.instagram_handle}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4 mt-2">
                                  {/* Inline Source Edit */}
                                  <div className="flex items-center space-x-1">
                                    <span className="text-sm">{getSourceIcon(lead.lead_source)}</span>
                                    <Select
                                      value={lead.lead_source}
                                      onValueChange={(value) => handleInlineUpdate(lead.id, 'lead_source', value)}
                                    >
                                      <SelectTrigger className="h-6 text-xs border-none bg-transparent hover:bg-muted">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Instagram">Instagram</SelectItem>
                                        <SelectItem value="Facebook">Facebook</SelectItem>
                                        <SelectItem value="Zillow">Zillow</SelectItem>
                                        <SelectItem value="Realtor.com">Realtor.com</SelectItem>
                                        <SelectItem value="Referral">Referral</SelectItem>
                                        <SelectItem value="Website">Website</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  {/* Inline Status Edit */}
                                  <Select
                                    value={lead.status}
                                    onValueChange={(value) => handleInlineUpdate(lead.id, 'status', value)}
                                  >
                                    <SelectTrigger className="h-6 w-auto text-xs border-none bg-transparent hover:bg-muted">
                                      {getStatusBadge(lead.status)}
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
                              </div>
                            </div>
                            
                            {/* Engagement Tags Summary */}
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {lead.engagement_tags.slice(0, 3).map((tag) => {
                                const config = ENGAGEMENT_TAG_CONFIG[tag.type];
                                return (
                                  <Badge 
                                    key={tag.type} 
                                    variant="secondary" 
                                    className={`text-xs ${config.color}`}
                                  >
                                    {config.icon} {config.label}
                                  </Badge>
                                );
                              })}
                              {lead.engagement_tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{lead.engagement_tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="border-t bg-muted/25 p-4 space-y-4">
                            
                            {/* Contact Information Editor */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Contact Information
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <InlineEditField
                                  leadId={lead.id}
                                  field="email"
                                  value={lead.email || ''}
                                  icon={<Mail className="h-4 w-4 text-muted-foreground" />}
                                  placeholder="Add email address"
                                  type="email"
                                />
                                <InlineEditField
                                  leadId={lead.id}
                                  field="phone"
                                  value={lead.phone || ''}
                                  icon={<Phone className="h-4 w-4 text-muted-foreground" />}
                                  placeholder="Add phone number"
                                  type="tel"
                                />
                                <InlineEditField
                                  leadId={lead.id}
                                  field="instagram_handle"
                                  value={lead.instagram_handle || ''}
                                  icon={<Instagram className="h-4 w-4 text-muted-foreground" />}
                                  placeholder="Add Instagram handle"
                                />
                              </div>
                            </div>
                            
                            {/* Engagement Tracking */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Engagement Progress
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {Object.values(ENGAGEMENT_TAG_CONFIG).map((config) => {
                                  const isCompleted = lead.engagement_tags.some(t => t.type === config.type);
                                  const completedTag = lead.engagement_tags.find(t => t.type === config.type);
                                  
                                  return (
                                    <div
                                      key={config.type}
                                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                        isCompleted 
                                          ? `${config.color} border-current text-white` 
                                          : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700'
                                      }`}
                                      onClick={() => toggleEngagementTag(lead.id, config.type)}
                                    >
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-lg">{config.icon}</span>
                                          <span className="text-sm font-medium">{config.label}</span>
                                        </div>
                                        {isCompleted && <Check className="h-4 w-4 text-white" />}
                                      </div>
                                      {completedTag && (
                                        <div className="text-xs opacity-75">
                                          {new Date(completedTag.completed_date).toLocaleDateString()}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* DM Script Preview */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium flex items-center gap-2">
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
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openScriptDialog(lead)}
                                  >
                                    <Edit className="mr-1 h-3 w-3" />
                                    Edit
                                  </Button>
                                </div>
                              </div>
                              <div className="bg-background rounded-lg p-3 border text-sm whitespace-pre-line">
                                {generateScript(lead) || 'No script created yet. Click Random to generate one automatically.'}
                              </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex flex-wrap gap-2 pt-2 border-t">
                              {lead.email && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(lead.email!)}
                                >
                                  <Mail className="mr-1 h-3 w-3" />
                                  Copy Email
                                </Button>
                              )}
                              {lead.phone && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(lead.phone!)}
                                >
                                  <Phone className="mr-1 h-3 w-3" />
                                  Copy Phone
                                </Button>
                              )}
                              {lead.instagram_handle && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(lead.instagram_handle!)}
                                >
                                  <Instagram className="mr-1 h-3 w-3" />
                                  Copy Instagram
                                </Button>
                              )}
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

        {/* Enhanced Templates Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    Smart DM Templates
                  </CardTitle>
                  <CardDescription>
                    5 variations per section - randomly mixed to avoid spam detection
                  </CardDescription>
                </div>
                <Dialog open={templatesDialogOpen} onOpenChange={setTemplatesDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Manage DM Templates</DialogTitle>
                      <DialogDescription>
                        Edit your 5 variations for each message section. Random selection prevents spam detection.
                      </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="intro" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="intro">Intros</TabsTrigger>
                        <TabsTrigger value="hook">Hooks</TabsTrigger>
                        <TabsTrigger value="body1">Body 1</TabsTrigger>
                        <TabsTrigger value="body2">Body 2</TabsTrigger>
                        <TabsTrigger value="ending">Endings</TabsTrigger>
                      </TabsList>
                      
                      {(['intro', 'hook', 'body1', 'body2', 'ending'] as MessageTemplateType[]).map(type => (
                        <TabsContent key={type} value={type} className="space-y-4">
                          <div className="text-sm text-muted-foreground mb-4">
                            {type === 'intro' ? 'Intros' : type === 'hook' ? 'Hooks' : type === 'body1' ? 'Body 1' : type === 'body2' ? 'Body 2' : 'Endings'} - Each will be randomly selected
                          </div>
                          {templateVariations[type]?.map((template, index) => (
                            <div key={template.id} className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <Badge variant="outline">#{index + 1}</Badge>
                                Variation {index + 1}
                              </Label>
                              <Textarea
                                value={editingTemplates[template.id] !== undefined ? editingTemplates[template.id] : template.content}
                                onChange={(e) => setEditingTemplates(prev => ({
                                  ...prev,
                                  [template.id]: e.target.value
                                }))}
                                rows={2}
                                className="text-sm"
                              />
                              <div className="flex justify-end">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const content = editingTemplates[template.id] !== undefined ? editingTemplates[template.id] : template.content;
                                    updateTemplate(template.id, content);
                                    setEditingTemplates(prev => {
                                      const newState = { ...prev };
                                      delete newState[template.id];
                                      return newState;
                                    });
                                  }}
                                  disabled={editingTemplates[template.id] === undefined}
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          ))}
                        </TabsContent>
                      ))}
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    const script = await generateRandomScript();
                    copyToClipboard(Object.values(script).join('\n\n'));
                  }}
                  className="flex-1"
                >
                  <Shuffle className="mr-2 h-4 w-4" />
                  Generate Random Script
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  <strong>How it works:</strong> Each script randomly selects 1 of 5 variations from each section to create unique messages and avoid spam detection.
                </p>
                
                {Object.entries(templateVariations).map(([type, templates]) => (
                  templates.length > 0 && (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm capitalize">{type} ({templates.length})</h4>
                        <Badge variant="outline" className="text-xs">
                          {templates.length}/5
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground border rounded p-2 bg-muted/50">
                        {templates[0]?.content.substring(0, 60)}...
                      </div>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Engagement Guide */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Engagement Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800 text-xs">👀 Follow Day</Badge>
                  <span className="text-xs">Like 2-3 recent posts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 text-xs">📱 Day 1</Badge>
                  <span className="text-xs">Comment on latest post</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-800 text-xs">💬 Day 2</Badge>
                  <span className="text-xs">View their stories</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-100 text-orange-800 text-xs">📩 DM</Badge>
                  <span className="text-xs">Send personalized message</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Lead Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Add a new real estate agent to your outreach pipeline.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lead_name">Lead Name *</Label>
                <Input
                  id="lead_name"
                  value={formData.lead_name || ''}
                  onChange={(e) => setFormData({...formData, lead_name: e.target.value})}
                  placeholder="Jennifer Martinez"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="jennifer@coldwellbanker.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="instagram_handle">Instagram Handle</Label>
                <Input
                  id="instagram_handle"
                  value={formData.instagram_handle || ''}
                  onChange={(e) => setFormData({...formData, instagram_handle: e.target.value})}
                  placeholder="@jenmartinez_realtor"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source">Source</Label>
                <Select 
                  value={formData.lead_source || 'Instagram'} 
                  onValueChange={(value) => setFormData({...formData, lead_source: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Instagram">📱 Instagram</SelectItem>
                    <SelectItem value="Facebook">📘 Facebook</SelectItem>
                    <SelectItem value="Zillow">🏠 Zillow</SelectItem>
                    <SelectItem value="Realtor.com">🏡 Realtor.com</SelectItem>
                    <SelectItem value="Referral">👥 Referral</SelectItem>
                    <SelectItem value="Website">🌐 Website</SelectItem>
                    <SelectItem value="Other">📋 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status || 'new'} 
                  onValueChange={(value) => setFormData({...formData, status: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
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
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Lead</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Script Editor Dialog */}
      <Dialog open={scriptDialogOpen} onOpenChange={setScriptDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit DM Script - {selectedLead?.lead_name}</DialogTitle>
            <DialogDescription>
              Customize the direct message script for this lead
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="intro">Intro</Label>
                <Textarea
                  id="intro"
                  value={selectedLead.script_components.intro}
                  onChange={(e) => {
                    const updated = {
                      ...selectedLead,
                      script_components: {
                        ...selectedLead.script_components,
                        intro: e.target.value
                      }
                    };
                    setSelectedLead(updated);
                  }}
                  placeholder="Hi [Name]! I saw your recent listing..."
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="hook">Hook</Label>
                <Textarea
                  id="hook"
                  value={selectedLead.script_components.hook}
                  onChange={(e) => {
                    const updated = {
                      ...selectedLead,
                      script_components: {
                        ...selectedLead.script_components,
                        hook: e.target.value
                      }
                    };
                    setSelectedLead(updated);
                  }}
                  placeholder="Your photos look great, but I specialize in..."
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="body1">Body 1</Label>
                  <Textarea
                    id="body1"
                    value={selectedLead.script_components.body1}
                    onChange={(e) => {
                      const updated = {
                        ...selectedLead,
                        script_components: {
                          ...selectedLead.script_components,
                          body1: e.target.value
                        }
                      };
                      setSelectedLead(updated);
                    }}
                    placeholder="I work with top agents..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="body2">Body 2</Label>
                  <Textarea
                    id="body2"
                    value={selectedLead.script_components.body2}
                    onChange={(e) => {
                      const updated = {
                        ...selectedLead,
                        script_components: {
                          ...selectedLead.script_components,
                          body2: e.target.value
                        }
                      };
                      setSelectedLead(updated);
                    }}
                    placeholder="Would love to show you examples..."
                    rows={3}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="ending">Ending</Label>
                <Textarea
                  id="ending"
                  value={selectedLead.script_components.ending}
                  onChange={(e) => {
                    const updated = {
                      ...selectedLead,
                      script_components: {
                        ...selectedLead.script_components,
                        ending: e.target.value
                      }
                    };
                    setSelectedLead(updated);
                  }}
                  placeholder="When would be a good time for a call?"
                  rows={2}
                />
              </div>
              
              {/* Script Preview */}
              <div className="border-t pt-4">
                <Label>Complete Script Preview</Label>
                <div className="mt-2 p-3 bg-muted rounded-lg text-sm whitespace-pre-line">
                  {generateScript(selectedLead)}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generateScript(selectedLead))}
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Copy Script
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setScriptDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      await eightbaseService.updateLead(selectedLead.id, {
                        script_components: selectedLead.script_components
                      });
                      await loadData();
                      setScriptDialogOpen(false);
                    } catch (error) {
                      console.error('Failed to update script:', error);
                    }
                  }}
                >
                  Save Script
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}