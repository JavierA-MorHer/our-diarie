import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Users } from 'react-feather';
import { CollaborationService, AuthService, type SharedDiary } from '../firebase';

interface InvitationPageProps {
  invitationCode: string;
  onInvitationAccepted: (diaryId: string) => void;
}

export function InvitationPage({ invitationCode, onInvitationAccepted }: InvitationPageProps) {
  const [sharedDiary, setSharedDiary] = useState<SharedDiary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadInvitation();
  }, [invitationCode]);

  const loadInvitation = async () => {
    try {
      const diary = await CollaborationService.getSharedDiary(invitationCode);
      if (!diary) {
        setError('Invitación no encontrada o inválida');
        return;
      }
      setSharedDiary(diary);
    } catch (error) {
      console.error('Error loading invitation:', error);
      setError('Error al cargar la invitación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      setError('Debes iniciar sesión para aceptar la invitación');
      return;
    }

    setIsAccepting(true);
    setError(null);

    try {
      await CollaborationService.acceptInvitation(invitationCode, currentUser.uid);
      setSuccess(true);
      onInvitationAccepted(sharedDiary!.id!);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError('Error al aceptar la invitación. Por favor, inténtalo de nuevo.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleSignIn = () => {
    // Redirect to sign in or open sign in modal
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#FAF8F1] flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D97746] mx-auto mb-4"></div>
          <p className="text-[#9A9B73] family-inter">Cargando invitación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen bg-[#FAF8F1] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h1 className="family-lora text-2xl text-[#4E443A] mb-4">Invitación no válida</h1>
          <p className="text-[#9A9B73] family-inter mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-[#D97746] text-white rounded-lg hover:bg-[#D97746]/90 transition-colors family-inter"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="h-screen w-screen bg-[#FAF8F1] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
          <h1 className="family-lora text-2xl text-[#4E443A] mb-4">¡Invitación aceptada!</h1>
          <p className="text-[#9A9B73] family-inter mb-6">
            Ya tienes acceso al diario "{sharedDiary?.title}". Puedes comenzar a colaborar ahora.
          </p>
          <button
            onClick={() => onInvitationAccepted(sharedDiary!.id!)}
            className="px-6 py-3 bg-[#D97746] text-white rounded-lg hover:bg-[#D97746]/90 transition-colors family-inter"
          >
            Abrir diario
          </button>
        </div>
      </div>
    );
  }

  const currentUser = AuthService.getCurrentUser();

  return (
    <div className="h-screen w-screen bg-[#FAF8F1] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="w-20 h-20 bg-[#D97746]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-[#D97746]" />
          </div>
          <h1 className="family-lora text-3xl text-[#4E443A] mb-4">
            Te invitaron a colaborar
          </h1>
          <p className="text-[#9A9B73] family-inter">
            Has sido invitado a colaborar en un diario compartido
          </p>
        </div>

        {/* Diary Info */}
        <div className="bg-white rounded-2xl p-6 mb-8 text-left">
          <h2 className="family-lora text-xl text-[#4E443A] mb-2">{sharedDiary?.title}</h2>
          {sharedDiary?.description && (
            <p className="text-[#9A9B73] family-inter text-sm mb-4">{sharedDiary.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-[#9A9B73] family-inter">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Creado {sharedDiary?.createdAt.toDate().toLocaleDateString('es-ES')}
            </span>
          </div>
        </div>

        {/* Action */}
        {currentUser ? (
          <div className="space-y-4">
            <button
              onClick={handleAcceptInvitation}
              disabled={isAccepting}
              className="w-full px-6 py-3 bg-[#D97746] text-white rounded-lg hover:bg-[#D97746]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors family-inter flex items-center justify-center gap-2"
            >
              {isAccepting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Aceptando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Aceptar invitación
                </>
              )}
            </button>
            <p className="text-xs text-[#9A9B73] family-inter">
              Al aceptar, podrás crear y editar entradas en este diario
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[#9A9B73] family-inter">
              Necesitas iniciar sesión para aceptar la invitación
            </p>
            <button
              onClick={handleSignIn}
              className="w-full px-6 py-3 bg-[#D97746] text-white rounded-lg hover:bg-[#D97746]/90 transition-colors family-inter"
            >
              Iniciar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}