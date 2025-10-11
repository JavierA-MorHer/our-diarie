import { PhotoGallery } from './PhotoGallery';
import { Trash2, Edit3 } from 'react-feather';

export interface DiaryEntryData {
  id: string;
  title: string;
  date: string;
  content: string;
  photos: Array<{
    id: string;
    url: string;
    alt: string;
  }>;
  song?: {
    title: string;
    artist: string;
  };
  createdBy?: string;
  lastModifiedBy?: string;
}

interface DiaryEntryProps {
  entry: DiaryEntryData;
  onDelete?: (entryId: string) => void;
  onEdit?: (entryId: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function DiaryEntry({ entry, onDelete, onEdit, canEdit = false, canDelete = false }: DiaryEntryProps) {
  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-2">
            <h1 className="family-lora text-[#4E443A] flex-1">{entry.title}</h1>
            {(canEdit || canDelete) && (
              <div className="flex items-center gap-2 ml-4">
                {canEdit && onEdit && (
                  <button
                    onClick={() => onEdit(entry.id)}
                    className="p-2 text-[#9A9B73] hover:text-[#D97746] transition-colors rounded-lg hover:bg-[#D97746]/10"
                    title="Editar entrada"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
                {canDelete && onDelete && (
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="p-2 text-[#9A9B73] hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                    title="Eliminar entrada"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          <p className="text-sm text-[#9A9B73] family-inter mb-4">{entry.date}</p>
          <div className="hand-drawn-divider"></div>
        </div>

        {/* Content */}
        <div className="mb-8">
          <p className="family-inter leading-relaxed whitespace-pre-line text-[#4E443A]">
            {entry.content}
          </p>
        </div>

        {/* Photo Gallery */}
        {entry.photos.length > 0 && (
          <div className="mb-8">
            <PhotoGallery photos={entry.photos} />
          </div>
        )}

        {/* Signature */}
        <div className="mt-12 text-right">
          <p className="family-handwritten text-xl text-[#D97746]">Con amor, nosotros 💕</p>
        </div>
      </div>
    </div>
  );
}