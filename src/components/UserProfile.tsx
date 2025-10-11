import React from 'react';
import { AuthService } from '../firebase';

interface UserProfileProps {
  onSignOut: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onSignOut }) => {
  const user = AuthService.getCurrentUser();

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      onSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-[#D97746]/20">
        <div className="flex items-center space-x-3">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#4E443A] truncate">
              {user.displayName || user.email}
            </p>
            <p className="text-xs text-[#9A9B73]">
              {user.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-[#9A9B73] hover:text-[#D97746] transition-colors"
            title="Cerrar sesión"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;