import React, { useState } from 'react';
import { assignCoachToStudent, disconnectCoachFromStudent } from '../utils/profileUpdateUtils';

/**
 * Example component demonstrating how to assign/disconnect coaches to/from students
 * by updating Student table records instead of User table records
 */
export function CoachAssignmentExample() {
  const [studentUserId, setStudentUserId] = useState('');
  const [coachUserId, setCoachUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAssignCoach = async () => {
    if (!studentUserId || !coachUserId) {
      setError('Please provide both Student User ID and Coach User ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const updatedStudent = await assignCoachToStudent(studentUserId, coachUserId);
      setResult(updatedStudent);
      console.log('Coach assigned successfully:', updatedStudent);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to assign coach:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectCoach = async () => {
    if (!studentUserId || !coachUserId) {
      setError('Please provide both Student User ID and Coach User ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const updatedStudent = await disconnectCoachFromStudent(studentUserId, coachUserId);
      setResult(updatedStudent);
      console.log('Coach disconnected successfully:', updatedStudent);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to disconnect coach:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Coach Assignment Example</h2>
      <p className="text-gray-600 mb-6">
        This component demonstrates how to assign/disconnect coaches to/from students
        by updating Student table records instead of User table records.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Student User ID
          </label>
          <input
            type="text"
            value={studentUserId}
            onChange={(e) => setStudentUserId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter student's user ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Coach User ID
          </label>
          <input
            type="text"
            value={coachUserId}
            onChange={(e) => setCoachUserId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter coach's user ID"
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleAssignCoach}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Assigning...' : 'Assign Coach'}
          </button>

          <button
            onClick={handleDisconnectCoach}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Disconnecting...' : 'Disconnect Coach'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            <strong>Success!</strong> Student record updated successfully.
            <div className="mt-2">
              <p><strong>Student:</strong> {result.firstName} {result.lastName}</p>
              <p><strong>Email:</strong> {result.email}</p>
              {result.coach && (
                <div className="mt-2">
                  <p><strong>Assigned Coach:</strong> {result.coach.firstName} {result.coach.lastName}</p>
                  <p><strong>Coach Email:</strong> {result.coach.email}</p>
                </div>
              )}
            </div>
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-md">
        <h3 className="font-semibold mb-2">How it works:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>Assign Coach:</strong> Updates the Student table record to connect the coach</li>
          <li>• <strong>Disconnect Coach:</strong> Updates the Student table record to disconnect the coach</li>
          <li>• <strong>No User table updates:</strong> Only the Student table is modified</li>
          <li>• <strong>Maintains relationships:</strong> The coach-student relationship is stored in the Student record</li>
        </ul>
      </div>
    </div>
  );
}
