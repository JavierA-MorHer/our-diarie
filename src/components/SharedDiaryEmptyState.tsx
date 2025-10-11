import { Users, Share2, Plus } from 'react-feather';

interface SharedDiaryEmptyStateProps {
  diaryTitle: string;
  onCreateEntry: () => void;
  onCreateNewDiary: () => void;
}

export function SharedDiaryEmptyState({ 
  diaryTitle, 
  onCreateEntry, 
  onCreateNewDiary 
}: SharedDiaryEmptyStateProps) {
  return (
    <div className="h-full p-4 sm:p-8 md:p-12 overflow-auto">
      <div className="max-w-4xl mx-auto text-center">
        
        {/* Header del diario compartido */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#D97746]/10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-[#D97746]" />
            </div>
            <h1 className="family-lora text-2xl sm:text-3xl text-[#4E443A]">
              {diaryTitle}
            </h1>
          </div>
          <p className="text-[#9A9B73] family-inter text-sm">
            Diario compartido • Colaborativo
          </p>
        </div>

        {/* Estado vacío */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-[#9A9B73]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-[#9A9B73]" />
          </div>
          <h2 className="family-lora text-xl text-[#4E443A] mb-4">
            Aún no hay entradas en este diario
          </h2>
          <p className="text-[#9A9B73] family-inter mb-6">
            Este diario compartido está esperando sus primeras memorias.
            Tú y tus colaboradores pueden crear entradas juntos.
          </p>
        </div>

        {/* Opciones de acción */}
        <div className="space-y-4">
          <button
            onClick={onCreateEntry}
            className="w-full max-w-sm mx-auto bg-[#D97746] hover:bg-[#D97746]/90 text-white py-2 px-2 rounded-lg flex items-center justify-center gap-2 transition-colors family-inter text-lg font-medium"
          >
            <Plus className="w-5 h-5" />
            Crear primera entrada
          </button>



      
        </div>

      </div>
    </div>
  );
}