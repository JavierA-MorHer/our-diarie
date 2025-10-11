import { useState, useEffect } from 'react';
import { EntryList } from './components/EntryList';
import { DiaryEntry, type DiaryEntryData } from './components/DiaryEntry';
import { EntryForm } from './components/EntryForm';
import { EmptyState } from './components/EmptyState';
import { SharedDiaryEmptyState } from './components/SharedDiaryEmptyState';
import { CassettePlayer } from './components/CassettePlayer';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SharedDiaryList } from './components/SharedDiaryList';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { AuthService, FirestoreService, CollaborationService, type DiaryEntry as FirebaseDiaryEntry, type SharedDiary } from './firebase';
import { where } from 'firebase/firestore';
import { Share2 } from 'react-feather';

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

// Mock data for demonstration (fallback) - commented out to fix unused variable
//
 const mockEntries: DiaryEntryData[] = [
  {
    id: '1',
    title: 'Nuestro primer otoño juntos',
    date: '15 de octubre, 2024',
    content: `Hoy caminamos por el parque y las hojas doradas caían como confeti natural. Tú reías mientras intentabas atrapar una hoja al vuelo, y en ese momento supe que quería guardar para siempre el sonido de tu risa mezclándose con el susurro del viento otoñal.

Nos sentamos en esa banca donde siempre van las parejas de ancianos y hablamos de todo y de nada. De cómo el café sabe mejor cuando llueve, de nuestros sueños más tontos, de la forma en que el atardecer pinta el cielo de naranja justo como el color de tus ojos cuando sonríes.

Es curioso cómo los momentos más simples se convierten en los más preciados. No necesitamos grandes aventuras cuando tenemos esto: tu mano en la mía, el tiempo deteniéndose, y la certeza de que estoy exactamente donde debo estar.`,
    photos: [
      {
        id: 'p1',
        url: 'https://images.unsplash.com/photo-1666243072615-fbb0077f97ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXR1bW4lMjBsZWF2ZXMlMjB2aW50YWdlfGVufDF8fHx8MTc1OTYzMDA1MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        alt: 'Hojas de otoño'
      },
      {
        id: 'p2',
        url: 'https://images.unsplash.com/photo-1633771688235-56ec0e00ce97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwYXV0dW1uJTIwY29mZmVlfGVufDF8fHx8MTc1OTYzMDA1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        alt: 'Café otoñal'
      },
      {
        id: 'p3',
        url: 'https://images.unsplash.com/photo-1569100922032-b9702915dd02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGQlMjBwb2xhcm9pZCUyMHBob3Rvc3xlbnwxfHx8fDE3NTk2MzAwNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        alt: 'Fotos polaroid'
      }
    ],
    song: {
      title: 'Autumn Leaves',
      artist: 'Eva Cassidy'
    }
  },
  {
    id: '2',
    title: 'La carta que nunca envié',
    date: '8 de octubre, 2024',
    content: `Encontré una carta vieja que escribí antes de conocerte. Hablaba de cómo sería encontrar a mi persona especial, y es increíble lo cerca que estuve de la realidad. Escribí sobre alguien que me haría reír hasta que me doliera el estómago, que me amaría en mis días grises, que convertiría lo ordinario en extraordinario.

Y aquí estás tú, superando cada una de mis expectativas. Porque no solo eres todo lo que soñé, sino también cosas que ni siquiera sabía que necesitaba. Como la forma en que cantas bajo la ducha, o cómo siempre sabes qué decir cuando el mundo se siente demasiado pesado.

Esta carta nunca la envié porque estaba esperándote a ti para escribirla en persona.`,
    photos: [
      {
        id: 'p4',
        url: 'https://images.unsplash.com/photo-1722078141103-70ca6f653b76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwaGFuZHdyaXR0ZW4lMjBsZXR0ZXJzfGVufDF8fHx8MTc1OTYzMDA2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        alt: 'Cartas manuscritas'
      },
      {
        id: 'p5',
        url: 'https://images.unsplash.com/photo-1755812556054-3683bd731dd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY291cGxlJTIwcm9tYW5jZXxlbnwxfHx8fDE3NTk2MzAwNTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        alt: 'Romance vintage'
      }
    ],
    song: {
      title: 'The Way You Look Tonight',
      artist: 'Frank Sinatra'
    }
  }
 ];

