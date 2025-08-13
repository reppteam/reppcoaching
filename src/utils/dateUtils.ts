// Date utility functions
export const formatDate = (date: Date, formatStr: string): string => {
  if (formatStr === 'yyyy-MM-dd') {
    return date.toISOString().split('T')[0];
  }
  if (formatStr === 'MMM d') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (formatStr === 'MMM d, yyyy') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  if (formatStr === 'MMMM d, yyyy') {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
  if (formatStr === 'EEEE, MMMM d, yyyy') {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
  return date.toLocaleDateString();
};

export const isAfter = (date1: Date, date2: Date): boolean => date1.getTime() > date2.getTime();
export const isBefore = (date1: Date, date2: Date): boolean => date1.getTime() < date2.getTime();

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Get the Monday of the week containing the given date
export const getMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

// Calculate coaching week number based on start date
export const calculateCoachingWeek = (startDate: string, currentDate: Date = new Date()): number => {
  const start = new Date(startDate);
  
  // If start date is Monday, use it as week 1 start
  // Otherwise, find the closest Monday after the start date
  let week1Start: Date;
  if (start.getDay() === 1) { // Monday
    week1Start = start;
  } else {
    // Find the next Monday after start date
    const daysUntilMonday = (8 - start.getDay()) % 7;
    week1Start = addDays(start, daysUntilMonday === 0 ? 7 : daysUntilMonday);
  }
  
  // Calculate weeks between week1Start and current date
  const timeDiff = currentDate.getTime() - week1Start.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  // If current date is before week 1 start, return 0 (pre-week 1)
  if (daysDiff < 0) {
    return 0;
  }
  
  // Calculate week number (1-based)
  return Math.floor(daysDiff / 7) + 1;
};

// Get coaching week information
export const getCoachingWeekInfo = (startDate: string, currentDate: Date = new Date()) => {
  const weekNumber = calculateCoachingWeek(startDate, currentDate);
  const start = new Date(startDate);
  
  let week1Start: Date;
  if (start.getDay() === 1) {
    week1Start = start;
  } else {
    const daysUntilMonday = (8 - start.getDay()) % 7;
    week1Start = addDays(start, daysUntilMonday === 0 ? 7 : daysUntilMonday);
  }
  
  return {
    weekNumber,
    week1Start,
    isBeforeWeek1: weekNumber === 0
  };
};