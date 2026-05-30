import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Decodes the payload of a JWT token without verifying the signature.
 * Used purely for reading display data (full_name, email) on the client.
 */
function decodeJWT(token) {
  try {
    const base64Payload = token.split('.')[1];
    // Replace URL-safe characters and add padding
    const padded = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = atob(padded);
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

/**
 * useAuth — Centralized authentication state hook.
 *
 * Returns:
 *   isAuthenticated {boolean}  — true if a valid-looking JWT is in localStorage
 *   user            {object}   — decoded JWT payload (sub = email), or null
 *   token           {string}   — raw JWT string for Authorization headers
 *   logout          {function} — clears token, navigates to landing page
 */
export function useAuth() {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const payload = useMemo(() => {
    if (!token) return null;
    const decoded = decodeJWT(token);
    if (!decoded) return null;

    // Check expiry (JWT exp is in seconds)
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return null;
    }
    return decoded;
  }, [token]);

  const isAuthenticated = Boolean(payload);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('cw_prompt_draft');
    navigate('/');
  }, [navigate]);

  return {
    isAuthenticated,
    token,
    // The JWT payload only has `sub` (email) by default.
    // Full user info (full_name) is fetched separately from /me.
    user: payload ? { email: payload.sub } : null,
    logout,
  };
}
