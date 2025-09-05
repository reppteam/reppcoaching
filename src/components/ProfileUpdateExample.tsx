import React, { useState } from 'react';
import { updateUserProfileByRole, updateStudentProfile, updateCoachProfile, ProfileUpdateData } from '../utils/profileUpdateUtils';

/**
 * Example component demonstrating how to update Student or Coach records
 * based on user_id instead of updating the User model directly
 */
export function ProfileUpdateExample() {
  const [userId, setUserId] = useState('');
  const [userRole, setUserRole] = useState('');
  const [profileData, setProfileData] = useState<ProfileUpdateData>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateByRole = async () => {
    if (!userId || !userRole) {
      setError('Please provide both User ID and Role');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const updatedProfile = await updateUserProfileByRole(userId, userRole, profileData);
      setResult(updatedProfile);
      console.log('Profile updated successfully:', updatedProfile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to update profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStudent = async () => {
    if (!userId) {
      setError('Please provide User ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const updatedStudent = await updateStudentProfile(userId, profileData);
      setResult(updatedStudent);
      console.log('Student profile updated successfully:', updatedStudent);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to update student profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCoach = async () => {
    if (!userId) {
      setError('Please provide User ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const updatedCoach = await updateCoachProfile(userId, profileData);
      setResult(updatedCoach);
      console.log('Coach profile updated successfully:', updatedCoach);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to update coach profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileUpdateData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Profile Update Example</h2>
      <p className="text-gray-600 mb-6">
        This component demonstrates how to update Student or Coach records using user_id
        instead of updating the User model directly.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User ID
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter user ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User Role
          </label>
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select role</option>
            <option value="student">Student</option>
            <option value="coach">Coach</option>
            <option value="coach_manager">Coach Manager</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={profileData.firstName || ''}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="First name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={profileData.lastName || ''}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Last name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={profileData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone
          </label>
          <input
            type="tel"
            value={profileData.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name
          </label>
          <input
            type="text"
            value={profileData.business_name || ''}
            onChange={(e) => handleInputChange('business_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Business name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio (for coaches)
          </label>
          <textarea
            value={profileData.bio || ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Bio or description"
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleUpdateByRole}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update by Role'}
          </button>

          <button
            onClick={handleUpdateStudent}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Student'}
          </button>

          <button
            onClick={handleUpdateCoach}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Coach'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            <strong>Success!</strong> Profile updated successfully.
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
