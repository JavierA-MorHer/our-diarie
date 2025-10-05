interface WashiTapeProps {
  variant?: 'dots' | 'stripes' | 'solid';
  color?: string;
  rotation?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function WashiTape({
  variant = 'dots',
  color = '#D97746',
  rotation = -12,
  position = 'top-right'
}: WashiTapeProps) {

  const positionClasses = {
    'top-left': '-top-3 -left-3',
    'top-right': '-top-3 -right-3',
    'bottom-left': '-bottom-3 -left-3',
    'bottom-right': '-bottom-3 -right-3',
  };

  const patterns = {
    dots: (
      <pattern id={`dots-${variant}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="10" cy="10" r="2" fill="rgba(255,255,255,0.4)" />
      </pattern>
    ),
    stripes: (
      <pattern id={`stripes-${variant}`} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect x="0" y="0" width="5" height="10" fill="rgba(255,255,255,0.3)" />
      </pattern>
    ),
    solid: null
  };

  return (
    <div
      className={`absolute ${positionClasses[position]} z-20 pointer-events-none`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <svg width="100" height="40" viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {patterns[variant]}
        </defs>

        {/* Sombra de la cinta */}
        <rect
          x="2"
          y="3"
          width="96"
          height="34"
          rx="2"
          fill="rgba(0,0,0,0.1)"
          opacity="0.5"
        />

        {/* Base de la cinta */}
        <rect
          x="0"
          y="0"
          width="96"
          height="34"
          rx="2"
          fill={color}
          opacity="0.85"
        />

        {/* Patrón decorativo */}
        {variant !== 'solid' && (
          <rect
            x="0"
            y="0"
            width="96"
            height="34"
            rx="2"
            fill={`url(#${variant}-${variant})`}
          />
        )}

        {/* Brillo superior */}
        <rect
          x="0"
          y="0"
          width="96"
          height="15"
          rx="2"
          fill="url(#shine)"
          opacity="0.3"
        />

        <defs>
          <linearGradient id="shine" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
