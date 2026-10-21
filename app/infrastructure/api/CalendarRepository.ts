import { useApiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import type { ApiResponse } from './types';

export type SchoolEventType = 'holiday' | 'exam' | 'activity' | 'meeting' | 'other';

export interface SchoolEvent {
  eventId: number;
  titleEn: string;
  titleLo: string;
  descriptionEn: string | null;
  descriptionLo: string | null;
  type: SchoolEventType;
  startDate: string; // ISO, UTC midnight of the school date
  endDate: string;
  /** A day off: attendance marks nobody absent. */
  schoolClosed: boolean;
}

export interface SchoolEventInput {
  titleEn: string;
  titleLo: string;
  descriptionEn: string | null;
  descriptionLo: string | null;
  type: SchoolEventType;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  schoolClosed: boolean;
}

export const calendarRepository = {
  async list(from: string, to: string) {
    const res = await useApiClient()<ApiResponse<{ events: SchoolEvent[] }>>(`${API_ENDPOINTS.calendar}?from=${from}&to=${to}`, { method: 'GET' });
    return res.data.events;
  },
  async save(eventId: number | null, input: SchoolEventInput) {
    const res = await useApiClient()<ApiResponse<{ event: SchoolEvent }>>(
      eventId ? `${API_ENDPOINTS.calendar}/${eventId}` : API_ENDPOINTS.calendar,
      { method: eventId ? 'PUT' : 'POST', body: input },
    );
    return res.data.event;
  },
  async remove(eventId: number) {
    await useApiClient()(`${API_ENDPOINTS.calendar}/${eventId}`, { method: 'DELETE' });
  },
};
