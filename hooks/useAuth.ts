'use client';

import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { loginRequest } from '@/lib/msalConfig';

export function useAuth() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const login = async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await instance.logoutPopup();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return {
    isAuthenticated,
    login,
    logout,
    user: accounts[0] || null,
  };
}
