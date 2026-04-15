import { ApiResponse } from './types';

const TOKEN_KEY = 'auth_token';
const TOKEN_VERSION = 'v2'; // bump this to force-clear old mock tokens
const TOKEN_VERSION_KEY = 'auth_token_version';

export class ApiClient {
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    // If stored token is from old mock session, clear it
    const version = localStorage.getItem(TOKEN_VERSION_KEY);
    if (version !== TOKEN_VERSION) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.setItem(TOKEN_VERSION_KEY, TOKEN_VERSION);
      return null;
    }
    return localStorage.getItem(TOKEN_KEY);
  }

  static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_VERSION_KEY, TOKEN_VERSION);
  }

  static clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_VERSION_KEY);
  }

  static getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  static async request<T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...(options.headers || {}),
        },
      });

      // Handle unauthorized - clear token and redirect
      if (response.status === 401) {
        this.clearToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Unauthorized');
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'An error occurred',
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error: any) {
      console.error(`[v0] API Request Error: ${error.message}`);
      return {
        success: false,
        error: error.message || 'An error occurred',
      };
    }
  }

  static get<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'GET' });
  }

  static post<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static put<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static patch<T = any>(url: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static delete<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'DELETE' });
  }
}
