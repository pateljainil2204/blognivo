import { useAuth as useContextAuth } from '../context/AuthContext';

/**
 * useAuth Hook
 * A simple wrapper to provide easy access to authentication state and methods.
 */
export const useAuth = () => {
  return useContextAuth();
};