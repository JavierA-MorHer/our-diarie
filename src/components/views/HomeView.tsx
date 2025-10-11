import { useState, useEffect } from 'react';
import { EntryList } from '../EntryList';
import { DiaryEntry, type DiaryEntryData } from '../DiaryEntry';
import { EntryForm } from '../EntryForm';
import { EmptyState } from '../EmptyState';
import { SharedDiaryEmptyState } from '../SharedDiaryEmptyState';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal';
import { AuthService, FirestoreService, CollaborationService, type DiaryEntry as FirebaseDiaryEntry, type SharedDiary } from '../../firebase';
import { where } from 'firebase/firestore';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

// Function to transform Firebase data to component format
const transformFirebaseEntry = async (firebaseEntry: FirebaseDiaryEntry, sharedDiaryCache?: Map<string, string>, collaboratorsCache?: Map<string, string>): Promise<DiaryEntryData> => {
  // Handle date conversion
  let dateString = '';

  if (firebaseEntry.date) {
    if (firebaseEntry.date instanceof Date) {
      dateString = firebaseEntry.date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } else {
      // Handle Firestore Timestamp
      dateString = firebaseEntry.date.toDate().toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  }

  // Get additional info for shared diary entries (only if we have caches)
  let diaryTitle: string | undefined;
  let createdByName: string | undefined;

  if (firebaseEntry.diaryId && sharedDiaryCache) {
    diaryTitle = sharedDiaryCache.get(firebaseEntry.diaryId);
  }

  if (firebaseEntry.createdBy && collaboratorsCache) {
    createdByName = collaboratorsCache.get(firebaseEntry.createdBy);
  }

  return {
    id: firebaseEntry.id || '',
    title: firebaseEntry.title,
    date: dateString,
    content: firebaseEntry.content,
    photos: (firebaseEntry.photos || []).map((url, index) => ({
      id: `p${index + 1}`,
      url: url,
      alt: `Foto ${index + 1}`
    })),
    song: firebaseEntry.mood ? {
      title: firebaseEntry.mood,
      artist: 'Nuestro Diario'
    } : undefined,
    diaryId: firebaseEntry.diaryId,
    diaryTitle,
    createdBy: firebaseEntry.createdBy,
    createdByName
  };
};

interface HomeViewProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoadingEntries: boolean;
  initialSharedDiary?: SharedDiary | null;
}

