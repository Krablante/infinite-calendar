
// Returns date in YYYY-MM-DD format based on local timezone
export const getISODateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is 0-indexed
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Adds a number of days to a YYYY-MM-DD date string (interpreted as local date)
export const addDays = (isoDateString: string, days: number): string => {
  const [year, month, day] = isoDateString.split('-').map(Number);
  // Create a date object using local year, month (0-indexed), day
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return getISODateString(date);
};

// Formats YYYY-MM-DD for display, e.g., "July 21"
// This function was already correctly interpreting isoDateString as local due to 'T00:00:00'
export const formatDateForDisplay = (isoDateString: string): string => {
  const date = new Date(isoDateString + 'T00:00:00'); // Ensures it's treated as local date
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
};

// Gets the short day of the week, e.g., "Mon"
// This function was already correctly interpreting isoDateString as local
export const getDayOfWeek = (isoDateString: string): string => {
  const date = new Date(isoDateString + 'T00:00:00');
  return date.toLocaleDateString(undefined, { weekday: 'short' });
};

// This function was already correctly interpreting its input Date object
export const getMonthName = (date: Date): string => {
  return date.toLocaleDateString(undefined, { month: 'long' });
};
