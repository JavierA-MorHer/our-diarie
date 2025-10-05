import { PhotoGallery } from './PhotoGallery';

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
}

interface DiaryEntryProps {
  entry: DiaryEntryData;
}

export function DiaryEntry({ entry }: DiaryEntryProps) {
  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="family-lora mb-2 text-[#4E443A]">{entry.title}</h1>
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