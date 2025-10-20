// Utility to manage guest session IDs
const SESSION_KEY = 'yacht_rental_session_id';

export const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = `guest_${crypto.randomUUID()}`;
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
};

export const getSessionId = (): string | null => {
  return localStorage.getItem(SESSION_KEY);
};

export const clearSessionId = (): void => {
  localStorage.removeItem(SESSION_KEY);
};
