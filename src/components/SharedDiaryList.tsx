import { useState, useEffect } from 'react';
import { Users, Share2, Plus, Eye } from 'react-feather';
import { CollaborationService, AuthService, type SharedDiary } from '../firebase';
import { CreateSharedDiaryModal } from './CreateSharedDiaryModal';
import { InviteCollaboratorModal } from './InviteCollaboratorModal';

interface SharedDiaryListProps {
  onSelectDiary: (diaryId: string) => void;
  selectedDiaryId?: string;
}

export function SharedDiaryList({ onSelectDiary, selectedDiaryId }: SharedDiaryListProps) {
  const [sharedDiaries, setSharedDiaries] = useState<SharedDiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedDiaryForInvite, setSelectedDiaryForInvite] = useState<SharedDiary | null>(null);

  const loadSharedDiaries = async () => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) return;

      const diaries = await CollaborationService.getSharedDiaries(currentUser.uid);
      setSharedDiaries(diaries);
    } catch (error) {
      console.error('Error loading shared diaries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSharedDiaries();
  }, []);

  const handleDiaryCreated = (diaryId: string) => {
    loadSharedDiaries();
    onSelectDiary(diaryId);
  };

  const handleInviteCollaborator = (diary: SharedDiary) => {
    setSelectedDiaryForInvite(diary);
    setShowInviteModal(true);
  };

  const handleInvitationSent = () => {
    // Could show a success message or refresh data
    console.log('Invitation sent successfully');
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D97746] mx-auto mb-4"></div>
        <p className="text-[#9A9B73] family-inter">Cargando diarios compartidos...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#B9AE9D]/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="family-lora text-lg text-[#4E443A]">Diarios Compartidos</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-[#D97746] text-white rounded-lg hover:bg-[#D97746]/90 transition-colors family-inter text-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo
          </button>
        </div>
      </div>

      {/* Diaries List */}
      <div className="flex-1 overflow-y-auto p-4">
        {sharedDiaries.length === 0 ? (
          <div className="text-center py-8">
            <Share2 className="w-12 h-12 text-[#9A9B73]/50 mx-auto mb-4" />
            <h3 className="family-lora text-[#4E443A] mb-2">No hay diarios compartidos</h3>
            <p className="text-[#9A9B73] family-inter text-sm mb-4">
              Crea un diario compartido para colaborar con otros
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-[#D97746] text-white rounded-lg hover:bg-[#D97746]/90 transition-colors family-inter text-sm"
            >
              Crear primer diario
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sharedDiaries.map((diary) => (
              <div
                key={diary.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedDiaryId === diary.id
                    ? 'border-[#D97746] bg-[#D97746]/5 shadow-md'
                    : 'border-[#B9AE9D]/30 bg-white hover:border-[#D97746]/50 hover:shadow-sm'
                }`}
                onClick={() => onSelectDiary(diary.id!)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="family-lora text-[#4E443A] font-medium line-clamp-1">
                    {diary.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInviteCollaborator(diary);
                      }}
                      className="p-1 text-[#9A9B73] hover:text-[#D97746] transition-colors"
                      title="Invitar colaborador"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {diary.description && (
                  <p className="text-sm text-[#9A9B73] family-inter line-clamp-2 mb-2">
                    {diary.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-[#9A9B73] family-inter">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    Compartido
                  </span>
                  <span>
                    Creado {diary.createdAt.toDate().toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateSharedDiaryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onDiaryCreated={handleDiaryCreated}
      />

      <InviteCollaboratorModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        diaryId={selectedDiaryForInvite?.id || ''}
        diaryTitle={selectedDiaryForInvite?.title || ''}
        shareCode={selectedDiaryForInvite?.shareCode || ''}
        onInvitationSent={handleInvitationSent}
      />
    </div>
  );
}