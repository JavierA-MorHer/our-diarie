import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { WelcomeScreen } from './components/WelcomeScreen';
import { HomeView } from './components/views/HomeView';
import { SharedDiariesView } from './components/views/SharedDiariesView';
import { AuthService, CollaborationService } from './firebase';

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange((user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleInvitationAcceptance = async (invitationCode: string) => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        // User not authenticated, save invitation code and show welcome screen
        console.log('📧 User not authenticated, saving invitation code:', invitationCode);
        localStorage.setItem('pendingInvitation', invitationCode);
        return;
      }

      console.log('✅ User authenticated, processing invitation:', invitationCode);
      console.log('👤 Current user:', currentUser.email, currentUser.uid);

      // Accept the invitation
      console.log('📝 Accepting invitation...');
      await CollaborationService.acceptInvitation(invitationCode, currentUser.uid);
      console.log('✅ Invitation accepted successfully');

      // Get the shared diary
      console.log('📖 Fetching shared diary details...');
      const sharedDiary = await CollaborationService.getSharedDiary(invitationCode);

      if (sharedDiary) {
        console.log('✅ Shared diary found:', sharedDiary.title, sharedDiary.id);

        // Navigate to the shared diary
        console.log('📂 Opening shared diary...');
        navigate(`/diario/${sharedDiary.id}`);
        console.log('✅ Shared diary opened successfully');

        // Clear the invitation code from URL and localStorage ONLY after success
        window.history.replaceState({}, '', window.location.pathname);
        localStorage.removeItem('pendingInvitation');
        console.log('🧹 Cleaned up invitation code from URL and localStorage');

        // Show success message
        alert(`¡Invitación aceptada! Ahora tienes acceso al diario "${sharedDiary.title}".`);
      } else {
        console.error('❌ Shared diary not found after accepting invitation');
        throw new Error('No se pudo encontrar el diario compartido');
      }
    } catch (error) {
      console.error('❌ Error accepting invitation:', error);

      // Clear the invitation from localStorage to avoid loops
      localStorage.removeItem('pendingInvitation');
      window.history.replaceState({}, '', window.location.pathname);

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al aceptar la invitación: ${errorMessage}\n\nPor favor, solicita una nueva invitación.`);

      // Re-throw to let the caller know there was an error
      throw error;
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
        // Check for pending invitation FIRST, before loading entries
        const pendingInvitation = localStorage.getItem('pendingInvitation');

        if (pendingInvitation) {
          console.log('🔓 User logged in, processing pending invitation:', pendingInvitation);
          try {
            // Don't remove from localStorage yet - let handleInvitationAcceptance do it
            // Process the pending invitation
            await handleInvitationAcceptance(pendingInvitation);
          } catch (invitationError) {
            console.error('❌ Failed to process pending invitation:', invitationError);
            // Navigate to home as fallback
            navigate('/');
          }
        }
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartWriting = () => {
    if (isAuthenticated) {
      // User is already authenticated, just navigate to home
      navigate('/');
      setIsTransitioning(false);
    } else {
      // User needs to authenticate first
      setIsTransitioning(true);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 600); // Duración del fade out
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

  // Show welcome screen for unauthenticated users on root path
  if (!isAuthenticated && location.pathname === '/') {
    return <WelcomeScreen onStart={handleStartWriting} isTransitioning={isTransitioning} />;
  }

    return (
    <Routes>
      {/* Welcome/Login Route */}
      <Route 
        path="/" 
        element={
          !isAuthenticated ? (
            <WelcomeScreen onStart={handleStartWriting} isTransitioning={isTransitioning} />
          ) : (
            <Navigate to="/home" replace />
          )
        } 
      />
      
      {/* Protected Routes */}
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <HomeView isAuthenticated={isAuthenticated} isLoading={isLoading} isLoadingEntries={false} initialSharedDiary={null} />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/diario/:diaryId" 
        element={
          <ProtectedRoute>
            <HomeView isAuthenticated={isAuthenticated} isLoading={isLoading} isLoadingEntries={false} initialSharedDiary={null} />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/diario/:diaryId/entrada/:entryId" 
        element={
          <ProtectedRoute>
            <HomeView isAuthenticated={isAuthenticated} isLoading={isLoading} isLoadingEntries={false} initialSharedDiary={null} />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/entrada/:entryId" 
        element={
          <ProtectedRoute>
            <HomeView isAuthenticated={isAuthenticated} isLoading={isLoading} isLoadingEntries={false} initialSharedDiary={null} />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/diarios-compartidos" 
        element={
          <ProtectedRoute>
            <SharedDiariesView isAuthenticated={isAuthenticated} isLoading={isLoading} />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/diarios-compartidos/entrada/:entryId" 
        element={
          <ProtectedRoute>
            <SharedDiariesView isAuthenticated={isAuthenticated} isLoading={isLoading} />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch all route - redirect to home for authenticated users, welcome for unauthenticated */}
      <Route 
        path="*" 
        element={
          isAuthenticated ? (
            <Navigate to="/home" replace />
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />
    </Routes>
  );
}