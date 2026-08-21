import { apiAdapter } from './adapter';
export { EVENT_COLORS, getEventsForDate, getEventsForMonth, getEventsForWeek } from '../data/calendarData';
export type { CalEvent } from '../data/calendarData';
export const getCalendarEvents = (params?: { year?: number; month?: number }) => apiAdapter.getCalendarEvents(params);