export function HomeView({ isAuthenticated, isLoading, isLoadingEntries, initialSharedDiary }: HomeViewProps) {
  const navigate = useNavigate();
  const { diaryId, entryId } = useParams();
  const location = useLocation();
  
  // Check if we're in the shared diaries context
  const isInSharedDiariesContext = location.pathname.startsWith('/diarios-compartidos');
  
  const [entries, setEntries] = useState<DiaryEntryData[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(entryId || null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntryData | null>(null);
  
  // Shared diary states
  const [currentDiaryType, setCurrentDiaryType] = useState<'personal' | 'shared'>('personal');
  const [currentSharedDiary, setCurrentSharedDiary] = useState<SharedDiary | null>(null);
  
  // Delete states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedEntry = entries.find(entry => entry.id === selectedEntryId);

  // Load entries from Firebase when user is authenticated
  const loadEntries = async (userId: string, diaryId?: string, diaryType?: 'personal' | 'shared') => {
    const effectiveDiaryType = diaryType || currentDiaryType;
    try {
      let firebaseEntries: FirebaseDiaryEntry[];

      if (diaryId && effectiveDiaryType === 'shared') {
        // Load shared diary entries
        firebaseEntries = await FirestoreService.getAll<FirebaseDiaryEntry>('diaryEntries', [
          where('diaryId', '==', diaryId)
        ]);
      } else {
        // Load personal diary entries
        firebaseEntries = await FirestoreService.getDiaryEntries(userId);
      }

      // Build caches for shared diary info and collaborator names
      const sharedDiaryCache = new Map<string, string>();
      const collaboratorsCache = new Map<string, string>();

      // Add current user to collaborators cache
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        collaboratorsCache.set(
          currentUser.uid,
          currentUser.displayName || currentUser.email?.split('@')[0] || 'Usuario'
        );
      }

      // Get unique diary IDs and creator IDs
      const diaryIds = new Set<string>();
      firebaseEntries.forEach(entry => {
        if (entry.diaryId) diaryIds.add(entry.diaryId);
      });

      // Load diary titles
      if (diaryIds.size > 0) {
        try {
          await Promise.all(
            Array.from(diaryIds).map(async (id) => {
              try {
                const diary = await FirestoreService.getById<SharedDiary>('sharedDiaries', id);
                if (diary?.title) {
                  sharedDiaryCache.set(id, diary.title);
                }

                // Load collaborators for this diary
                const collaborators = await CollaborationService.getCollaborators(id);
                collaborators.forEach(collab => {
                  if (collab.userName) {
                    collaboratorsCache.set(collab.userId, collab.userName);
                  }
                });
              } catch (err) {
                console.error(`❌ Error loading diary ${id}:`, err);
              }
            })
          );
        } catch (error) {
          console.error('❌ Error loading shared diary info:', error);
        }
      }

      // Transform entries with caches
      const transformedEntries = await Promise.all(
        firebaseEntries.map(entry => transformFirebaseEntry(entry, sharedDiaryCache, collaboratorsCache))
      );
      setEntries(transformedEntries);
    } catch (error) {
      console.error('❌ Error loading entries:', error);
      // Show empty state instead of mock data
      setEntries([]);
      alert('Error al cargar las entradas. Por favor, verifica tu conexión e intenta de nuevo.');
    }
  };

  // Load data based on URL params or initial shared diary
  useEffect(() => {
    if (!isAuthenticated) return;

    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return;

    const loadData = async () => {
      if (initialSharedDiary) {
        // Loading from shared diaries context
        setCurrentSharedDiary(initialSharedDiary);
        setCurrentDiaryType('shared');
        await loadEntries(currentUser.uid, initialSharedDiary.id, 'shared');
      } else if (diaryId) {
        // Loading shared diary from URL
        try {
          const sharedDiary = await CollaborationService.getSharedDiaryById(diaryId);
          if (sharedDiary) {
            setCurrentSharedDiary(sharedDiary);
            setCurrentDiaryType('shared');
            await loadEntries(currentUser.uid, diaryId, 'shared');
          } else {
            // Diary not found, redirect to home
            navigate('/');
          }
        } catch (error) {
          console.error('Error loading shared diary:', error);
          navigate('/');
        }
      } else {
        // Loading personal diary
        setCurrentDiaryType('personal');
        setCurrentSharedDiary(null);
        await loadEntries(currentUser.uid);
      }
    };

    loadData();
  }, [diaryId, isAuthenticated, navigate, initialSharedDiary]);

  // Update URL when entry is selected
  useEffect(() => {
    if (selectedEntryId) {
      let newPath: string;
      if (isInSharedDiariesContext) {
        // If we're in shared diaries context, use the shared diaries URL
        newPath = `/diarios-compartidos/entrada/${selectedEntryId}`;
      } else if (diaryId) {
        // If we're in a specific diary, use the diary URL
        newPath = `/diario/${diaryId}/entrada/${selectedEntryId}`;
      } else {
        // Personal diary entry
        newPath = `/entrada/${selectedEntryId}`;
      }
      navigate(newPath, { replace: true });
    } else if (diaryId && !selectedEntryId) {
      // If we're in a diary but no entry is selected, go to diary view
      navigate(`/diario/${diaryId}`, { replace: true });
    } else if (isInSharedDiariesContext && !selectedEntryId) {
      // If we're in shared diaries context but no entry is selected, go to shared diaries
      navigate('/diarios-compartidos', { replace: true });
    }
  }, [selectedEntryId, diaryId, navigate, isInSharedDiariesContext]);

  const handleSelectEntry = (id: string) => {
    // Si se hace clic en la entrada ya seleccionada, deseleccionarla
    setSelectedEntryId(selectedEntryId === id ? null : id);
  };

  const handleNewEntry = () => {
    setEditingEntry(null);
    setIsEditing(true);
    setSelectedEntryId(null);
  };

  const handleSaveEntry = async (entryData: Omit<DiaryEntryData, 'id'>) => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      // Check if user can edit current diary
      if (currentDiaryType === 'shared' && currentSharedDiary) {
        const canEdit = await CollaborationService.canUserEditDiary(currentSharedDiary.id!, currentUser.uid);
        if (!canEdit) {
          throw new Error('No tienes permisos para editar este diario');
        }
      }

      // Transform to Firebase format
      const firebaseEntry: any = {
        title: entryData.title,
        content: entryData.content,
        date: new Date(entryData.date),
        photos: entryData.photos?.map(photo => photo.url) || [],
        mood: entryData.song?.title || null,
        tags: [],
        userId: currentUser.uid,
        createdBy: currentUser.uid,
        lastModifiedBy: currentUser.uid
      };

      // Only add diaryId if it's a shared diary (avoid undefined values in Firestore)
      if (currentDiaryType === 'shared' && currentSharedDiary?.id) {
        firebaseEntry.diaryId = currentSharedDiary.id;
      } else {
        // For personal diary entries, explicitly set diaryId to null to avoid undefined
        firebaseEntry.diaryId = null;
      }

      // Save to Firebase
      const entryId = await FirestoreService.createDiaryEntry(firebaseEntry);
      
      // Transform back to component format
      const newEntry: DiaryEntryData = {
        id: entryId,
        ...entryData
      };

      // Update local state
      setEntries(prev => [newEntry, ...prev]);
      setSelectedEntryId(entryId);
      setIsEditing(false);
      setEditingEntry(null);
    } catch (error) {
      console.error('Error saving entry:', error);
      throw error;
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingEntry(null);
  };

  const handleBackToPersonalDiary = async () => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) return;

      setCurrentDiaryType('personal');
      setCurrentSharedDiary(null);
      setSelectedEntryId(null);
      setIsEditing(false);

      // Load personal entries - pass 'personal' explicitly
      await loadEntries(currentUser.uid, undefined, 'personal');
      navigate('/');
    } catch (error) {
      console.error('Error switching to personal diary:', error);
    }
  };

  const handleBackFromSharedEntry = () => {
    // When viewing a shared diary entry, just deselect it to show the diary list
    setSelectedEntryId(null);
  };

  const handleShowSharedDiaries = () => {
    if (isInSharedDiariesContext) {
      // If we're already in shared diaries context, just refresh
      window.location.reload();
    } else {
      navigate('/diarios-compartidos');
    }
  };

  // Delete functions
  const handleDeleteEntry = (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
      setDeleteItem({
        id: entryId,
        name: entry.title
      });
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    setIsDeleting(true);
    try {
      // Delete entry
      if (currentDiaryType === 'shared' && currentSharedDiary) {
        await FirestoreService.delete('diaryEntries', deleteItem.id);
      } else {
        await FirestoreService.deleteDiaryEntry(deleteItem.id);
      }
      
      // Remove from local state
      setEntries(prev => prev.filter(entry => entry.id !== deleteItem.id));
      setSelectedEntryId(null);
      
      setShowDeleteModal(false);
      setDeleteItem(null);
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Error al eliminar la entrada. Por favor, inténtalo de nuevo.');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteItem(null);
  };

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading || isLoadingEntries) {
    return (
      <div className="h-screen w-screen bg-[#FAF8F1] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D97746] mx-auto mb-4"></div>
          <p className="text-[#9A9B73] family-inter">
            {isLoading ? 'Cargando...' : 'Cargando entradas...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#FAF8F1] flex flex-col md:flex-row animate-fadeIn">
      {/* Left Panel - Entry List + Music Player */}
      <div className={`flex-shrink-0 flex flex-col transition-all duration-500 ease-in-out ${
        isSidebarExpanded ? 'w-full md:w-80' : 'w-full md:w-16'
      }`}>
        {/* Entry List */}
        <div className="flex-1 min-h-0">
          <EntryList
            entries={entries}
            selectedEntry={selectedEntryId}
            onSelectEntry={handleSelectEntry}
            onNewEntry={handleNewEntry}
            onSignOut={handleSignOut}
            isExpanded={isSidebarExpanded}
            onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
            currentDiaryType={currentDiaryType}
            currentSharedDiary={currentSharedDiary ? { id: currentSharedDiary.id!, title: currentSharedDiary.title } : null}
            onShowSharedDiaries={handleShowSharedDiaries}
            onBackToPersonalDiary={handleBackToPersonalDiary}
            onBackFromEntry={handleBackFromSharedEntry}
          />
        </div>
      </div>

      {/* Right Panel - Entry Detail or Form */}
      <div className="flex-1 bg-[#FAF8F1]">
        {isEditing ? (
          <EntryForm
            onSave={handleSaveEntry}
            onCancel={handleCancelEdit}
            initialData={editingEntry || undefined}
          />
        ) : selectedEntry ? (
          <DiaryEntry
            entry={selectedEntry}
            onDelete={handleDeleteEntry}
            canDelete={true}
          />
        ) : currentDiaryType === 'shared' && currentSharedDiary && entries.length === 0 ? (
          <SharedDiaryEmptyState
            diaryTitle={currentSharedDiary.title}
            onCreateEntry={handleNewEntry}
            onCreateNewDiary={handleShowSharedDiaries}
          />
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Eliminar entrada"
        message="¿Estás seguro de que quieres eliminar esta entrada? Se perderá todo el contenido permanentemente."
        itemName={deleteItem?.name || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
}
