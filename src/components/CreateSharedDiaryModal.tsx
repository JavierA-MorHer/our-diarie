import React, { useState } from 'react';
import { X, Users, Share2, Plus } from 'react-feather';
import { CollaborationService } from '../firebase';

interface CreateSharedDiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiaryCreated: (diaryId: string) => void;
}

export function CreateSharedDiaryModal({ isOpen, onClose, onDiaryCreated }: CreateSharedDiaryModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('El título es requerido');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const diaryId = await CollaborationService.createSharedDiary(title.trim(), description.trim());
      onDiaryCreated(diaryId);
      onClose();
      
      // Reset form
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Error creating shared diary:', error);
      setError('Error al crear el diario compartido. Por favor, inténtalo de nuevo.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (title.trim() || description.trim()) {
      if (confirm('¿Estás seguro de que quieres cancelar? Se perderán los cambios.')) {
        onClose();
        setTitle('');
        setDescription('');
        setError(null);
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#B9AE9D]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D97746]/10 rounded-lg flex items-center justify-center">
              <Share2 className="w-5 h-5 text-[#D97746]" />
            </div>
            <div>
              <h2 className="family-lora text-xl text-[#4E443A]">Crear Diario Compartido</h2>
              <p className="text-sm text-[#9A9B73] family-inter">Invita a otros a colaborar</p>
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
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-[#4E443A] mb-2 family-inter">
              Título del diario *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Nuestro diario de viaje"
              className="w-full px-4 py-3 border border-[#B9AE9D]/50 rounded-lg focus:ring-2 focus:ring-[#D97746]/20 focus:border-[#D97746] outline-none transition-colors family-inter text-[#4E443A] bg-white/50"
              required
            />
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[#4E443A] mb-2 family-inter">
              Descripción (opcional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe brevemente de qué trata este diario compartido..."
              rows={3}
              className="w-full px-4 py-3 border border-[#B9AE9D]/50 rounded-lg focus:ring-2 focus:ring-[#D97746]/20 focus:border-[#D97746] outline-none transition-colors family-inter text-[#4E443A] bg-white/50 resize-none"
            />
          </div>

          {/* Features Info */}
          <div className="bg-[#D97746]/5 border border-[#D97746]/20 rounded-lg p-4">
            <h3 className="family-inter font-medium text-[#4E443A] mb-2">¿Qué podrán hacer los colaboradores?</h3>
            <ul className="space-y-1 text-sm text-[#9A9B73] family-inter">
              <li className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Crear y editar entradas
              </li>
              <li className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Ver todas las entradas del diario
              </li>
              <li className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Agregar fotos y música
              </li>
            </ul>
          </div>

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
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isCreating || !title.trim()}
              className="flex-1 px-4 py-3 bg-[#D97746] text-white rounded-lg hover:bg-[#D97746]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors family-inter flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Crear Diario
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}