import React, { useState, useEffect } from 'react';
import { testFirebaseConnection, AuthService } from '../firebase';

interface FirebaseTestProps {
  onTestComplete?: (success: boolean) => void;
}

export const FirebaseTest: React.FC<FirebaseTestProps> = ({ onTestComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    // Check current user status
    const unsubscribe = AuthService.onAuthStateChange((user) => {
      setCurrentUser(user ? user.email : null);
    });

    return () => unsubscribe();
  }, []);

  const runTest = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const success = await testFirebaseConnection();
      
      setTestResult({
        success,
        message: success 
          ? 'Firebase connection successful!' 
          : 'Firebase connection failed',
        details: success 
          ? 'All Firebase services are properly configured and accessible.'
          : 'Check your configuration and network connection.'
      });

      onTestComplete?.(success);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Firebase test error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      
      onTestComplete?.(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        🔥 Firebase Connection Test
      </h2>
      
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          <p><strong>Current User:</strong> {currentUser || 'Not signed in'}</p>
        </div>

        <button
          onClick={runTest}
          disabled={isLoading}
          className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isLoading ? 'Testing...' : 'Test Firebase Connection'}
        </button>

        {testResult && (
          <div className={`p-4 rounded-md ${
            testResult.success 
              ? 'bg-green-100 border border-green-300 text-green-800'
              : 'bg-red-100 border border-red-300 text-red-800'
          }`}>
            <div className="flex items-center">
              <span className="text-lg mr-2">
                {testResult.success ? '✅' : '❌'}
              </span>
              <span className="font-medium">{testResult.message}</span>
            </div>
            {testResult.details && (
              <p className="text-sm mt-2 opacity-90">
                {testResult.details}
              </p>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Services tested:</strong></p>
          <ul className="list-disc list-inside ml-2">
            <li>Firestore Database</li>
            <li>Authentication</li>
            <li>Storage (if configured)</li>
            <li>Analytics (if configured)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTest;