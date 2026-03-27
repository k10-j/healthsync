import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiRequest, clearStoredToken, getStoredToken, setStoredToken, type ApiUser } from "@/lib/api";

interface AuthContextType {
  user: ApiUser | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest<{ user: ApiUser }>("/auth/me", {
          token: storedToken,
        });
        setToken(storedToken);
        setUser(response.user);
      } catch {
        clearStoredToken();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await apiRequest<{ user: ApiUser; token: string }>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    setStoredToken(response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const response = await apiRequest<{ user: ApiUser; token: string }>("/auth/register", {
      method: "POST",
      body: { email, password, fullName },
    });
    setStoredToken(response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const signOut = async () => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
