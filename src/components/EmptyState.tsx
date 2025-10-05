import handsCoffeeImage from '../assets/Hands - Coffee.png';
import { WashiTape } from './WashiTape';

const romanticPhrases = [
  "Cada momento juntos merece ser recordado para siempre",
  "Las pequeñas cosas que compartimos son las que más atesoro",
  "Tu risa es mi melodía favorita, guardémosla aquí",
  "Nuestros momentos más simples son los más preciados",
  "Cada día contigo es una página que quiero escribir",
  "Los recuerdos que creamos son nuestro tesoro más valioso",
  "En cada momento compartido encuentro razones para sonreír",
  "Tus abrazos son el mejor lugar para guardar mis memorias"
];

export function EmptyState() {
  const randomPhrase = romanticPhrases[Math.floor(Math.random() * romanticPhrases.length)];

  return (
    <div className="h-full p-4 sm:p-8 md:p-12 overflow-auto">
      <div className="max-w-5xl mx-auto relative">
        {/* Ilustración - centrada en móvil, flotante en desktop */}
        <div className="mb-6 relative mx-auto w-fit sm:float-right sm:ml-8 sm:mt-4 transform rotate-2 sm:rotate-3">
          <img
            src={handsCoffeeImage}
            alt="Manos sosteniendo café"
            className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 object-contain opacity-90 drop-shadow-lg mx-auto"
          />
          {/* Cintas washi decorativas */}
        </div>

        {/* Título manuscrito */}
        <div className="mb-6 sm:mb-8">
          <h1 className="family-handwritten text-3xl sm:text-4xl md:text-5xl text-[#4E443A] mb-2">
            Nuestra primera página
          </h1>
          <div className="hand-drawn-divider" style={{ width: '100%', maxWidth: '60%' }}></div>
        </div>

        {/* Texto que fluye */}
        <div className="space-y-4 sm:space-y-6">
          <p className="family-lora text-lg sm:text-xl leading-relaxed text-[#4E443A]">
            {randomPhrase}
          </p>

          <p className="family-inter text-base sm:text-lg leading-relaxed text-[#9A9B73]">
            Este diario está esperando ser llenado con nuestras historias,
            las risas compartidas, los pequeños detalles que solo nosotros entendemos,
            y todos esos momentos que hacen que nuestro amor sea único.
          </p>

          <p className="family-inter text-base sm:text-lg leading-relaxed text-[#9A9B73]">
            Cada página será un tesoro. Cada palabra, una memoria.
            Cada foto, un instante congelado en el tiempo.
          </p>

          {/* Anotación manuscrita como llamado a la acción */}
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t-2 border-dashed border-[#B9AE9D]/40 clear-both">
            <p className="family-handwritten text-2xl sm:text-3xl text-[#D97746] mb-2 transform -rotate-1">
              → Haz clic en "Nueva entrada" para escribir nuestro primer recuerdo...
            </p>
            <div className="ml-4 sm:ml-12">
              <p className="family-handwritten text-lg sm:text-2xl text-[#9A9B73] transform rotate-1">
                (¡No podemos esperar a ver qué escribes! ✨)
              </p>
            </div>
          </div>

          {/* Cita al final */}
          <div className="mt-8 sm:mt-16 p-4 sm:p-6 bg-[#D97746]/5 border-l-4 border-[#D97746] italic">
            <p className="family-inter text-sm sm:text-base text-[#4E443A]">
              "Los mejores momentos no son solo recuerdos, son promesas de que la vida puede ser hermosa."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
