import { useState } from 'react';
import { X, Mail, UserPlus, Users, CheckCircle, AlertCircle } from 'react-feather';
import { CollaborationService } from '../firebase';

interface InviteCollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  diaryId: string;
  diaryTitle: string;
  shareCode: string;
  onInvitationSent: () => void;
}

export function InviteCollaboratorModal({ isOpen, onClose, diaryId, diaryTitle, shareCode, onInvitationSent }: InviteCollaboratorModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<'pending' | 'sent' | 'failed' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('El email es requerido');
      return;
    }

    if (!email.includes('@')) {
      setError('Por favor ingresa un email válido');
      return;
    }

    setIsInviting(true);
    setError(null);
    setSuccess(null);
    setEmailStatus('pending');

    try {
      await CollaborationService.inviteCollaborator(diaryId, email.trim(), role);
      
      // Show invitation link for testing
      const invitationLink = `${window.location.origin}?invite=${shareCode}`;
      console.log(`Invitation sent to ${email} for diary ${diaryId}`);
      console.log(`Invitation link: ${invitationLink}`);
      
      setEmailStatus('sent');
      setSuccess(`Invitación enviada a ${email}\n\nEnlace para pruebas: ${invitationLink}`);
      setEmail('');
      onInvitationSent();
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      setEmailStatus('failed');
      setError('Error al enviar la invitación. Por favor, inténtalo de nuevo.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setEmail('');
    setError(null);
    setSuccess(null);
    setEmailStatus(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#B9AE9D]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D97746]/10 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-[#D97746]" />
            </div>
            <div>
              <h2 className="family-lora text-xl text-[#4E443A]">Invitar Colaborador</h2>
              <p className="text-sm text-[#9A9B73] family-inter">{diaryTitle}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-[#9A9B73] hover:text-[#D97746] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#4E443A] mb-2 family-inter">
              Email del colaborador *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9A9B73]" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colaborador@ejemplo.com"
                className="w-full pl-10 pr-4 py-3 border border-[#B9AE9D]/50 rounded-lg focus:ring-2 focus:ring-[#D97746]/20 focus:border-[#D97746] outline-none transition-colors family-inter text-[#4E443A] bg-white/50"
                required
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-[#4E443A] mb-3 family-inter">
              Tipo de acceso
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border border-[#B9AE9D]/30 rounded-lg cursor-pointer hover:bg-[#D97746]/5 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="editor"
                  checked={role === 'editor'}
                  onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
                  className="mt-1 text-[#D97746] focus:ring-[#D97746]/20"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-[#D97746]" />
                    <span className="family-inter font-medium text-[#4E443A]">Editor</span>
                  </div>
                  <p className="text-sm text-[#9A9B73] family-inter">
                    Puede crear, editar y eliminar entradas
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border border-[#B9AE9D]/30 rounded-lg cursor-pointer hover:bg-[#D97746]/5 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="viewer"
                  checked={role === 'viewer'}
                  onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
                  className="mt-1 text-[#D97746] focus:ring-[#D97746]/20"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-[#9A9B73]" />
                    <span className="family-inter font-medium text-[#4E443A]">Solo lectura</span>
                  </div>
                  <p className="text-sm text-[#9A9B73] family-inter">
                    Solo puede ver las entradas, no editarlas
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Email Status Indicator */}
          {emailStatus && (
            <div className={`rounded-lg p-3 flex items-center gap-3 ${
              emailStatus === 'pending' ? 'bg-blue-50 border border-blue-200' :
              emailStatus === 'sent' ? 'bg-green-50 border border-green-200' :
              'bg-red-50 border border-red-200'
            }`}>
              {emailStatus === 'pending' && (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <p className="text-blue-700 text-sm family-inter">Enviando invitación por email...</p>
                </>
              )}
              {emailStatus === 'sent' && (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <p className="text-green-700 text-sm family-inter">Email enviado exitosamente</p>
                </>
              )}
              {emailStatus === 'failed' && (
                <>
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-red-700 text-sm family-inter">Error al enviar email (la invitación se guardó)</p>
                </>
              )}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-700 text-sm family-inter whitespace-pre-line">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm family-inter">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-[#B9AE9D] text-[#9A9B73] rounded-lg hover:bg-[#B9AE9D]/10 transition-colors family-inter"
            >
              Cerrar
            </button>
            
            <button
              type="submit"
              disabled={isInviting || !email.trim()}
              className="flex-1 px-4 py-3 bg-[#D97746] text-white rounded-lg hover:bg-[#D97746]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors family-inter flex items-center justify-center gap-2"
            >
              {isInviting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Enviar Invitación
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}