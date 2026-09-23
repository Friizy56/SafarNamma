import type { Group, Place } from '../types';

export const groupDestination = (group: Group, place?: Place) => group.custom_destination || place?.name || 'Local destination';

export const seatsLeft = (group: Group) => Math.max(0, group.max_members - group.current_members);

/** A trip whose date passed more than 12 hours ago. */
export const isPastTrip = (group: Group) => new Date(group.trip_date).getTime() < Date.now() - 1000 * 60 * 60 * 12;

/** "Nandi Hills ➔ Devanahalli Fort" → ["Nandi Hills", "Devanahalli Fort"] */
export const routeStops = (custom?: string | null) =>
  custom ? custom.split(/\s*(?:➔|->|→)\s*/).map((s) => s.trim()).filter(Boolean) : [];
