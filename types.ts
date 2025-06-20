
export interface CalendarEntry {
  text: string;
  // Potentially add other properties like mood, tags, etc. in the future
}

export interface DayCellProps {
  dateKey: string;
  entry: CalendarEntry | undefined;
  isToday: boolean;
  isPast: boolean; // For styling archived days differently if needed
  isFuture: boolean; // For styling future days differently if needed
  onUpdateEntry: (dateKey: string, text: string) => void;
  cellRef?: React.RefObject<HTMLDivElement>; // For scrolling to this cell
}

export interface CalendarGridProps {
  allEntries: Record<string, CalendarEntry>;
  displayKeys: string[];
  currentDisplayKey: string; // The ISO string for actual "today"
  onUpdateEntry: (dateKey: string, text: string) => void;
  todayCellRef?: React.RefObject<HTMLDivElement>;
}

export interface ArchiveToggleProps {
  showArchive: boolean;
  onToggle: () => void;
}

// Defines the structure of the user document stored in Firestore
export interface UserDocumentData {
  entries?: Record<string, CalendarEntry>;
  // other potential user data fields can be added here
}
