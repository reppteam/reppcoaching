import React, { useState, useEffect } from 'react';
import { eightbaseService } from '../services/8baseService';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User, MapPin, Target, Award, AlertTriangle, Target as TargetIcon, MessageSquare, Clock, FileText } from 'lucide-react';
import { StudentProfile } from '../types';

export const EditOwnProfile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [formData, setFormData] = useState({
    business_name: '',
    location: '',
    target_market: '',
    strengths: '',
    challenges: '',
    goals: '',
    preferred_contact_method: '',
    availability: '',
    notes: ''
  });

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await eightbaseService.getStudentProfile(user!.id);
      setProfile(profileData);
      
      if (profileData) {
        setFormData({
          business_name: profileData.business_name || '',
          location: profileData.location || '',
          target_market: profileData.target_market || '',
          strengths: profileData.strengths || '',
          challenges: profileData.challenges || '',
          goals: profileData.goals || '',
          preferred_contact_method: profileData.preferred_contact_method || '',
          availability: profileData.availability || '',
          notes: profileData.notes || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setSaving(true);
      const updatedProfile = await eightbaseService.updateStudentProfile(user.id, formData);
      setProfile(updatedProfile);
      // You could add a success toast here
    } catch (error) {
      console.error('Error updating profile:', error);
      // You could add an error toast here
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit My Profile
          </CardTitle>
          <CardDescription>
            Update your business profile and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                  placeholder="Your business name"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="City, State"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="target_market">Target Market</Label>
              <Input
                id="target_market"
                value={formData.target_market}
                onChange={(e) => setFormData({...formData, target_market: e.target.value})}
                placeholder="e.g., Luxury homes, Commercial properties, New construction"
              />
            </div>

            {/* Strengths and Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="strengths">Your Strengths</Label>
                <Textarea
                  id="strengths"
                  value={formData.strengths}
                  onChange={(e) => setFormData({...formData, strengths: e.target.value})}
                  placeholder="What are you good at?"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="challenges">Areas for Improvement</Label>
                <Textarea
                  id="challenges"
                  value={formData.challenges}
                  onChange={(e) => setFormData({...formData, challenges: e.target.value})}
                  placeholder="What would you like to improve?"
                  rows={4}
                />
              </div>
            </div>

            {/* Goals */}
            <div>
              <Label htmlFor="goals">Your Goals</Label>
              <Textarea
                id="goals"
                value={formData.goals}
                onChange={(e) => setFormData({...formData, goals: e.target.value})}
                placeholder="What are your business goals?"
                rows={3}
              />
            </div>

            {/* Contact Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferred_contact_method">Preferred Contact Method</Label>
                <Select
                  value={formData.preferred_contact_method}
                  onValueChange={(value) => setFormData({...formData, preferred_contact_method: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  value={formData.availability}
                  onChange={(e) => setFormData({...formData, availability: e.target.value})}
                  placeholder="e.g., Weekday evenings, Weekend mornings"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Any additional information about your business or preferences"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};