import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Move } from 'react-feather';

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
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const currentPhoto = photos[currentIndex];

  // Reset state when modal opens/closes or index changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
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
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case 'r':
        case 'R':
          handleRotate();
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
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setImageLoaded(false);
    setIsLoading(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setImageLoaded(false);
    setIsLoading(true);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.5, 5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.5, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageLoaded(false);
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && zoom > 1 && e.touches.length === 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (!isOpen || !currentPhoto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
        aria-label="Cerrar"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Navigation buttons */}
      {photos.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            aria-label="Imagen siguiente"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Image counter */}
      {photos.length > 1 && (
        <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/50 text-white rounded-full text-sm family-inter">
          {currentIndex + 1} / {photos.length}
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-black/50 rounded-full">
        <button
          onClick={handleZoomOut}
          className="p-1.5 sm:p-2 hover:bg-white/20 text-white rounded transition-colors"
          aria-label="Alejar"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-white text-xs sm:text-sm family-inter min-w-[2.5rem] sm:min-w-[3rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-1.5 sm:p-2 hover:bg-white/20 text-white rounded transition-colors"
          aria-label="Acercar"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-px h-4 sm:h-6 bg-white/30 mx-1 sm:mx-2" />
        <button
          onClick={handleRotate}
          className="p-1.5 sm:p-2 hover:bg-white/20 text-white rounded transition-colors"
          aria-label="Rotar"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        {zoom > 1 && (
          <>
            <div className="w-px h-4 sm:h-6 bg-white/30 mx-1 sm:mx-2" />
            <div className="p-1.5 sm:p-2 text-white/70">
              <Move className="w-4 h-4" />
            </div>
          </>
        )}
      </div>

      {/* Image container */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-2 sm:p-4"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-white"></div>
          </div>
        )}

        <div
          ref={imageContainerRef}
          className={`relative transition-transform duration-200 ${
            zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          }`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            maxWidth: zoom > 1 ? 'none' : '90vw',
            maxHeight: zoom > 1 ? 'none' : '80vh',
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <img
            src={currentPhoto.url}
            alt={currentPhoto.alt}
            className="max-w-full max-h-full object-contain select-none"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
              maxWidth: '90vw',
              maxHeight: '80vh',
            }}
            draggable={false}
          />
        </div>

        {!imageLoaded && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center family-inter">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <p className="text-sm sm:text-base">Error al cargar la imagen</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-16 sm:bottom-4 right-4 z-20 text-white/70 text-xs family-inter max-w-xs hidden sm:block">
        <p>Usa las flechas para navegar • + / - para zoom • R para rotar • ESC para cerrar</p>
        {zoom > 1 && <p className="mt-1">Arrastra para mover la imagen</p>}
      </div>
    </div>
  );
}
