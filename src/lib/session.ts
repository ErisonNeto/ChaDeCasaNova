import type { GuestSession } from '../types/database';

const KEY = 'cha-casa-nova:guest-session';

export function saveGuestSession(session: GuestSession) {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function getGuestSession(): GuestSession | null {
  try {
    const data = localStorage.getItem(KEY);
    return data ? (JSON.parse(data) as GuestSession) : null;
  } catch {
    return null;
  }
}

export function clearGuestSession() {
  localStorage.removeItem(KEY);
}
