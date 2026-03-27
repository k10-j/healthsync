export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
export const AUTH_TOKEN_KEY = "healthsync_token";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export interface ApiUser {
  id: number;
  email: string;
  fullName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error("Cannot reach backend API. Start backend with: cd backend && npm run dev");
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}