export default function App() {
  const [entries, setEntries] = useState<DiaryEntryData[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntryData | null>(null);
  
  // Shared diary states
  const [currentDiaryType, setCurrentDiaryType] = useState<'personal' | 'shared'>('personal');
  const [currentSharedDiary, setCurrentSharedDiary] = useState<SharedDiary | null>(null);
  const [showSharedDiaries, setShowSharedDiaries] = useState(false);
  const [sharedDiariesRefreshTrigger, setSharedDiariesRefreshTrigger] = useState(0);
  
  // Delete states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedEntry = entries.find(entry => entry.id === selectedEntryId);

  // Load entries from Firebase when user is authenticated
  const loadEntries = async (userId: string, diaryId?: string, diaryType?: 'personal' | 'shared') => {
    const effectiveDiaryType = diaryType || currentDiaryType;
    setIsLoadingEntries(true);
    try {
      let firebaseEntries: FirebaseDiaryEntry[];

      if (diaryId && effectiveDiaryType === 'shared') {
        // Load shared diary entries
        console.log('📁 Loading shared diary entries for diaryId:', diaryId);
        firebaseEntries = await FirestoreService.getAll<FirebaseDiaryEntry>('diaryEntries', [
          where('diaryId', '==', diaryId)
        ]);
        console.log('✅ Loaded shared diary entries:', firebaseEntries.length);
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
                  console.log('📖 Cached diary title:', diary.title);
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
    } finally {
      console.log('✅ loadEntries finished, isLoadingEntries = false');
      setIsLoadingEntries(false);
    }
  };

  // Shared diary navigation
  const handleSelectSharedDiary = async (diaryId: string) => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) return;

      // Get shared diary details
      const sharedDiary = await FirestoreService.getById<SharedDiary>('sharedDiaries', diaryId);
      if (!sharedDiary) return;

      setCurrentSharedDiary(sharedDiary);
      setCurrentDiaryType('shared');
      setShowSharedDiaries(false);
      setSelectedEntryId(null);
      setIsEditing(false);

      // Load entries for this shared diary - pass 'shared' explicitly to avoid state timing issues
      await loadEntries(currentUser.uid, diaryId, 'shared');
    } catch (error) {
      console.error('Error selecting shared diary:', error);
    }
  };

  const handleInvitationAcceptance = async (invitationCode: string) => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        // User not authenticated, save invitation code and show welcome screen
        console.log('📧 User not authenticated, saving invitation code:', invitationCode);
        localStorage.setItem('pendingInvitation', invitationCode);
        setShowWelcome(true);
        return;
      }

      console.log('✅ User authenticated, processing invitation:', invitationCode);
      await CollaborationService.acceptInvitation(invitationCode, currentUser.uid);

      // Get the shared diary
      const sharedDiary = await CollaborationService.getSharedDiary(invitationCode);
      if (sharedDiary) {
        console.log('📖 Invitation accepted, opening shared diary:', sharedDiary.title);
        // Refresh shared diaries list and switch to shared diary view
        setSharedDiariesRefreshTrigger(prev => prev + 1);
        await handleSelectSharedDiary(sharedDiary.id!);

        // Clear the invitation code from URL and localStorage
        window.history.replaceState({}, '', window.location.pathname);
        localStorage.removeItem('pendingInvitation');

        // Show success message
        alert(`¡Invitación aceptada! Ahora tienes acceso al diario "${sharedDiary.title}".`);
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      // Clear the invitation from localStorage to avoid loops
      localStorage.removeItem('pendingInvitation');
      window.history.replaceState({}, '', window.location.pathname);

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al aceptar la invitación: ${errorMessage}\n\nPor favor, solicita una nueva invitación.`);
    }
  };

  // Check for invitation code in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const invitationCode = urlParams.get('invite');

    if (invitationCode) {
      // Handle invitation acceptance
      handleInvitationAcceptance(invitationCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check authentication status on app load
  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange(async (user) => {
      const isUserAuthenticated = !!user;
      setIsAuthenticated(isUserAuthenticated);

      if (isUserAuthenticated) {
        // User is authenticated, load entries and then stop loading
        await loadEntries(user.uid);
        setIsLoading(false);
        // Don't show welcome screen if user is already authenticated
        setShowWelcome(false);

        // Check for pending invitation after user is authenticated
        const pendingInvitation = localStorage.getItem('pendingInvitation');
        if (pendingInvitation) {
          console.log('🔓 User logged in, processing pending invitation:', pendingInvitation);
          localStorage.removeItem('pendingInvitation');
          // Process the pending invitation
          await handleInvitationAcceptance(pendingInvitation);
        }
      } else {
        // User is not authenticated
        setEntries([]);
        setIsLoading(false);
        setShowWelcome(true);
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const firebaseEntry = {
        title: entryData.title,
        content: entryData.content,
        date: new Date(entryData.date),
        photos: entryData.photos?.map(photo => photo.url) || [],
        mood: entryData.song?.title || null,
        tags: [],
        userId: currentUser.uid,
        diaryId: currentDiaryType === 'shared' ? currentSharedDiary?.id : undefined,
        createdBy: currentUser.uid,
        lastModifiedBy: currentUser.uid
      };

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
      setShowSharedDiaries(false);
      setSelectedEntryId(null);
      setIsEditing(false);

      // Load personal entries - pass 'personal' explicitly
      await loadEntries(currentUser.uid, undefined, 'personal');
    } catch (error) {
      console.error('Error switching to personal diary:', error);
    }
  };

  const handleBackFromSharedEntry = () => {
    // When viewing a shared diary entry, just deselect it to show the diary list
    setSelectedEntryId(null);
  };

  const handleShowSharedDiaries = () => {
    setShowSharedDiaries(true);
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

  const handleStartWriting = () => {
    if (isAuthenticated) {
      // User is already authenticated, just hide welcome screen
      setShowWelcome(false);
      setIsTransitioning(false);
    } else {
      // User needs to authenticate first
      setIsTransitioning(true);
      setTimeout(() => {
        setShowWelcome(false);
      }, 600); // Duración del fade out
    }
  };

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      setShowWelcome(true);
      setIsTransitioning(false);
      setSelectedEntryId(null);
      setEntries([]);
      setIsEditing(false);
      setEditingEntry(null);
      setCurrentDiaryType('personal');
      setCurrentSharedDiary(null);
      setShowSharedDiaries(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
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

  if (isLoadingEntries) {
    return (
      <div className="h-screen w-screen bg-[#FAF8F1] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D97746] mx-auto mb-4"></div>
          <p className="text-[#9A9B73] family-inter">Cargando entradas...</p>
        </div>
      </div>
    );
  }

  if (showWelcome || (!isAuthenticated && !isLoading)) {
    return <WelcomeScreen onStart={handleStartWriting} isTransitioning={isTransitioning} />;
  }

  // Show shared diaries list
  if (showSharedDiaries) {
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

        {/* Fixed Music Player */}
        {/* {isSidebarExpanded && (
          <div className="border-t border-[#B9AE9D]/30 bg-[#FAF8F1] p-4">
            <h4 className="family-lora mb-3 text-[#4E443A]">Nuestra canción</h4>
            {selectedEntry?.song ? (
              <CassettePlayer
                songTitle={selectedEntry.song.title}
                artist={selectedEntry.song.artist}
              />
            ) : (
              <div className="text-center py-4 text-[#9A9B73] family-inter">
                <p className="text-sm">Selecciona una entrada con música</p>
              </div>
            )}
          </div>
        )} */}
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