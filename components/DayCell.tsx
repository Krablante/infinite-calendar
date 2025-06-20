import React, { useState, useEffect, useRef } from 'react';
import type { DayCellProps } from '../types';
import { formatDateForDisplay, getDayOfWeek } from '../utils/dateUtils';

const EditIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 ${className}`}>
    <path d="M5.433 13.917l1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
  </svg>
);


export const DayCell: React.FC<DayCellProps> = ({ dateKey, entry, isToday, isPast, isFuture, onUpdateEntry, cellRef }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(entry?.text || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditText(entry?.text || '');
  }, [entry?.text]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    onUpdateEntry(dateKey, editText.trim());
    setIsEditing(false);
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(entry?.text || ''); 
    }
  };

  const dayNumber = new Date(dateKey + 'T00:00:00').getDate();

  let cellBaseClasses = "relative flex flex-col h-56 p-3 rounded-md transition-all duration-200 ease-in-out";
  let borderClasses = "rough-border"; // Default rough border
  let backgroundClasses = "bg-transparent"; // Inherits paper from parent

  if (isToday) {
    borderClasses = "rough-border-today"; // Heavier border for today
    backgroundClasses = "hatch-background"; // Hatch fill for today
  } else if (isPast) {
    cellBaseClasses += " opacity-60 hover:opacity-80"; // Faded pencil
  }
  
  if(isEditing) {
    // For editing, use a more defined border and clean background for textarea
    borderClasses = ""; // Remove rough border for the main cell in edit mode, apply to textarea
    cellBaseClasses += " ring-2 ring-neutral-500 shadow-xl z-10 bg-white"; // Cleaner paper for editing
  }

  const cellClasses = `${cellBaseClasses} ${!isEditing ? borderClasses : ''} ${!isEditing ? backgroundClasses : 'bg-transparent'}`;

  return (
    <div ref={cellRef} className={cellClasses} aria-label={`Calendar entry for ${formatDateForDisplay(dateKey)}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col">
          <span 
            className={`text-3xl font-bold orbitron ${isToday ? 'text-neutral-800' : 'text-neutral-700'}`}
            style={isToday ? {textShadow: '0.5px 0.5px 0px var(--pencil-light-gray)'} : {}}
          >
            {dayNumber}
          </span>
          <span 
            className={`text-xs ${isToday ? 'text-neutral-600' : 'text-neutral-500'}`}
          >
            {getDayOfWeek(dateKey)}, {formatDateForDisplay(dateKey)}
          </span>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)} 
            className="p-1.5 rounded-full hover:bg-neutral-200/70 text-neutral-500 hover:text-neutral-700 transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-400 apply-wobble"
            aria-label={`Edit entry for ${formatDateForDisplay(dateKey)}`}
          >
            <EditIcon />
          </button>
        )}
      </div>

      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSave} 
          onKeyDown={handleTextareaKeyDown}
          className="flex-grow w-full p-2 text-sm bg-white text-neutral-800 rounded-md focus:ring-1 focus:border-transparent outline-none resize-none spectral placeholder-neutral-500 rough-border focus:rough-border-today"
          style={{ 
            boxShadow: isEditing ? '0 0 0 2px var(--pencil-highlight-border), inset 0 1px 2px rgba(0,0,0,0.1)' : 'none',
          }}
          placeholder="Jot down your notes..."
          aria-label={`Editing content for ${formatDateForDisplay(dateKey)}`}
        />
      ) : (
        <div 
            onClick={() => setIsEditing(true)} 
            className="text-sm text-neutral-700 flex-grow overflow-y-auto cursor-pointer spectral leading-relaxed whitespace-pre-wrap break-words p-1 scrollbar-thin scrollbar-thumb-neutral-400 scrollbar-track-neutral-200/80 hover:scrollbar-thumb-neutral-500 relative apply-shade-texture"
            tabIndex={0}
            role="button"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsEditing(true);}}
            aria-label={`View or edit entry for ${formatDateForDisplay(dateKey)}. Current content: ${entry?.text || 'No entry'}`}
        >
          {entry?.text ? entry.text : <span className="text-neutral-500 italic">Sketch your thoughts...</span>}
        </div>
      )}
    </div>
  );
};