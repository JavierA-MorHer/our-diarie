import { useState } from 'react';
import { LazyImage } from './LazyImage';
import { WashiTape } from './WashiTape';
import { ImageModal } from './ImageModal';

interface Photo {
  id: string;
  url: string;
  alt: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Predefined rotations and positions for natural scatter effect
  const photoStyles = [
    { rotation: -3, zIndex: 1, top: '0%', left: '5%' },
    { rotation: 2, zIndex: 3, top: '15%', left: '25%' },
    { rotation: -1, zIndex: 2, top: '8%', left: '50%' },
    { rotation: 4, zIndex: 4, top: '25%', left: '10%' },
    { rotation: -2, zIndex: 1, top: '35%', left: '40%' },
    { rotation: 1, zIndex: 2, top: '30%', left: '65%' },
  ];

  // Variantes de cintas washi para cada foto
  const washiVariants = [
    { variant: 'dots' as const, color: '#D97746', position: 'top-left' as const },
    { variant: 'stripes' as const, color: '#9A9B73', position: 'top-right' as const },
    { variant: 'solid' as const, color: '#B9AE9D', position: 'top-left' as const },
    { variant: 'dots' as const, color: '#9A9B73', position: 'top-right' as const },
    { variant: 'stripes' as const, color: '#D97746', position: 'top-left' as const },
    { variant: 'solid' as const, color: '#D97746', position: 'top-right' as const },
  ];

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="relative h-96 my-8 overflow-hidden">
        {photos.slice(0, 6).map((photo, index) => {
          const style = photoStyles[index] || photoStyles[0];
          const washi = washiVariants[index] || washiVariants[0];

          return (
            <div
              key={photo.id}
              className="absolute w-32 h-32 md:w-36 md:h-36 transition-transform duration-300 hover:scale-105 hover:z-50 cursor-pointer"
              style={{
                transform: `rotate(${style.rotation}deg)`,
                zIndex: style.zIndex,
                top: style.top,
                left: style.left,
              }}
              onClick={() => handleImageClick(index)}
            >
              <div className="w-full h-full bg-white p-2 shadow-lg border border-[#B9AE9D]/30 relative">
                <LazyImage
                  src={photo.url}
                  alt={photo.alt}
                  className="w-full h-full object-cover"
                />
                {/* Cinta washi "pegando" la foto */}
                <WashiTape
                  variant={washi.variant}
                  color={washi.color}
                  rotation={style.rotation > 0 ? -12 : 15}
                  position={washi.position}
                />
                {/* Overlay para indicar que es clickeable */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-200 rounded-sm" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para ver imágenes en grande */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        photos={photos}
        initialIndex={selectedImageIndex}
      />
    </>
  );
}