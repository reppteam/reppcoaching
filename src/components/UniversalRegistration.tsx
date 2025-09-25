import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, User, GraduationCap, Shield } from 'lucide-react';
import { userRegistrationService, UserRegistrationData, CoachRegistrationData, StudentRegistrationData } from '../services/userRegistrationService';

interface UniversalRegistrationProps {
  onSuccess?: (response: any) => void;
  onCancel?: () => void;
}

export function UniversalRegistration({ onSuccess, onCancel }: UniversalRegistrationProps) {
  const [step, setStep] = useState<'role' | 'student' | 'coach'>('role');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Common form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as 'user' | 'coach' | 'coach_manager' | 'super_admin' | ''
  });

  // Student-specific data
  const [studentData, setStudentData] = useState({
    businessName: '',
    location: '',
    targetMarket: '',
    goals: '',
    challenges: ''
  });

  // Coach-specific data
  const [coachData, setCoachData] = useState({
    experience: '',
    specialties: [] as string[],
    bio: '',
    hourlyRate: 0,
    phone: ''
  });

  const handleRoleSelect = (role: string) => {
    setFormData(prev => ({ ...prev, role: role as any }));
    if (role === 'user') {
      setStep('student');
    } else if (role === 'coach' || role === 'coach_manager') {
      setStep('coach');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Validate password strength
      const passwordValidation = userRegistrationService.validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
      }

      // Validate email
      if (!userRegistrationService.validateEmail(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      let registrationData: UserRegistrationData;

      if (formData.role === 'user') {
        // Student registration
        registrationData = {
          ...formData,
          ...studentData
        } as StudentRegistrationData;
      } else {
        // Coach registration
        registrationData = {
          ...formData,
          ...coachData
        } as CoachRegistrationData;
      }

      const response = await userRegistrationService.registerUser(registrationData);
      
      setSuccess(response.message);
      
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSelection = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Choose Your Role</CardTitle>
        <CardDescription className="text-center">
          Select the type of account you want to create
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="w-full h-20 flex flex-col items-center justify-center space-y-2"
          onClick={() => handleRoleSelect('user')}
        >
          <GraduationCap className="h-6 w-6" />
          <div>
            <div className="font-medium">Student</div>
            <div className="text-sm text-muted-foreground">Real estate photographer learning</div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="w-full h-20 flex flex-col items-center justify-center space-y-2"
          onClick={() => handleRoleSelect('coach')}
        >
          <User className="h-6 w-6" />
          <div>
            <div className="font-medium">Coach</div>
            <div className="text-sm text-muted-foreground">Experienced photographer teaching</div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="w-full h-20 flex flex-col items-center justify-center space-y-2"
          onClick={() => handleRoleSelect('coach_manager')}
        >
          <Shield className="h-6 w-6" />
          <div>
            <div className="font-medium">Coach Manager</div>
            <div className="text-sm text-muted-foreground">Manage coaches and students</div>
          </div>
        </Button>

        {onCancel && (
          <Button variant="ghost" className="w-full" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const renderStudentForm = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-black dark:text-white">
          <GraduationCap className="h-5 w-5" />
          Student Registration
        </CardTitle>
        <CardDescription>
          Create your student account to start learning real estate photography
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Business Information */}
          <div>
            <Label htmlFor="businessName">Business Name (Optional)</Label>
            <Input
              id="businessName"
              value={studentData.businessName}
              onChange={(e) => setStudentData(prev => ({ ...prev, businessName: e.target.value }))}
              placeholder="Your photography business name"
            />
          </div>

          <div>
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              value={studentData.location}
              onChange={(e) => setStudentData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="City, State"
            />
          </div>

          <div>
            <Label htmlFor="targetMarket">Target Market (Optional)</Label>
            <Input
              id="targetMarket"
              value={studentData.targetMarket}
              onChange={(e) => setStudentData(prev => ({ ...prev, targetMarket: e.target.value }))}
              placeholder="e.g., Luxury homes, commercial properties"
            />
          </div>

          <div>
            <Label htmlFor="goals">Your Goals (Optional)</Label>
            <Textarea
              id="goals"
              value={studentData.goals}
              onChange={(e) => setStudentData(prev => ({ ...prev, goals: e.target.value }))}
              placeholder="What do you want to achieve?"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="challenges">Current Challenges (Optional)</Label>
            <Textarea
              id="challenges"
              value={studentData.challenges}
              onChange={(e) => setStudentData(prev => ({ ...prev, challenges: e.target.value }))}
              placeholder="What challenges are you facing?"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('role')}
              className="flex-1"
            >
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Student Account
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const renderCoachForm = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-black dark:text-white">
          <User className="h-5 w-5" />
          Coach Registration
        </CardTitle>
        <CardDescription>
          Create your coach account to start teaching real estate photography
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={coachData.phone}
              onChange={(e) => setCoachData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="experience">Years of Experience</Label>
            <Select
              value={coachData.experience}
              onValueChange={(value) => setCoachData(prev => ({ ...prev, experience: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-2">1-2 years</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="6-10">6-10 years</SelectItem>
                <SelectItem value="10+">10+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="hourlyRate">Hourly Rate (Optional)</Label>
            <Input
              id="hourlyRate"
              type="number"
              value={coachData.hourlyRate}
              onChange={(e) => setCoachData(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) || 0 }))}
              placeholder="50"
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Textarea
              id="bio"
              value={coachData.bio}
              onChange={(e) => setCoachData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about your experience and teaching style..."
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('role')}
              className="flex-1"
            >
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Coach Account
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {step === 'role' && renderRoleSelection()}
        {step === 'student' && renderStudentForm()}
        {step === 'coach' && renderCoachForm()}
      </div>
    </div>
  );
} 