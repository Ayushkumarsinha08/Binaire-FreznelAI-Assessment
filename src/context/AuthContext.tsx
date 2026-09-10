import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../auth/AuthService';
import { AuthUser } from '../types/model';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  authError: string | null;
  isConfigured: boolean;
  missingConfigKeys: string[];
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const configStatus = authService.getConfigurationStatus();

  useEffect(() => {
    if (!configStatus.isConfigured) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [configStatus.isConfigured]);

  const signIn = async (email: string, pass: string): Promise<void> => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const authUser = await authService.signIn(email, pass);
      setUser(authUser);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign in.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, pass: string): Promise<void> => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const authUser = await authService.signUp(email, pass);
      setUser(authUser);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to create account.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign out.');
    }
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        authError,
        isConfigured: configStatus.isConfigured,
        missingConfigKeys: configStatus.missingKeys,
        signIn,
        signUp,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export type { AuthContextType };
