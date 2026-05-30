// Use the environment variable VITE_API_BASE_URL if defined.
// In development, this is empty to leverage the Vite proxy (defined in vite.config.js).
// In production, this can be set to the actual API domain.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
