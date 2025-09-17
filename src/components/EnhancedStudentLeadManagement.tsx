import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { eightbaseService } from '../services/8baseService';
import { Lead, MessageTemplate, EngagementTag, EngagementTagType, EngagementTagInfo, MessageTemplateType } from '../types';
// Updated Lead type includes leadnote field
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
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
  Phone,
  FileText
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
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editScriptOpen, setEditScriptOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<Lead | null>(null);
  const [scriptFormData, setScriptFormData] = useState({
    intro: '',
    hook: '',
    body1: '',
    body2: '',
    ending: ''
  });
  const [filters, setFilters] = useState<LeadFilters>({
    sources: [],
    statuses: [],
    engagementTags: [],
    dateRange: null,
    dateFilter: 'all'
  });

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
      
      console.log('=== DEBUG loadData ===');
      console.log('Raw leadsData:', leadsData);
      console.log('First lead ScriptComponents:', leadsData[0]?.ScriptComponents);
      console.log('=== END DEBUG loadData ===');
      
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

    // Add default templates if none exist
    const defaultTemplates = {
      intro: [
        { 
          id: 'default-intro', 
          type: 'intro' as MessageTemplateType, 
          content: 'Hi {name}! I saw your recent listing on {property_address}.', 
          variation_number: 1,
          category: 'dm',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      hook: [
        { 
          id: 'default-hook', 
          type: 'hook' as MessageTemplateType, 
          content: 'Your photos look great, but I specialize in helping realtors like you get 3x more engagement with premium photography.', 
          variation_number: 1,
          category: 'dm',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      body1: [
        { 
          id: 'default-body1', 
          type: 'body1' as MessageTemplateType, 
          content: 'I work with top agents in the area and my photos typically help listings sell 20% faster.', 
          variation_number: 1,
          category: 'dm',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      body2: [
        { 
          id: 'default-body2', 
          type: 'body2' as MessageTemplateType, 
          content: 'Would love to show you some before/after examples.', 
          variation_number: 1,
          category: 'dm',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      ending: [
        { 
          id: 'default-ending', 
          type: 'ending' as MessageTemplateType, 
          content: 'When would be a good time for a quick 10-minute call this week?', 
          variation_number: 1,
          category: 'dm',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };

    // Use default templates if no templates exist for a type
    Object.keys(variations).forEach(type => {
      if (variations[type as MessageTemplateType].length === 0) {
        variations[type as MessageTemplateType] = defaultTemplates[type as keyof typeof defaultTemplates];
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
    let script = '';
    
    // Debug: Log the lead data to see what's available
    console.log('=== DEBUG generateScript ===');
    console.log('Lead ID:', lead.id);
    console.log('Lead ScriptComponents:', lead.ScriptComponents);
    console.log('ScriptComponents length:', lead.ScriptComponents?.length);
    console.log('Lead script_components:', lead.script_components);
    
    // Check if lead has custom ScriptComponents from the table
    if (lead.ScriptComponents && lead.ScriptComponents.length > 0) {
      console.log('Using custom ScriptComponents from table');
      // Use custom script components from the table
      const customScript = lead.ScriptComponents[0];
      script = [
        customScript.intro,
        customScript.hook,
        customScript.body1,
        customScript.body2,
        customScript.ending
      ].filter(text => text && text.trim()).join('\n\n');
    } else {
      console.log('No ScriptComponents found, checking script_components JSON field');
      // Check if lead has custom script components in JSON field
      const hasCustomScript = Object.values(lead.script_components).some(component => component && component.trim());
      
      if (hasCustomScript) {
        console.log('Using custom script from JSON field');
        // Show custom script from JSON field
        script = Object.values(lead.script_components).join('\n\n');
      } else {
        console.log('Using default template script');
        // Show default template script
        const defaultScript = Object.values(templateVariations).map(templates => {
          if (templates.length > 0) {
            return templates[0].content;
          }
          return '';
        }).filter(text => text.trim()).join('\n\n');
        
        script = defaultScript;
      }
    }
    
    // Replace placeholders with actual lead data
    const finalScript = script
      .replace(/{name}/g, lead.lead_name)
      .replace(/{property_address}/g, 'your property')
      .replace(/{email}/g, lead.email || 'your email')
      .replace(/{phone}/g, lead.phone || 'your phone')
      .replace(/{instagram}/g, lead.instagram_handle || 'your Instagram');
    
    console.log('Final generated script:', finalScript);
    console.log('=== END DEBUG ===');
    
    return finalScript;
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

  const handleNotesChange = async (leadId: string, notes: string) => {
    try {
      // Update the lead notes in the local state
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === leadId ? { ...lead, leadnote: notes } : lead
        )
      );
      
      // Save to backend using leadnote field
      await eightbaseService.updateLead(leadId, { leadnote: notes });
      
      // Exit editing mode after successful save
      setEditingNotes(null);
      setTempNotes('');
    } catch (error) {
      console.error('Failed to update lead notes:', error);
    }
  };

  const handleStartEditingNotes = (leadId: string, currentNotes: string) => {
    setEditingNotes(leadId);
    setTempNotes(currentNotes || '');
  };

  const handleCancelEditingNotes = () => {
    setEditingNotes(null);
    setTempNotes('');
  };

  const handleImportLeads = () => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        let importedLeads: any[] = [];

        if (file.name.endsWith('.csv')) {
          // Parse CSV with improved parsing
          const lines = text.split('\n').filter(line => line.trim() && line.trim() !== '');
          const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
          
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

          importedLeads = lines.slice(1).map(line => {
            const values = parseCSVLine(line);
            const lead: any = {};
            headers.forEach((header, index) => {
              const fieldName = header.replace(/\s+/g, '_');
              lead[fieldName] = values[index] || '';
            });
            return lead;
          });
        } else if (file.name.endsWith('.json')) {
          // Parse JSON
          importedLeads = JSON.parse(text);
        }

        // Prepare leads for bulk import
        const targetUserId = isCoachView && studentId ? studentId : user?.id;
        if (!targetUserId) {
          alert('User not found. Please try again.');
          return;
        }

        const leadsToCreate: Omit<Lead, 'id' | 'created_at' | 'updated_at'>[] = importedLeads
          .filter(leadData => leadData.name || leadData.lead_name) // Only include leads with names
          .map(leadData => ({
            user_id: targetUserId,
            lead_name: leadData.name || leadData.lead_name || '',
            email: leadData.email || '',
            phone: leadData.phone || '',
            instagram_handle: leadData.instagram || leadData.instagram_handle || '',
            lead_source: leadData.source || leadData.lead_source || 'Other',
            status: (leadData.status as Lead['status']) || 'new',
            engagementTag: [],
            script_components: {
              intro: '',
              hook: '',
              body1: '',
              body2: '',
              ending: ''
            }
          }));

        if (leadsToCreate.length === 0) {
          alert('No valid leads found in the file. Please ensure the file contains lead names.');
          return;
        }

        // Import leads using bulk creation
        console.log('Importing leads in bulk:', leadsToCreate);
        await eightbaseService.createLeadsBulk(leadsToCreate);

        // Reload data
        await loadData();
        alert(`Successfully imported ${leadsToCreate.length} leads in bulk!`);
      } catch (error) {
        console.error('Failed to import leads:', error);
        alert('Failed to import leads. Please check the file format.');
      }
    };
    input.click();
  };

  const handleExportLeads = () => {
    try {
      // Convert leads to CSV format
      const headers = ['Name', 'Email', 'Phone', 'Instagram', 'Source', 'Status', 'Notes', 'Created Date'];
      const csvContent = [
        headers.join(','),
        ...leads.map(lead => [
          lead.lead_name,
          lead.email || '',
          lead.phone || '',
          lead.instagram_handle || '',
          lead.lead_source,
          lead.status,
          lead.leadnote || '',
          new Date(lead.created_at).toLocaleDateString()
        ].map(field => `"${field}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export leads:', error);
      alert('Failed to export leads.');
    }
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

  // Filter helper functions
  const availableSources = useMemo(() => {
    const sources = new Set<string>();
    leads.forEach(lead => sources.add(lead.lead_source));
    return Array.from(sources).sort();
  }, [leads]);

  const availableStatuses = useMemo(() => {
    const statuses = new Set<string>();
    leads.forEach(lead => statuses.add(lead.status));
    return Array.from(statuses).sort();
  }, [leads]);

  const availableEngagementTags = useMemo(() => {
    const tags = new Set<EngagementTagType>();
    leads.forEach(lead => {
      lead.engagementTag.forEach(tag => tags.add(tag.type));
    });
    return Array.from(tags).sort();
  }, [leads]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
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

    return filtered;
  }, [leads, filters]);

  const activeFiltersCount = filters.sources.length + filters.statuses.length + filters.engagementTags.length + 
    (filters.dateFilter !== 'all' ? 1 : 0);

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

  const clearFilters = () => {
    setFilters({
      sources: [],
      statuses: [],
      engagementTags: [],
      dateRange: null,
      dateFilter: 'all'
    });
  };

  // Script editing functions
  const handleEditScript = (lead: Lead) => {
    setEditingScript(lead);
    
    // Check if lead has existing ScriptComponents (from the table)
    if (lead.ScriptComponents && lead.ScriptComponents.length > 0) {
      // Use existing custom script components
      const existingScript = lead.ScriptComponents[0];
      setScriptFormData({
        intro: existingScript.intro || '',
        hook: existingScript.hook || '',
        body1: existingScript.body1 || '',
        body2: existingScript.body2 || '',
        ending: existingScript.ending || ''
      });
    } else {
      // Use script_components JSON field or default templates
      setScriptFormData({
        intro: lead.script_components.intro || '',
        hook: lead.script_components.hook || '',
        body1: lead.script_components.body1 || '',
        body2: lead.script_components.body2 || '',
        ending: lead.script_components.ending || ''
      });
    }
    
    setEditScriptOpen(true);
  };

  const handleSaveScript = async () => {
    if (!editingScript) return;

    try {
      // Check if lead has existing ScriptComponents
      if (editingScript.ScriptComponents && editingScript.ScriptComponents.length > 0) {
        // Update existing script component
        const existingScriptId = editingScript.ScriptComponents[0].id;
        await eightbaseService.updateScriptComponents(existingScriptId, {
          body1: scriptFormData.body1,
          body2: scriptFormData.body2,
          ending: scriptFormData.ending,
          hook: scriptFormData.hook,
          intro: scriptFormData.intro
        });
      } else {
        // Create new script component
        await eightbaseService.createScriptComponents({
          body1: scriptFormData.body1,
          body2: scriptFormData.body2,
          ending: scriptFormData.ending,
          hook: scriptFormData.hook,
          intro: scriptFormData.intro,
          lead: {
            connect: { id: editingScript.id }
          }
        });
      }
      
      await loadData();
      setEditScriptOpen(false);
      setEditingScript(null);
    } catch (error) {
      console.error('Failed to save script:', error);
    }
  };

  const handleCopyScript = () => {
    const fullScript = generateScriptPreview();
    copyToClipboard(fullScript);
  };

  const generateScriptPreview = () => {
    const script = Object.values(scriptFormData).filter(text => text.trim()).join('\n\n');
    
    // Replace placeholders with actual lead data if editingScript is available
    if (editingScript) {
      return script
        .replace(/{name}/g, editingScript.lead_name)
        .replace(/{property_address}/g, 'your property')
        .replace(/{email}/g, editingScript.email || 'your email')
        .replace(/{phone}/g, editingScript.phone || 'your phone')
        .replace(/{instagram}/g, editingScript.instagram_handle || 'your Instagram');
    }
    
    return script;
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
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleImportLeads}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Upload className="mr-2 h-4 w-4" />
              Import from Monday
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExportLeads}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Leads
            </Button>
          <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
          </div>
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
                    {filteredLeads.length} of {leads.length} Leads
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="relative"
                    onClick={() => setFiltersOpen(true)}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredLeads.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {leads.length === 0 ? 'No leads yet.' : 'No leads match your filters.'}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    {leads.length === 0 
                      ? 'Add your first lead to start tracking outreach progress.'
                      : 'Try adjusting your filters or clear them to see all leads.'
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredLeads.map((lead) => {
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
                                    onClick={() => handleEditScript(lead)}
                                  >
                                    <Edit className="mr-1 h-3 w-3" />
                                    Edit
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
                                </div>
                              </div>
                              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border text-sm whitespace-pre-line min-h-[100px]">
                                {(() => {
                                  const hasCustomScript = Object.values(lead.script_components).some(component => component && component.trim());
                                  const scriptContent = generateScript(lead);
                                  
                                  if (hasCustomScript) {
                                    return scriptContent;
                                  } else {
                                    return scriptContent || 'No script created yet. Click "Edit" to customize or "Random" to generate one automatically using your DM templates.';
                                  }
                                })()}
                              </div>
                            </div>

                            {/* Lead Notes Section */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium flex items-center gap-2 text-gray-900 dark:text-white">
                                  <FileText className="h-4 w-4" />
                                  Lead Notes
                                </h4>
                                {editingNotes === lead.id ? (
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={handleCancelEditingNotes}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleNotesChange(lead.id, tempNotes)}
                                    >
                                      <Save className="mr-1 h-3 w-3" />
                                      Save
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStartEditingNotes(lead.id, lead.leadnote || '')}
                                  >
                                    <Edit className="mr-1 h-3 w-3" />
                                    Edit
                                  </Button>
                                )}
                              </div>
                              {editingNotes === lead.id ? (
                                <textarea
                                  value={tempNotes}
                                  onChange={(e) => setTempNotes(e.target.value)}
                                  placeholder="Add quick notes about this lead after calls..."
                                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm min-h-[80px] resize-none"
                                  autoFocus
                                />
                              ) : (
                                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border text-sm min-h-[80px]">
                                  {lead.leadnote || 'No notes yet. Click "Edit" to add quick notes about this lead.'}
                                </div>
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
                    Copy and customize these message templates.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Individual Template Cards */}
              <div className="space-y-3">
                {Object.entries(templateVariations).map(([type, templates]) => {
                  if (templates.length === 0) return null;
                  
                  const template = templates[0]; // Show first template as example
                  const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
                  
                  return (
                    <div key={type} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
                            {capitalizedType}
                          </h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {template.content}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(template.content)}
                          className="ml-3 h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <Separator />
              
              {/* <div className="flex gap-2">
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
              </div> */}
              
              {/* <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                <strong>How it works:</strong> Each script randomly selects 1 of 5 variations from each section to create unique messages.
              </div> */}
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

      {/* Filter Leads Modal */}
      {filtersOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-end p-4"
          onClick={() => setFiltersOpen(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-80 h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Filter Leads</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFiltersOpen(false)}
                  className="h-8 w-8 p-0 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Filter your leads by source, status, and engagement tags.
              </p>
              
              <div className="space-y-6">
                {/* Sources Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Sources</h3>
                  <div className="space-y-2">
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
                        <label htmlFor={`source-${source}`} className="text-sm text-gray-700 dark:text-gray-300">
                          {source}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Status</h3>
                  <div className="space-y-2">
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
                        <label htmlFor={`status-${status}`} className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {status}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Engagement Tags Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Engagement Tags</h3>
                  <div className="space-y-2">
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
                          <label htmlFor={`tag-${tag}`} className="text-sm text-gray-700 dark:text-gray-300">
                            {config.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Date Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Date Range</h3>
                  <div className="space-y-3">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="date-all"
                          name="dateFilter"
                          checked={filters.dateFilter === 'all'}
                          onChange={() => updateDateFilter('all')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="date-all" className="text-sm text-gray-700 dark:text-gray-300">All Time</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="date-week"
                          name="dateFilter"
                          checked={filters.dateFilter === 'week'}
                          onChange={() => updateDateFilter('week')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="date-week" className="text-sm text-gray-700 dark:text-gray-300">Last 7 Days</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="date-month"
                          name="dateFilter"
                          checked={filters.dateFilter === 'month'}
                          onChange={() => updateDateFilter('month')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="date-month" className="text-sm text-gray-700 dark:text-gray-300">Last 30 Days</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="date-custom"
                          name="dateFilter"
                          checked={filters.dateFilter === 'custom'}
                          onChange={() => updateDateFilter('custom')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="date-custom" className="text-sm text-gray-700 dark:text-gray-300">Custom Range</label>
                      </div>
                    </div>
                    
                    {filters.dateFilter === 'custom' && (
                      <div className="space-y-2 pl-6">
                        <div>
                          <Label htmlFor="start-date" className="text-xs text-gray-600 dark:text-gray-400">Start Date</Label>
                          <Input
                            id="start-date"
                            type="date"
                            value={filters.dateRange?.start || ''}
                            onChange={(e) => updateDateRange(
                              e.target.value,
                              filters.dateRange?.end || ''
                            )}
                            className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="end-date" className="text-xs text-gray-600 dark:text-gray-400">End Date</Label>
                          <Input
                            id="end-date"
                            type="date"
                            value={filters.dateRange?.end || ''}
                            onChange={(e) => updateDateRange(
                              filters.dateRange?.start || '',
                              e.target.value
                            )}
                            className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
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
            </div>
          </div>
        </div>
      )}

      {/* Edit DM Script Modal */}
      {editScriptOpen && editingScript && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Edit DM Script - {editingScript.lead_name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Customize the direct message script for this lead
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditScriptOpen(false)}
                  className="h-8 w-8 p-0 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Script Sections */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="intro" className="text-sm font-medium text-gray-900 dark:text-white">Intro</Label>
                    <Textarea
                      id="intro"
                      value={scriptFormData.intro}
                      onChange={(e) => setScriptFormData({...scriptFormData, intro: e.target.value})}
                      placeholder="Hi {name}! I noticed your luxury property listings."
                      className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="hook" className="text-sm font-medium text-gray-900 dark:text-white">Hook</Label>
                    <Textarea
                      id="hook"
                      value={scriptFormData.hook}
                      onChange={(e) => setScriptFormData({...scriptFormData, hook: e.target.value})}
                      placeholder="Your listings look amazing, and I specialize in photography that can help them stand out even more."
                      className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="body1" className="text-sm font-medium text-gray-900 dark:text-white">Body 1</Label>
                    <Textarea
                      id="body1"
                      value={scriptFormData.body1}
                      onChange={(e) => setScriptFormData({...scriptFormData, body1: e.target.value})}
                      placeholder="I work with several top agents in the area."
                      className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="body2" className="text-sm font-medium text-gray-900 dark:text-white">Body 2</Label>
                    <Textarea
                      id="body2"
                      value={scriptFormData.body2}
                      onChange={(e) => setScriptFormData({...scriptFormData, body2: e.target.value})}
                      placeholder="My photos typically help properties get 25% more views."
                      className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="ending" className="text-sm font-medium text-gray-900 dark:text-white">Ending</Label>
                    <Textarea
                      id="ending"
                      value={scriptFormData.ending}
                      onChange={(e) => setScriptFormData({...scriptFormData, ending: e.target.value})}
                      placeholder="Would you be interested in seeing some examples of my work?"
                      className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Complete Script Preview */}
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">Complete Script Preview</Label>
                  <div className="mt-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border text-sm whitespace-pre-line min-h-[120px]">
                    {generateScriptPreview() || 'Start typing above to see your script preview...'}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCopyScript}
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Script
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditScriptOpen(false)}
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveScript}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Save Script
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
