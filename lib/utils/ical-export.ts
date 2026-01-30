import type { DayPlan } from '@/types/trip-planner';
import { calculateDayCost } from '@/types/trip-planner';

interface ICalExportData {
  tripName: string;
  cityName: string;
  startDate: Date;  // Required, not null (caller should validate)
  days: DayPlan[];
  costs: {
    accommodation: number;
    food: number;
    transport: number;
    activities: number;
  };
  currencySymbol: string;
  translations: {
    day: string;
    estimatedCost: string;
    accommodation: string;
    food: string;
    transport: string;
    activities: string;
    generatedBy: string;
  };
}

/**
 * Format a date for iCalendar (YYYYMMDD)
 */
function formatICalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Format a timestamp for iCalendar (YYYYMMDDTHHMMSSZ)
 */
function formatICalTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escape special characters for iCalendar text
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate iCalendar (.ics) file content for a trip
 */
export function generateICalendar(data: ICalExportData): string {
  const now = new Date();
  const timestamp = formatICalTimestamp(now);

  // Start iCalendar file
  let ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TripCalc//Trip Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:' + escapeICalText(data.tripName),
    'X-WR-TIMEZONE:UTC',
  ].join('\r\n');

  // Add event for each day
  data.days.forEach((day, index) => {
    const dayDate = new Date(data.startDate.getTime() + index * 24 * 60 * 60 * 1000);

    const nextDay = new Date(dayDate.getTime() + 24 * 60 * 60 * 1000);

    const dayCost = calculateDayCost(day, data.costs);

    // Build description with activities and costs
    const activities: string[] = [];
    if (day.included.accommodation) activities.push(`• ${data.translations.accommodation}: ${data.currencySymbol}${data.costs.accommodation.toFixed(0)}`);
    if (day.included.food) activities.push(`• ${data.translations.food}: ${data.currencySymbol}${data.costs.food.toFixed(0)}`);
    if (day.included.transport) activities.push(`• ${data.translations.transport}: ${data.currencySymbol}${data.costs.transport.toFixed(0)}`);
    if (day.included.activities) activities.push(`• ${data.translations.activities}: ${data.currencySymbol}${data.costs.activities.toFixed(0)}`);

    // Add custom items
    if (day.customItems && day.customItems.length > 0) {
      day.customItems.forEach(item => {
        const itemCost = item.isOneTime
          ? item.amount / data.days.length
          : item.amount * (item.visits || 1);
        activities.push(`• ${item.name}: ${data.currencySymbol}${(itemCost / 100).toFixed(0)}`);
      });
    }

    const description = [
      data.tripName,
      '',
      data.translations.estimatedCost + ': ' + data.currencySymbol + dayCost.toFixed(0),
      '',
      ...activities,
      '',
      data.translations.generatedBy + ' TripCalc - tripcalc.site',
    ].join('\n');

    // Create event
    const eventTitle = day.dayName
      ? `${data.tripName} - ${day.dayName}`
      : `${data.tripName} - ${data.translations.day} ${day.dayNumber}`;

    const uid = `tripcalc-${data.tripName.toLowerCase().replace(/\s+/g, '-')}-day${day.dayNumber}@tripcalc.site`;

    ical += '\r\n' + [
      'BEGIN:VEVENT',
      'UID:' + uid,
      'DTSTAMP:' + timestamp,
      'DTSTART;VALUE=DATE:' + formatICalDate(dayDate),
      'DTEND;VALUE=DATE:' + formatICalDate(nextDay),
      'SUMMARY:' + escapeICalText(eventTitle),
      'DESCRIPTION:' + escapeICalText(description),
      'LOCATION:' + escapeICalText(data.cityName),
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'BEGIN:VALARM',
      'TRIGGER:-PT24H',
      'ACTION:DISPLAY',
      'DESCRIPTION:' + escapeICalText(eventTitle + ' tomorrow'),
      'END:VALARM',
      'END:VEVENT',
    ].join('\r\n');
  });

  // End iCalendar file
  ical += '\r\n' + 'END:VCALENDAR';

  return ical;
}

/**
 * Download iCalendar file
 */
export function downloadICalendar(data: ICalExportData) {
  const icalContent = generateICalendar(data);
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  const fileName = `${data.tripName.replace(/[^a-z0-9]/gi, '_')}_calendar.ics`;

  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
