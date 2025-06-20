
import React from 'react';
import { DayCell } from './DayCell';
import type { CalendarGridProps } from '../types';
import { GRID_COLUMNS } from '../constants';

export const CalendarGrid: React.FC<CalendarGridProps> = ({ allEntries, displayKeys, currentDisplayKey, onUpdateEntry, todayCellRef }) => {
  if (!displayKeys.length) {
    return <p className="text-center text-neutral-500 spectral text-lg py-10">The sketchbook is empty. No drafts found.</p>;
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${GRID_COLUMNS} gap-4 p-1`}>
      {displayKeys.map(dateKey => {
        const entry = allEntries[dateKey];
        const isToday = dateKey === currentDisplayKey;
        
        // dateKey and currentDisplayKey are YYYY-MM-DD strings representing local dates.
        // Direct string comparison is reliable for determining past/future.
        const isPast = dateKey < currentDisplayKey;
        const isFuture = dateKey > currentDisplayKey;
        
        return (
          <DayCell
            key={dateKey}
            dateKey={dateKey}
            entry={entry}
            isToday={isToday}
            isPast={isPast}
            isFuture={isFuture}
            onUpdateEntry={onUpdateEntry}
            cellRef={isToday ? todayCellRef : undefined} 
          />
        );
      })}
    </div>
  );
};
