import { Play, Pause } from 'react-feather';
import { useState } from 'react';

interface CassettePlayerProps {
  songTitle: string;
  artist: string;
}

export function CassettePlayer({ songTitle, artist }: CassettePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="flex items-center gap-4 p-3 bg-white/50 border border-[#B9AE9D]/30 rounded-lg shadow-sm">
      {/* Cassette Illustration */}
      <div className="relative w-24 h-16 bg-[#4E443A] rounded-sm shadow-md flex-shrink-0">
        {/* Cassette body */}
        <div className="absolute inset-1 bg-[#9A9B73] rounded-sm">
          {/* Tape reels */}
          <div className="absolute top-2 left-2 w-3 h-3 bg-[#4E443A] rounded-full"></div>
          <div className="absolute top-2 right-2 w-3 h-3 bg-[#4E443A] rounded-full"></div>
          
          {/* Tape window */}
          <div className="absolute bottom-1 left-1 right-1 h-3 bg-[#D97746]/20 rounded-sm">
            <div className="w-full h-full bg-gradient-to-r from-[#D97746]/30 to-[#9A9B73]/30 rounded-sm"></div>
          </div>
          
          {/* Label area */}
          <div className="absolute top-6 left-1 right-1 bottom-4 bg-white/80 rounded-sm flex items-center justify-center">
            <div className="text-[8px] text-[#4E443A] font-mono">♪</div>
          </div>
        </div>
        
        {/* Cassette holes */}
        <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-[#FAF8F1] rounded-full"></div>
        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-[#FAF8F1] rounded-full"></div>
      </div>

      {/* Song info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-[#4E443A] truncate family-lora">{songTitle}</h4>
        <p className="text-sm text-[#9A9B73] truncate family-inter">{artist}</p>
      </div>

      {/* Play button */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="w-10 h-10 bg-[#D97746] hover:bg-[#D97746]/90 rounded-full flex items-center justify-center text-white transition-colors shadow-md"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>
    </div>
  );
}