import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { eightbaseService } from '../services/8baseService';
import { Lead, MessageTemplate, ScriptComponentTemplate, EngagementTag, EngagementTagType, EngagementTagInfo, MessageTemplateType, TemplateVariationSet } from '../types';
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
  Eye,
  FileText
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
  dateRange: {
    start: string;
    end: string;
  } | null;
  dateFilter: 'all' | 'week' | 'month' | 'custom';
}

export function Leads() {
  const { user } = useAuth();
  
  // Static template examples
  const staticTemplates = {
    intro: "Hi {name}! I saw your recent listing on {property_address}....",
    hook: "Your photos look great, but I specialize in helping realtors...",
    body1: "I work with top agents in the area and my photos typically h...",
    body2: "Would love to show you some before/after examples....",
    ending: "When would be a good time for a quick 10-minute call this we..."
  };

  // Debug log to verify templates are loaded
  console.log('Static templates loaded:', staticTemplates);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [templates, setTemplates] = useState<ScriptComponentTemplate[]>([]);
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
    engagementTags: [],
    dateRange: null,
    dateFilter: 'all'
  });

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<Partial<Lead>[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [selectedImportLeads, setSelectedImportLeads] = useState<Set<number>>(new Set());

  // Form states
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
    if (!user) return;
    
    setLoading(true);
    try {
      // Initialize default templates if none exist for this user
      await eightbaseService.initializeDefaultTemplates(user.id);
      
      const [leadsData, templatesData] = await Promise.all([
        user.role === 'user' ? eightbaseService.getLeads(user.id) : eightbaseService.getLeadsByCoach(user.id),
        eightbaseService.getScriptComponentTemplates(user.id)
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
    const variations: Record<MessageTemplateType, ScriptComponentTemplate[]> = {
      intro: [],
      hook: [],
      body1: [],
      body2: [],
      ending: []
    };

    // Since ScriptComponentTemplate contains all fields, we'll create virtual variations
    templates.forEach((template, index) => {
      // Create virtual MessageTemplate-like objects for each field
      const introTemplate = {
        ...template,
        type: 'intro' as MessageTemplateType,
        content: template.intro,
        variation_number: index + 1
      };
      const hookTemplate = {
        ...template,
        type: 'hook' as MessageTemplateType,
        content: template.hook,
        variation_number: index + 1
      };
      const body1Template = {
        ...template,
        type: 'body1' as MessageTemplateType,
        content: template.body1,
        variation_number: index + 1
      };
      const body2Template = {
        ...template,
        type: 'body2' as MessageTemplateType,
        content: template.body2,
        variation_number: index + 1
      };
      const endingTemplate = {
        ...template,
        type: 'ending' as MessageTemplateType,
        content: template.ending,
        variation_number: index + 1
      };

      variations.intro.push(introTemplate);
      variations.hook.push(hookTemplate);
      variations.body1.push(body1Template);
      variations.body2.push(body2Template);
      variations.ending.push(endingTemplate);
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
      lead.engagementTag.forEach(tag => tags.add(tag.type));
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
          lead.engagementTag.some(leadTag => leadTag.type === tag)
        )
      );
    }

    // Apply date filtering
    if (filters.dateFilter !== 'all') {
      const now = new Date();
      const leadDate = new Date();
      
      filtered = filtered.filter(lead => {
        const createdAt = new Date(lead.created_at);
        
        switch (filters.dateFilter) {
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return createdAt >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return createdAt >= monthAgo;
          case 'custom':
            if (filters.dateRange) {
              const startDate = new Date(filters.dateRange.start);
              const endDate = new Date(filters.dateRange.end);
              return createdAt >= startDate && createdAt <= endDate;
            }
            return true;
          default:
            return true;
        }
      });
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

  const activeFiltersCount = filters.sources.length + filters.statuses.length + filters.engagementTags.length + 
    (filters.dateFilter !== 'all' ? 1 : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.lead_name) return;

    try {
      const leadData = {
        ...formData,
        user_id: user.id,
        engagementTag: formData.engagementTag || [],
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

  const clearFilters = () => {
    setFilters({
      sources: [],
      statuses: [],
      engagementTags: [],
      dateRange: null,
      dateFilter: 'all'
    });
  };

  const updateFilter = (type: keyof LeadFilters, values: any) => {
    setFilters(prev => ({
      ...prev,
      [type]: values
    }));
  };

  const updateDateFilter = (dateFilter: 'all' | 'week' | 'month' | 'custom') => {
    setFilters(prev => ({
      ...prev,
      dateFilter,
      dateRange: dateFilter === 'custom' ? prev.dateRange : null
    }));
  };

  const updateDateRange = (start: string, end: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { start, end }
    }));
  };

  const toggleImportLeadSelection = (index: number) => {
    setSelectedImportLeads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const selectAllImportLeads = () => {
    setSelectedImportLeads(new Set(importPreview.map((_, index) => index)));
  };

  const deselectAllImportLeads = () => {
    setSelectedImportLeads(new Set());
  };

  // Enhanced script generation with random templates
  const generateRandomScript = async () => {
    try {
      const randomScript = await eightbaseService.generateRandomScript(user?.id || '');
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

  const updateTemplate = async (templateId: string, field: string, content: string) => {
    try {
      const updates: any = { [field]: content };
      await eightbaseService.updateScriptComponentTemplate(templateId, updates);
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
        `"${lead.engagementTag.map(tag => ENGAGEMENT_TAG_CONFIG[tag.type].label).join('; ')}"`,
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
    setSelectedImportLeads(new Set()); // Reset selected leads
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      parseCSV(csv);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csv: string) => {
    const lines = csv.split('\n').filter(line => line.trim() && line.trim() !== '');
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

    // Parse CSV line properly handling quoted fields
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    for (let i = 1; i < Math.min(lines.length, 6); i++) { // Preview first 5 rows
      const values = parseCSVLine(lines[i]);
      const row: Partial<Lead> = {
        lead_name: values[headers.indexOf('name')] || '',
        email: values[headers.indexOf('email')] || '',
        phone: values[headers.indexOf('phone')] || '',
        instagram_handle: values[headers.indexOf('instagram')] || '',
        lead_source: values[headers.indexOf('source')] || 'Other',
        status: (values[headers.indexOf('status')] as Lead['status']) || 'new',
        engagementTag: []
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
    if (!importFile || !user || selectedImportLeads.size === 0) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n').filter(line => line.trim() && line.trim() !== '');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());

      const leadsToCreate: Omit<Lead, 'id' | 'created_at' | 'updated_at'>[] = [];
      const errors: string[] = [];

      // Parse only selected leads
      Array.from(selectedImportLeads).forEach(index => {
        const i = index + 1; // +1 because index 0 is headers
        try {
          // Parse CSV line properly handling quoted fields
          const parseCSVLine = (line: string): string[] => {
            const result: string[] = [];
            let current = '';
            let inQuotes = false;
            
            for (let j = 0; j < line.length; j++) {
              const char = line[j];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            result.push(current.trim());
            return result;
          };

          const values = parseCSVLine(lines[i]);
          console.log('Parsed values:', values);
          console.log('Headers:', headers);
          console.log('Name index:', headers.indexOf('name'));
          
          const leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'> = {
            user_id: user.id,
            lead_name: values[headers.indexOf('name')] || '',
            email: values[headers.indexOf('email')] || '',
            phone: values[headers.indexOf('phone')] || '',
            instagram_handle: values[headers.indexOf('instagram')] || '',
            lead_source: values[headers.indexOf('source')] || 'Other',
            status: (values[headers.indexOf('status')] as Lead['status']) || 'new',
            engagementTag: [],
            script_components: {
              intro: '',
              hook: '',
              body1: '',
              body2: '',
              ending: ''
            },
          };
          
          console.log('Lead data:', leadData);

          if (leadData.lead_name) {
            leadsToCreate.push(leadData);
          } else {
            errors.push(`Row ${i}: Name is required`);
          }
        } catch (error) {
          errors.push(`Row ${i}: Failed to parse - ${error}`);
        }
      });

      // Create all leads in bulk
      let importedCount = 0;
      if (leadsToCreate.length > 0) {
        try {
          const createdLeads = await eightbaseService.createLeadsBulk(leadsToCreate);
          importedCount = createdLeads.length;
        } catch (error) {
          errors.push(`Bulk import failed: ${error}`);
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
      new: { label: 'New', color: 'bg-muted text-muted-foreground' },
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
          <span className="text-black dark:text-white">Loading leads...</span>
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

                  {/* Date Filter */}
                  <div>
                    <Label className="text-sm font-medium">Date Range</Label>
                    <div className="mt-2 space-y-3">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="date-all"
                            name="dateFilter"
                            checked={filters.dateFilter === 'all'}
                            onChange={() => updateDateFilter('all')}
                            className="h-4 w-4"
                          />
                          <label htmlFor="date-all" className="text-sm">All Time</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="date-week"
                            name="dateFilter"
                            checked={filters.dateFilter === 'week'}
                            onChange={() => updateDateFilter('week')}
                            className="h-4 w-4"
                          />
                          <label htmlFor="date-week" className="text-sm">Last 7 Days</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="date-month"
                            name="dateFilter"
                            checked={filters.dateFilter === 'month'}
                            onChange={() => updateDateFilter('month')}
                            className="h-4 w-4"
                          />
                          <label htmlFor="date-month" className="text-sm">Last 30 Days</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="date-custom"
                            name="dateFilter"
                            checked={filters.dateFilter === 'custom'}
                            onChange={() => updateDateFilter('custom')}
                            className="h-4 w-4"
                          />
                          <label htmlFor="date-custom" className="text-sm">Custom Range</label>
                        </div>
                      </div>
                      
                      {filters.dateFilter === 'custom' && (
                        <div className="space-y-2 pl-6">
                          <div>
                            <Label htmlFor="start-date" className="text-xs">Start Date</Label>
                            <Input
                              id="start-date"
                              type="date"
                              value={filters.dateRange?.start || ''}
                              onChange={(e) => updateDateRange(
                                e.target.value,
                                filters.dateRange?.end || ''
                              )}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="end-date" className="text-xs">End Date</Label>
                            <Input
                              id="end-date"
                              type="date"
                              value={filters.dateRange?.end || ''}
                              onChange={(e) => updateDateRange(
                                filters.dateRange?.start || '',
                                e.target.value
                              )}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      )}
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
                        <div className="flex items-center justify-between mb-2">
                          <Label>Preview ({importPreview.length} rows)</Label>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={selectAllImportLeads}>
                              Select All
                            </Button>
                            <Button variant="outline" size="sm" onClick={deselectAllImportLeads}>
                              Deselect All
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 border rounded overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12">
                                  <Checkbox
                                    checked={selectedImportLeads.size === importPreview.length && importPreview.length > 0}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        selectAllImportLeads();
                                      } else {
                                        deselectAllImportLeads();
                                      }
                                    }}
                                  />
                                </TableHead>
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
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedImportLeads.has(index)}
                                      onCheckedChange={() => toggleImportLeadSelection(index)}
                                    />
                                  </TableCell>
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
                        <div className="mt-2 text-sm text-muted-foreground">
                          {selectedImportLeads.size} of {importPreview.length} leads selected for import
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
                        disabled={!importFile || importErrors.length > 0 || selectedImportLeads.size === 0}
                      >
                        <FileUp className="mr-2 h-4 w-4" />
                        Import {selectedImportLeads.size > 0 ? `${selectedImportLeads.size} Selected` : 'Leads'}
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
                                      <h3 className="font-medium text-foreground">{lead.lead_name}</h3>
                                    
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
                              {lead.engagementTag.slice(0, 3).map((tag) => {
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
                                {lead.engagementTag.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{lead.engagementTag.length - 3}
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
                              <h4 className="font-medium mb-3 flex items-center gap-2 text-black dark:text-white">
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
                              <h4 className="font-medium mb-3 flex items-center gap-2 text-black dark:text-white">
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
                                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                        isCompleted 
                                          ? `${config.color} border-current text-white` 
                                          : 'bg-muted hover:bg-muted/80 border-border text-muted-foreground'
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
                                <h4 className="font-medium flex items-center gap-2 text-black dark:text-white">
                                  <MessageCircle className="h-4 w-4" />
                                  DM Script
                                </h4>
                                <div className="flex gap-2">
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={async () => {
                                      const script = await generateRandomScript();
                                      const scriptText = Object.values(script).join('\n\n');
                                      copyToClipboard(scriptText);
                                    }}
                                  >
                                    <Zap className="mr-1 h-3 w-3" />
                                    Quick DM
                                  </Button>
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

                            {/* Lead Notes */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2 text-black dark:text-white">
                                <FileText className="h-4 w-4" />
                                Lead Notes
                              </h4>
                              <div className="space-y-2">
                                <Textarea
                                  placeholder="Add notes about this lead after calls or interactions..."
                                  value={lead.notes || ''}
                                  onChange={(e) => handleInlineUpdate(lead.id, 'notes', e.target.value)}
                                  rows={3}
                                  className="text-sm"
                                />
                                <p className="text-xs text-muted-foreground">
                                  Use this space to jot down quick notes after calls or interactions with this lead.
                                </p>
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
                  <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                    <Wand2 className="h-5 w-5" />
                    Smart DM Templates
                  </CardTitle>
                  <CardDescription>
                    5 variations per section - randomly mixed to avoid spam detection
                  </CardDescription>
                </div>
                <Dialog open={templatesDialogOpen} onOpenChange={setTemplatesDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-8 w-8 p-0 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600"
                    >
                      <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
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
                          
                          {/* Show 5 different template variations */}
                          {Array.from({ length: 5 }, (_, index) => {
                            const variationNumber = index + 1;
                            
                            // Define 5 different template variations for each type
                            const defaultTemplates = {
                              intro: [
                                "Hi {name}! I saw your recent listing on {property_address}.",
                                "Hello {name}! I came across your beautiful property listing.",
                                "Hey {name}! Your recent property post caught my attention.",
                                "Hi there {name}! I noticed your impressive real estate portfolio.",
                                "Good morning {name}! I've been following your listings and they look fantastic."
                              ],
                              hook: [
                                "Your photos look great, but I specialize in helping realtors like you get 3x more engagement with premium photography.",
                                "I noticed your listing has potential, but professional photography could make it stand out even more.",
                                "Your property looks amazing! I help agents like you create stunning visuals that drive more inquiries.",
                                "I work with top agents in the area and my photos typically help listings sell 20% faster.",
                                "Your marketing is solid, but I can help you take it to the next level with premium photography."
                              ],
                              body1: [
                                "I work with top agents in the area and my photos typically help listings sell 20% faster.",
                                "My photography has helped over 200 agents increase their listing engagement by 300%.",
                                "I specialize in real estate photography that makes properties irresistible to buyers.",
                                "My work has been featured in top real estate publications and helps agents close deals faster.",
                                "I've helped agents in your market increase their listing views by 400% with professional photos."
                              ],
                              body2: [
                                "Would love to show you some before/after examples of my work.",
                                "I can send you a portfolio of my recent work with agents in your area.",
                                "Let me show you how I've transformed other listings in your market.",
                                "I'd be happy to share some case studies of successful campaigns I've created.",
                                "Would you like to see some examples of how I've helped similar properties sell faster?"
                              ],
                              ending: [
                                "When would be a good time for a quick 10-minute call this week?",
                                "Are you available for a brief call to discuss how I can help your listings?",
                                "Would you be interested in a quick chat about boosting your listing performance?",
                                "Can we schedule a short call to explore how professional photography could help you?",
                                "I'd love to discuss how I can help you get more leads from your listings."
                              ]
                            };
                            
                            const defaultContent = defaultTemplates[type as keyof typeof defaultTemplates]?.[index] || '';
                            
                            // Check if user has custom templates for this variation (using templates state)
                            const userTemplates = templateVariations[type] || [];
                            const existingTemplate = userTemplates.find(t => t.variation_number === variationNumber);
                            const templateId = existingTemplate?.id || `static-${type}-${variationNumber}`;
                            
                            return (
                              <div key={`variation-${variationNumber}`} className="space-y-2">
                                <Label className="flex items-center gap-2 text-black dark:text-white">
                                  <Badge variant="outline">#{variationNumber}</Badge>
                                  Variation {variationNumber}
                                </Label>
                                <Textarea
                                  value={editingTemplates[templateId] !== undefined ? editingTemplates[templateId] : existingTemplate?.content || defaultContent}
                                  onChange={(e) => setEditingTemplates(prev => ({
                                    ...prev,
                                    [templateId]: e.target.value
                                  }))}
                                  rows={2}
                                  className="text-sm"
                                  placeholder={`Enter ${type} variation ${variationNumber}...`}
                                />
                                <div className="flex justify-end">
                                  <Button
                                    size="sm"
                                    onClick={async () => {
                                      const content = editingTemplates[templateId] !== undefined ? editingTemplates[templateId] : existingTemplate?.content || defaultContent;
                                      if (user) {
                                        try {
                                          if (existingTemplate) {
                                            // Update existing template
                                            await eightbaseService.updateScriptComponentTemplate(existingTemplate.id, {
                                              [type]: content
                                            });
                                          } else {
                                            // Create new template
                                            const templateData: any = {
                                              intro: '',
                                              hook: '',
                                              body1: '',
                                              body2: '',
                                              ending: '',
                                              user: { connect: { id: user.id } }
                                            };
                                            templateData[type] = content;
                                            
                                            await eightbaseService.createScriptComponentTemplate(templateData);
                                          }
                                          await loadData();
                                          setEditingTemplates(prev => {
                                            const newState = { ...prev };
                                            delete newState[templateId];
                                            return newState;
                                          });
                                        } catch (error) {
                                          console.error('Failed to save template:', error);
                                        }
                                      }
                                    }}
                                    disabled={editingTemplates[templateId] === undefined}
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
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
                
                {/* Template Sections - Static Templates */}
                <div className="space-y-3">
                  {/* Intro Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white">Intro (5)</h4>
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-800">5/5</Badge>
                    </div>
                    <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {staticTemplates.intro}
                      </p>
                    </div>
                  </div>

                  {/* Hook Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white">Hook (5)</h4>
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-800">5/5</Badge>
                    </div>
                    <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {staticTemplates.hook}
                      </p>
                    </div>
                  </div>

                  {/* Body1 Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white">Body1 (5)</h4>
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-800">5/5</Badge>
                    </div>
                    <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {staticTemplates.body1}
                      </p>
                    </div>
                  </div>

                  {/* Body2 Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white">Body2 (5)</h4>
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-800">5/5</Badge>
                    </div>
                    <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {staticTemplates.body2}
                      </p>
                    </div>
                  </div>

                  {/* Ending Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white">Ending (5)</h4>
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-800">5/5</Badge>
                    </div>
                    <div className="border rounded p-2 bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {staticTemplates.ending}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Engagement Guide */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                <Users className="h-5 w-5" />
                Engagement Guide dsadsadsa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2 text-black dark:text-white">
                  <Badge className="bg-blue-100 text-blue-800 text-xs">👀 Follow Day</Badge>
                  <span className="text-xs">Like 2-3 recent posts</span>
                </div>
                <div className="flex items-center gap-2 text-black dark:text-white">
                  <Badge className="bg-green-100 text-green-800 text-xs">📱 Day 1</Badge>
                  <span className="text-xs">Comment on latest post</span>
                </div>
                <div className="flex items-center gap-2 text-black dark:text-white">
                  <Badge className="bg-purple-100 text-purple-800 text-xs">💬 Day 2</Badge>
                  <span className="text-xs">View their stories</span>
                </div>
                <div className="flex items-center gap-2 text-black dark:text-white">
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
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Add New Lead</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Add a new real estate agent to your outreach pipeline.
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