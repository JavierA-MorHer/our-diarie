import { useState, useEffect } from 'react';
import { SharedDiaryList } from '../SharedDiaryList';
import { Share2 } from 'react-feather';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthService, CollaborationService, type SharedDiary } from '../../firebase';
import { HomeView } from './HomeView';

interface SharedDiariesViewProps {
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function SharedDiariesView({ isAuthenticated, isLoading }: SharedDiariesViewProps) {
  const navigate = useNavigate();
  const { entryId } = useParams();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [currentSharedDiary, setCurrentSharedDiary] = useState<SharedDiary | null>(null);
  const [sharedDiariesRefreshTrigger, setSharedDiariesRefreshTrigger] = useState(0);

  const handleSelectSharedDiary = async (diaryId: string) => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) return;

      // Get shared diary details
      const sharedDiary = await CollaborationService.getSharedDiaryById(diaryId);
      if (!sharedDiary) return;

      setCurrentSharedDiary(sharedDiary);
      // Don't navigate away, just update the state to show entries
    } catch (error) {
      console.error('Error selecting shared diary:', error);
    }
  };

  const handleBackToPersonalDiary = async () => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) return;

      setCurrentSharedDiary(null);
      navigate('/');
    } catch (error) {
      console.error('Error switching to personal diary:', error);
    }
  };

  const handleShowSharedDiaries = () => {
    // This would open the create shared diary modal
    // For now, we'll just refresh the list
    setSharedDiariesRefreshTrigger(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#FAF8F1] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D97746] mx-auto mb-4"></div>
          <p className="text-[#9A9B73] family-inter">Cargando...</p>
        </div>
      </div>
    );
  }

  // If there's an entryId in the URL or a diary is selected, show the HomeView
  if (entryId || currentSharedDiary) {
    return <HomeView isAuthenticated={isAuthenticated} isLoading={isLoading} isLoadingEntries={false} initialSharedDiary={currentSharedDiary} />;
  }

  return (
    <div className="h-screen bg-[#FAF8F1] flex flex-col md:flex-row animate-fadeIn">
      {/* Left Panel - Shared Diaries List */}
      <div className={`flex-shrink-0 flex flex-col transition-all duration-500 ease-in-out ${
        isSidebarExpanded ? 'w-full md:w-80' : 'w-full md:w-16'
      }`}>
        <div className="flex-1 min-h-0">
          <SharedDiaryList
            onSelectDiary={handleSelectSharedDiary}
            selectedDiaryId={currentSharedDiary?.id}
            refreshTrigger={sharedDiariesRefreshTrigger}
            onBackToPersonalDiary={handleBackToPersonalDiary}
          />
        </div>
      </div>

      {/* Right Panel - Empty State */}
      <div className="flex-1 bg-[#FAF8F1]">
        <div className="h-full p-8 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-[#D97746]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Share2 className="w-8 h-8 text-[#D97746]" />
            </div>
            <h2 className="family-lora text-2xl text-[#4E443A] mb-4">
              Diarios Compartidos
            </h2>
            <p className="text-[#9A9B73] family-inter mb-6">
              Aquí puedes ver y gestionar todos los diarios que compartes con otros.
              Crea un nuevo diario compartido para comenzar a colaborar.
            </p>
            <button
              onClick={handleShowSharedDiaries}
              className="bg-[#D97746] hover:bg-[#D97746]/90 text-white py-3 px-6 rounded-lg transition-colors family-inter"
            >
              Crear nuevo diario compartido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
