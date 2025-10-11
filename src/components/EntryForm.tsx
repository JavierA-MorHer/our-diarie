import React, { useState, useRef } from 'react';
import { Save, X, Calendar, Type, Camera, Upload, Trash2 } from 'react-feather';
import type { DiaryEntryData } from './DiaryEntry';
import { StorageService, AuthService } from '../firebase';
import { LazyImage } from './LazyImage';

interface EntryFormProps {
  onSave: (entry: Omit<DiaryEntryData, 'id'>) => void;
  onCancel: () => void;
  initialData?: Partial<DiaryEntryData>;
}

export function EntryForm({ onSave, onCancel, initialData }: EntryFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setPhotos(prev => [...prev, ...imageFiles]);
      
      // Create previews
      imageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPhotoPreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async (): Promise<Array<{ id: string; url: string; alt: string }>> => {
    if (photos.length === 0) return initialData?.photos || [];

    setIsUploadingPhotos(true);
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const uploadedPhotos = await Promise.all(
        photos.map(async (file, index) => {
          const timestamp = Date.now();
          const fileName = `${timestamp}_${index}_${file.name}`;
          // Use the structure that matches the storage rules
          const path = `diary-photos/${currentUser.uid}/${Date.now()}/${fileName}`;
          
          const result = await StorageService.uploadFile(file, path);
          return {
            id: `p${Date.now()}_${index}`,
            url: result.url,
            alt: `Foto ${index + 1}`
          };
        })
      );
      
      return [...(initialData?.photos || []), ...uploadedPhotos];
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !date || !content.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    setIsSaving(true);
    try {
      const uploadedPhotos = await uploadPhotos();
      
      await onSave({
        title: title.trim(),
        date,
        content: content.trim(),
        photos: uploadedPhotos,
        song: initialData?.song
      });
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Error al guardar la entrada');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      if (confirm('¿Estás seguro de que quieres cancelar? Se perderán los cambios.')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-[#FAF8F1]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="family-lora mb-6 text-[#4E443A] text-2xl">
            {initialData?.id ? 'Editar entrada' : 'Nueva entrada'}
          </h1>
          <div className="hand-drawn-divider"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-[#4E443A] mb-2 family-inter">
              <Type className="w-4 h-4 inline mr-2" />
              Título
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="¿Cómo titularías este momento?"
              className="w-full px-4 py-3 border border-[#B9AE9D]/50 rounded-lg focus:ring-2 focus:ring-[#D97746]/20 focus:border-[#D97746] outline-none transition-colors family-inter text-[#4E443A] bg-white/50"
              required
            />
          </div>

          {/* Date Field */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-[#4E443A] mb-2 family-inter">
              <Calendar className="w-4 h-4 inline mr-2" />
              Fecha
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border border-[#B9AE9D]/50 rounded-lg focus:ring-2 focus:ring-[#D97746]/20 focus:border-[#D97746] outline-none transition-colors family-inter text-[#4E443A] bg-white/50"
              required
            />
          </div>

          {/* Content Field */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-[#4E443A] mb-2 family-inter">
              <Type className="w-4 h-4 inline mr-2" />
              Tu recuerdo
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe aquí tu recuerdo... ¿Qué pasó? ¿Cómo te sentiste? ¿Qué detalles quieres recordar para siempre?"
              rows={12}
              className="w-full px-4 py-3 border border-[#B9AE9D]/50 rounded-lg focus:ring-2 focus:ring-[#D97746]/20 focus:border-[#D97746] outline-none transition-colors family-inter text-[#4E443A] bg-white/50 resize-none"
              required
            />
            <p className="text-xs text-[#9A9B73] mt-2 family-inter">
              {content.length} caracteres
            </p>
          </div>

          {/* Photos Field */}
          <div>
            <label className="block text-sm font-medium text-[#4E443A] mb-2 family-inter">
              <Camera className="w-4 h-4 inline mr-2" />
              Fotos (opcional)
            </label>
            
            {/* Photo Upload Button */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border border-[#B9AE9D]/50 rounded-lg hover:border-[#D97746] hover:bg-[#D97746]/5 transition-colors family-inter text-[#4E443A]"
              >
                <Upload className="w-4 h-4" />
                Agregar fotos
              </button>
              <p className="text-xs text-[#9A9B73] mt-1 family-inter">
                Puedes seleccionar múltiples fotos a la vez
              </p>
            </div>

            {/* Photo Previews */}
            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <LazyImage
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-[#B9AE9D]/30"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {photos[index]?.name || `Foto ${index + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Progress */}
            {isUploadingPhotos && (
              <div className="flex items-center gap-2 text-sm text-[#9A9B73] family-inter">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#D97746]"></div>
                Subiendo fotos...
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-4 pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-6 sm:py-3 border border-[#B9AE9D] text-[#9A9B73] rounded-lg hover:bg-[#B9AE9D]/10 transition-colors family-inter text-sm sm:text-base flex-1 sm:flex-initial"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Cancelar</span>
            </button>

            <button
              type="submit"
              disabled={isSaving || isUploadingPhotos || !title.trim() || !date || !content.trim()}
              className="flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-6 sm:py-3 bg-[#D97746] text-white rounded-lg hover:bg-[#D97746]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors family-inter text-sm sm:text-base flex-1 sm:flex-initial"
            >
              {isSaving || isUploadingPhotos ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">{isUploadingPhotos ? 'Subiendo fotos...' : 'Guardando...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Guardar entrada</span>
                  <span className="sm:hidden">Guardar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}