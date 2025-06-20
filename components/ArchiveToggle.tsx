import React from 'react';
import type { ArchiveToggleProps } from '../types';

interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

const ArchiveIcon: React.FC<IconProps> = ({className, style}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`} style={style}>
    <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.076A1.5 1.5 0 0 1 8.248 8H11.75a1.5 1.5 0 0 1 1.423 2.126l-.707 3.036A1.5 1.5 0 0 1 11.022 14H8.978a1.5 1.5 0 0 1-1.442-1.162l-.536-2.298a1.5 1.5 0 0 0-2.884 0l-.536 2.298A1.5 1.5 0 0 1 2.136 14H2V3.5Zm14.5-.336a.75.75 0 0 1 .166.976l-2.016 3.456A1.5 1.5 0 0 1 13.28 8H12.5V3.5a1.5 1.5 0 0 1 1.5-1.5h1.148a.75.75 0 0 1 .722.536ZM8.248 9.5A1.5 1.5 0 0 0 6.825 8l-.716-3.076A1.5 1.5 0 0 0 4.648 3.5H3.5V14h.988a1.5 1.5 0 0 1 1.442 1.162l.536 2.298A1.5 1.5 0 0 0 7.908 19h4.184a1.5 1.5 0 0 0 1.442-1.262l.536-2.298A1.5 1.5 0 0 1 15.512 14h.988V9.5h-.78a1.5 1.5 0 0 1-1.424-2.126l.708-3.036A1.5 1.5 0 0 0 13.352 2H12.5v6h-4.252Z" clipRule="evenodd" />
  </svg>
);

export const ArchiveToggle: React.FC<ArchiveToggleProps> = ({ showArchive, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="orbitron flex items-center justify-center px-6 py-3 rounded-md text-neutral-700 
                 hover:bg-neutral-100/70 transition-all duration-200 ease-in-out 
                 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-opacity-70 
                 text-lg rough-border apply-wobble"
      style={{
        // Custom hover for rough border effect
        // On hover, we can slightly darken the 'pencil strokes'
        // This is a bit tricky with pure CSS box-shadows for dynamic hover states,
        // Tailwind's hover: classes might override some of these if not careful.
        // For simplicity, the base rough-border will provide the main effect.
        // Hover can use a slightly darker background from Tailwind.
      }}
      aria-pressed={showArchive}
    >
      <ArchiveIcon className="mr-2 text-neutral-600 apply-wobble" style={{ filter: 'url(#pencilWobble)'}} />
      {showArchive ? 'Close Sketchbook' : 'Open Sketchbook'}
    </button>
  );
};