import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ========================================
// FE-012: RATE LIMIT (429) HELPERS
// ========================================
// The backend now caps requests (100/min by default, 5/min on login)
// and replies with 429 + a `Retry-After` header when a client goes
// over that limit. Every catch block in this app already does
// `error.response?.data?.message || "<generic fallback>"`, so instead
// of touching every one of those call sites individually, this
// rewrites `error.response.data.message` in place to a friendly
// "try again in Ns" message whenever the status is 429 — every
// existing catch block picks it up automatically, no other changes
// needed.
//
// `applyRateLimitMessage` is exported so `authService.jsx`'s
// `loginUser` (which uses a raw `axios` call, not this `api`
// instance, since there's no token yet before login) can apply the
// same fix on its own catch — otherwise the 5 req/min limit on the
// login route specifically would be missed by the interceptor below.

// Per RFC 9110, `Retry-After` is either a whole number of seconds
// ("120") or an HTTP-date. Handle both, and don't throw if it's
// missing or malformed — just fall back to a generic (but still
// friendly) message in that case.
export const parseRetryAfterSeconds = (headerValue) => {
  if (!headerValue) return null;

  const numericSeconds = Number(headerValue);

  if (!Number.isNaN(numericSeconds)) {
    return Math.max(0, Math.round(numericSeconds));
  }

  const dateMs = Date.parse(headerValue);

  if (!Number.isNaN(dateMs)) {
    return Math.max(0, Math.round((dateMs - Date.now()) / 1000));
  }

  return null;
};

const buildRateLimitMessage = (retryAfterSeconds) => {
  if (retryAfterSeconds === null || retryAfterSeconds === undefined) {
    return "Too many requests. Please wait a moment and try again.";
  }

  return `Too many requests. Please try again in ${retryAfterSeconds} second${
    retryAfterSeconds === 1 ? "" : "s"
  }.`;
};

export const applyRateLimitMessage = (error) => {
  if (error?.response?.status !== 429) {
    return error;
  }

  // Some calls (e.g. Excel report export) request a Blob response —
  // leave those untouched rather than clobbering the expected shape.
  if (error.response.data instanceof Blob) {
    return error;
  }

  const retryAfterSeconds = parseRetryAfterSeconds(
    error.response.headers?.["retry-after"]
  );

  const existingData =
    typeof error.response.data === "object" && error.response.data !== null
      ? error.response.data
      : {};

  error.response.data = {
    ...existingData,
    message: buildRateLimitMessage(retryAfterSeconds),
  };

  // Also exposed directly on the error, in case a caller wants the
  // raw seconds (e.g. to drive a countdown) instead of just the text.
  error.retryAfterSeconds = retryAfterSeconds;

  return error;
};

// ========================================
// FE-013: STANDARD ERROR ENVELOPE HELPER
// ========================================
// Every backend error now replies with the same shape:
//   { success: false, statusCode, message, error }
// `message` is normally a single string, but for validation failures
// (e.g. several invalid fields at once) it comes back as a `string[]`
// — one entry per problem. A few screens had already grown their own
// `Array.isArray(message) ? message.join("\n") : message` check to
// cope with that (Login.jsx, Registration.jsx, the bulk-import
// handlers in EventAttendees.jsx/CreateForm.jsx) — this centralizes
// it instead, the same way FE-012 centralized 429 handling above.

// General-purpose extractor: hand it any axios error and get back one
// ready-to-display string. Any screen that wants to read the message
// directly (rather than relying on the automatic rewrite below) can
// call this instead of hand-rolling its own Array.isArray check.
export const getErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again."
) => {
  const message = error?.response?.data?.message;

  if (Array.isArray(message)) {
    const joined = message.filter(Boolean).join("\n");
    return joined || fallback;
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return fallback;
};

// Rewrites `error.response.data.message` in place, same trick as
// `applyRateLimitMessage` above, so every existing
// `error.response?.data?.message || "<fallback>"` call site
// automatically shows a readable string instead of a raw array, with
// no other changes needed at those call sites.
//
// Deliberately narrower than `getErrorMessage`: it only touches the
// case where the backend actually sent a `string[]` (joining it into
// one string). If `message` is missing entirely, this leaves it
// alone rather than inventing a generic message — so each call
// site's own contextual `|| "Failed to ..."` fallback still applies
// exactly as it did before this ticket.
export const applyErrorEnvelopeMessage = (error) => {
  if (!error?.response || error.response.data instanceof Blob) {
    return error;
  }

  const message = error.response.data?.message;

  if (!Array.isArray(message)) {
    return error;
  }

  error.response.data = {
    ...error.response.data,
    message: message.filter(Boolean).join("\n"),
  };

  return error;
};

// ========================================
// FE-003: EXPIRED / MISSING TOKEN HELPER
// ========================================
// Any 401 means the token is gone or no longer valid as far as the
// backend is concerned (expired, revoked, or storage was wiped). The
// correct response is always the same regardless of which call
// triggered it: drop everything auth-related from localStorage and
// send the user to /login, once, instead of leaving them on a broken
// screen with a dead session.
//
// This used to live inline inside the response interceptor below,
// which meant only calls made through the shared `api` instance got
// this treatment. It's pulled out and exported here so the handful of
// service functions that call raw `axios` directly (with a manually
// attached Bearer token, so they skip this interceptor entirely) can
// call it from their own catch blocks too: `createUser`/`getUsers` in
// userService.jsx, and `bulkCreateAttendees` in
// attendeeListService.jsx.
export const handleUnauthorizedResponse = (error) => {
  if (error?.response?.status !== 401) {
    return error;
  }

  // Clear authentication state
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("name");
  localStorage.removeItem("role");
  localStorage.removeItem("isLoggedIn");

  // Redirect to login
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }

  return error;
};

// ========================================
// REQUEST INTERCEPTOR
// ATTACH ACCESS TOKEN TO EVERY REQUEST
// ========================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ========================================
// RESPONSE INTERCEPTOR
// HANDLE EXPIRED / INVALID TOKEN + RATE LIMITING
// ========================================

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // FE-013: normalize a `string[]` validation-message envelope into
    // one readable string first, before anything else looks at it.
    applyErrorEnvelopeMessage(error);

    // FE-012: surface 429s with a "try again in Ns" message instead
    // of whatever generic fallback the calling code would otherwise
    // show. Runs after the envelope normalization since they're
    // unrelated but 429's own message should still win either way.
    applyRateLimitMessage(error);

    // FE-003: expired/missing token — clear auth state and redirect.
    handleUnauthorizedResponse(error);

    return Promise.reject(error);
  }
);

export default api;