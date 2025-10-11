import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'react-feather';

interface Photo {
  id: string;
  url: string;
  alt: string;
}

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
  initialIndex: number;
}

export function ImageModal({ isOpen, onClose, photos, initialIndex }: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  const currentPhoto = photos[currentIndex];

  // Reset state when modal opens/closes or index changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setImageLoaded(false);
      setIsLoading(true);
    }
  }, [isOpen, initialIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    setImageLoaded(false);
    setIsLoading(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    setImageLoaded(false);
    setIsLoading(true);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageLoaded(false);
  };

  if (!isOpen || !currentPhoto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
        aria-label="Cerrar"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation buttons */}
      {photos.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            aria-label="Imagen siguiente"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image counter */}
      {photos.length > 1 && (
        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/50 text-white rounded-full text-sm family-inter">
          {currentIndex + 1} / {photos.length}
        </div>
      )}

      {/* Image container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        <img
          src={currentPhoto.url}
          alt={currentPhoto.alt}
          className="max-w-full max-h-full object-contain"
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />

        {!imageLoaded && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center family-inter">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8" />
              </div>
              <p>Error al cargar la imagen</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
