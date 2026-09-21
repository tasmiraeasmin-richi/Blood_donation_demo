import { API_BASE_URL } from '../utils/constants';

let tokenGetter = null;
let unauthorizedHandler = null;

/**
 * Register a function that returns the current JWT (or null).
 * Wired up once by AuthContext so the API layer stays UI-agnostic.
 */
export function setAuthTokenGetter(fn) {
  tokenGetter = fn;
}

/**
 * Register a global handler invoked on HTTP 401 (expired/invalid token).
 * AuthContext uses this to log the user out.
 */
export function onUnauthorized(fn) {
  unauthorizedHandler = fn;
}

export class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Normalize FastAPI error payloads into a readable message.
 * - { detail: "string" } -> the string
 * - { detail: [{ loc, msg }] } (422 validation) -> joined messages
 */
function normalizeErrorMessage(payload, status, fallback) {
  const detail = payload?.detail;
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const messages = detail
      .map(d => (typeof d?.msg === 'string' ? d.msg.replace(/^Value error,\s*/i, '') : null))
      .filter(Boolean);
    const unique = [...new Set(messages)];
    if (unique.length > 0) return unique.join(' ');
  }
  if (status === 401) return 'Your session has expired. Please log in again.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'The requested record was not found.';
  if (status === 409) return 'This record already exists.';
  return fallback;
}

function buildUrl(path, params) {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

export async function apiFetch(path, { method = 'GET', body, params, auth = true, form = false, token = null } = {}) {
  const headers = {};
  let payload;

  if (body !== undefined) {
    if (form) {
      payload = new URLSearchParams();
      Object.entries(body).forEach(([key, value]) => {
        if (value !== undefined && value !== null) payload.append(key, String(value));
      });
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    } else {
      payload = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
    }
  }

  // Explicit per-request token wins (e.g. fetching profile right after login).
  const bearer = token ?? (auth && tokenGetter ? tokenGetter() : null);
  if (bearer) headers.Authorization = `Bearer ${bearer}`;

  let response;
  try {
    response = await fetch(buildUrl(path, params), { method, headers, body: payload });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Please check your connection and try again.');
  }

  if (response.status === 204) return null;

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401 && unauthorizedHandler) {
      try {
        unauthorizedHandler();
      } catch {
        // Never let the global handler break error propagation
      }
    }
    throw new ApiError(
      response.status,
      normalizeErrorMessage(data, response.status, 'Something went wrong. Please try again.'),
      data?.detail ?? null
    );
  }

  return data;
}

export const api = {
  get: (path, options) => apiFetch(path, { ...options, method: 'GET' }),
  post: (path, body, options) => apiFetch(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => apiFetch(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => apiFetch(path, { ...options, method: 'PATCH', body }),
  delete: path => apiFetch(path, { method: 'DELETE' }),
};
