
// Returns date in YYYY-MM-DD format
export const getISODateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Adds a number of days to a YYYY-MM-DD date string
export const addDays = (isoDateString: string, days: number): string => {
  const date = new Date(isoDateString);
  date.setUTCDate(date.getUTCDate() + days); // Use UTC to avoid timezone issues with date part
  return getISODateString(date);
};

// Formats YYYY-MM-DD for display, e.g., "July 21"
export const formatDateForDisplay = (isoDateString: string): string => {
  const date = new Date(isoDateString + 'T00:00:00'); // Ensure it's treated as local date
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
};

// Gets the short day of the week, e.g., "Mon"
export const getDayOfWeek = (isoDateString: string): string => {
  const date = new Date(isoDateString + 'T00:00:00');
  return date.toLocaleDateString(undefined, { weekday: 'short' });
};

export const getMonthName = (date: Date): string => {
  return date.toLocaleDateString(undefined, { month: 'long' });
};
