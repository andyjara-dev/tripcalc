/**
 * Format a day date string (yyyy-mm-dd) to a localized display format with weekday.
 * - Spanish: "lunes 15 de febrero de 2026"
 * - English: "Monday, February 15, 2026"
 */
export function formatDayDate(dateStr: string, locale: string): string {
  // Parse yyyy-mm-dd avoiding timezone issues
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (locale === 'es') {
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Shorter format for tabs and compact spaces.
 * - Spanish: "lun 15 feb"
 * - English: "Mon, Feb 15"
 */
export function formatDayDateShort(dateStr: string, locale: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (locale === 'es') {
    return date.toLocaleDateString('es-CL', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
