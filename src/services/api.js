// src/services/api.js
// Centralised HTTP client for the json-server REST API. Every network call in
// the app goes through here so error handling and the base URL live in one
// place. Uses the native Fetch API.
const BASE_URL = "https://mi-api-json-b9kj.onrender.com";
const JSON_HEADERS = { "Content-Type": "application/json" };

// Perform a request and normalise errors. Non-2xx responses throw so callers
// can handle failures with try/catch instead of inspecting status codes.
async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  // 204 (no content), e.g. from DELETE, has no JSON body to parse.
  if (response.status === 204) return null;
  return response.json();
}

// Helper to build write requests (POST/PUT/PATCH) with a JSON body.
function withBody(method, body) {
  return { method, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

// The exported client mirrors the REST verbs used across services.
export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, withBody("POST", body)),
  put: (path, body) => request(path, withBody("PUT", body)),
  patch: (path, body) => request(path, withBody("PATCH", body)),
  remove: (path) => request(path, { method: "DELETE" }),
};
