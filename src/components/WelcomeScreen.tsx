import handsBookImage from '../assets/Hands - Book.png';
import { WashiTape } from './WashiTape';

interface WelcomeScreenProps {
  onStart: () => void;
  isTransitioning: boolean;
}

export function WelcomeScreen({ onStart, isTransitioning }: WelcomeScreenProps) {
  return (
    <div className={`h-screen w-screen bg-[#FAF8F1] flex items-center justify-center p-8 transition-opacity duration-600 ${
      isTransitioning ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="text-center max-w-2xl">
        <div className="mb-12 relative inline-block">
          <img
            src={handsBookImage}
            alt="Libro de memorias"
            className="w-80 h-80 mx-auto object-contain drop-shadow-2xl"
          />
          {/* Cintas washi decorativas en el libro */}
        </div>

        <h1 className="family-handwritten text-5xl mb-6 text-[#4E443A]">
          Bienvenida a Nuestro Diario
        </h1>

        <p className="text-lg text-[#9A9B73] family-inter leading-relaxed mb-4">
          Este es nuestro espacio especial, donde cada momento compartido se convierte en un tesoro guardado.
        </p>

        <p className="text-md text-[#9A9B73] family-inter leading-relaxed mb-12">
          Aquí escribiremos sobre las risas, los abrazos, las aventuras y esos pequeños instantes
          que hacen que nuestro amor sea único. Cada página es una promesa de que siempre recordaremos
          lo hermoso que es estar juntos.
        </p>

        {/* Llamado a la acción manuscrito */}
        <div onClick={onStart} className="cursor-pointer group inline-block">
          <p className="family-handwritten text-3xl text-[#D97746] mb-2 transform -rotate-1
                        group-hover:scale-105 transition-transform">
            → Toca aquí para abrir nuestro diario
          </p>
        </div>
      </div>
    </div>
  );
}
