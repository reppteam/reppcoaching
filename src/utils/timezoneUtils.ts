/**
 * Timezone utilities for handling reminders across different timezones
 * This ensures proper timezone conversion for users in any country
 */

export interface TimezoneInfo {
  timezone: string;
  offset: string;
  displayName: string;
}

/**
 * Get user's current timezone
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Get timezone offset in minutes
 */
export function getTimezoneOffset(timezone: string = getUserTimezone()): number {
  const now = new Date();
  const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
  const targetTime = new Date(utc.toLocaleString("en-US", { timeZone: timezone }));
  return (targetTime.getTime() - utc.getTime()) / 60000;
}

/**
 * Convert local time to UTC for storage
 * @param dateString - Date in YYYY-MM-DD format
 * @param timeString - Time in HH:MM format
 * @param timezone - User's timezone (defaults to browser timezone)
 * @returns UTC ISO string
 */
export function convertLocalToUTC(
  dateString: string, 
  timeString: string, 
  timezone: string = getUserTimezone()
): string {
  // Create a date object in the user's timezone
  const localDateTime = new Date(`${dateString}T${timeString}`);
  
  // Convert to UTC
  const utcDateTime = new Date(localDateTime.getTime() - (localDateTime.getTimezoneOffset() * 60000));
  
  return utcDateTime.toISOString();
}

/**
 * Convert UTC time to user's local timezone for display
 * @param utcString - UTC ISO string
 * @param timezone - Target timezone (defaults to browser timezone)
 * @returns Formatted date and time in user's timezone
 */
export function convertUTCToLocal(
  utcString: string, 
  timezone: string = getUserTimezone()
): { date: string; time: string; display: string } {
  const utcDate = new Date(utcString);
  
  // Format for user's timezone
  const date = utcDate.toLocaleDateString('en-CA', { timeZone: timezone }); // YYYY-MM-DD format
  const time = utcDate.toLocaleTimeString('en-GB', { 
    timeZone: timezone, 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  }); // HH:MM format
  
  const display = utcDate.toLocaleString('en-US', { 
    timeZone: timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  return { date, time, display };
}

/**
 * Get common timezones for user selection
 */
export function getCommonTimezones(): TimezoneInfo[] {
  const timezones = [
    'America/New_York',
    'America/Chicago', 
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Australia/Sydney',
    'Pacific/Auckland'
  ];
  
  return timezones.map(tz => ({
    timezone: tz,
    offset: getTimezoneOffsetString(tz),
    displayName: getTimezoneDisplayName(tz)
  }));
}

/**
 * Get timezone offset as string (e.g., "+05:30", "-08:00")
 */
function getTimezoneOffsetString(timezone: string): string {
  const offset = getTimezoneOffset(timezone);
  const sign = offset >= 0 ? '+' : '-';
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Get display name for timezone
 */
function getTimezoneDisplayName(timezone: string): string {
  const now = new Date();
  const displayName = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'long'
  }).formatToParts(now).find(part => part.type === 'timeZoneName')?.value || timezone;
  
  return `${displayName} (${getTimezoneOffsetString(timezone)})`;
}

/**
 * Validate if a timezone is valid
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current time in a specific timezone
 */
export function getCurrentTimeInTimezone(timezone: string = getUserTimezone()): {
  date: string;
  time: string;
  display: string;
} {
  const now = new Date();
  return convertUTCToLocal(now.toISOString(), timezone);
}

/**
 * Debug timezone information
 */
export function debugTimezoneInfo(
  dateString: string,
  timeString: string,
  userTimezone: string = getUserTimezone()
): void {
  console.log('🕐 Timezone Debug Info:', {
    input: { dateString, timeString },
    userTimezone,
    localDateTime: new Date(`${dateString}T${timeString}`),
    utcDateTime: convertLocalToUTC(dateString, timeString, userTimezone),
    currentTime: getCurrentTimeInTimezone(userTimezone)
  });
}
