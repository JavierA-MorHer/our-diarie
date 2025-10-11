import { Plus, Calendar, Heart, LogOut, Users, ArrowLeft, Share2 } from 'react-feather';
import type { DiaryEntryData } from './DiaryEntry';
import { AuthService } from '../firebase';

interface EntryListProps {
  entries: DiaryEntryData[];
  selectedEntry: string | null;
  onSelectEntry: (id: string) => void;
  onNewEntry: () => void;
  onSignOut: () => void;
  isExpanded: boolean;
  onToggleSidebar: () => void;
  currentDiaryType?: 'personal' | 'shared';
  currentSharedDiary?: { id: string; title: string } | null;
  onShowSharedDiaries?: () => void;
  onBackToPersonalDiary?: () => void;
}

// Rotaciones aleatorias para cada entrada (se mantienen consistentes)
const getRotation = (index: number) => {
  const rotations = [0.5, -0.8, 1.2, -0.5, 0.8, -1, 0.7, -1.2, 0.3, -0.6];
  return rotations[index % rotations.length];
};

export function EntryList({ 
  entries, 
  selectedEntry, 
  onSelectEntry, 
  onNewEntry, 
  onSignOut, 
  isExpanded, 
  onToggleSidebar,
  currentDiaryType = 'personal',
  currentSharedDiary,
  onShowSharedDiaries,
  onBackToPersonalDiary
}: EntryListProps) {
  const user = AuthService.getCurrentUser();
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Usuario';
  return (
    <div className="w-full h-full bg-[#FAF8F1] flex flex-col relative shadow-[4px_0_12px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="p-3 md:p-6 border-b border-[#B9AE9D]/30">
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSidebar}
              className="text-[#D97746] hover:text-[#D97746]/80 transition-colors"
              aria-label={isExpanded ? 'Colapsar sidebar' : 'Expandir sidebar'}
            >
              <Heart className="w-5 h-5" />
            </button>
            {isExpanded && (
              <div className="flex items-center gap-2">
                {currentDiaryType === 'shared' && onBackToPersonalDiary && (
                  <button
                    onClick={onBackToPersonalDiary}
                    className="text-[#9A9B73] hover:text-[#D97746] transition-colors"
                    title="Volver a mi diario personal"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <h2 className="family-lora text-sm md:text-base text-[#4E443A]">
                  {currentDiaryType === 'shared' && currentSharedDiary 
                    ? currentSharedDiary.title 
                    : 'El Diario de Lo Nuestro'
                  }
                </h2>
                {currentDiaryType === 'shared' && (
                  <div title="Diario compartido">
                    <Users className="w-4 h-4 text-[#D97746]" />
                  </div>
                )}
              </div>
            )}
          </div>
          
          {isExpanded && (
            <div className="flex items-center gap-3">
              {currentDiaryType === 'personal' && onShowSharedDiaries && (
                <button
                  onClick={onShowSharedDiaries}
                  className="text-[#9A9B73] hover:text-[#D97746] transition-colors"
                  title="Ver diarios compartidos"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}
              <span className="text-xs text-[#9A9B73] family-inter">
                ({userName})
              </span>
              <button
                onClick={onSignOut}
                className="text-[#9A9B73] hover:text-[#D97746] transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {isExpanded && (
          <button
            onClick={onNewEntry}
            className="w-full bg-[#D97746] hover:bg-[#D97746]/90 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors family-inter text-sm md:text-base"
          >
            <Plus className="w-4 h-4" />
            Nueva entrada
          </button>
        )}
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {entries.length === 0 ? (
          <div className="p-6 text-center text-[#9A9B73] family-inter">
            {isExpanded && (
              <>
                <Calendar className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p>Aún no hay entradas.</p>
                <p className="text-sm mt-1">¡Crea tu primera memoria!</p>
              </>
            )}
          </div>
        ) : (
          <div className={isExpanded ? "p-2 md:p-4" : "p-2"}>
            {entries.map((entry, index) => {
              const isSelected = selectedEntry === entry.id;
              const rotation = isSelected ? 0 : getRotation(index);

              return (
                <button
                  key={entry.id}
                  onClick={() => onSelectEntry(entry.id)}
                  style={{
                    transform: isExpanded ? `rotate(${rotation}deg)` : 'none',
                  }}
                  className={`w-full mb-3 md:mb-4 rounded-sm text-left transition-all duration-300 ${
                    isExpanded ? 'p-3 md:p-4' : 'p-2'
                  } ${
                    isSelected
                      ? 'bg-white border-2 border-[#D97746] shadow-[0_4px_12px_rgba(217,119,70,0.15)] scale-105 z-10'
                      : 'bg-[#FAF8F1] border border-[#B9AE9D]/30 shadow-[2px_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[4px_4px_12px_rgba(0,0,0,0.12)] hover:scale-[1.02]'
                  }`}
                >
                  {isExpanded ? (
                    <>
                      <h3 className="family-lora text-sm md:text-base mb-1 line-clamp-2 text-[#4E443A]">{entry.title}</h3>
                      <p className="text-xs text-[#9A9B73] family-inter mb-2 md:mb-3">{entry.date}</p>

                      {/* Preview indicators */}
                      <div className="flex items-center gap-2">
                        {entry.photos.length > 0 && (
                          <span className="text-xs bg-[#9A9B73]/20 text-[#9A9B73] px-2 py-1 rounded-full family-inter">
                            {entry.photos.length} foto{entry.photos.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        {entry.song && (
                          <span className="text-xs bg-[#D97746]/20 text-[#D97746] px-2 py-1 rounded-full family-inter">
                            ♪ Música
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-8 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#9A9B73]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}