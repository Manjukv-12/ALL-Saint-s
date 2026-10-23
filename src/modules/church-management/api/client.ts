import { API_BASE } from '@/lib/api';

const AUTH_TOKEN_KEY = 'church_mgmt_auth_token';

/** Same host as choir/events API — PHP `/api/church-management/*` */
function churchMgmtBaseUrl(): string {
  const base = API_BASE.replace(/\/$/, '');
  return base === '' ? '' : base;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private readonly baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(AUTH_TOKEN_KEY);
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });

      let data: Record<string, unknown>;
      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');

      if (isJson) {
        try {
          data = (await response.json()) as Record<string, unknown>;
        } catch {
          return {
            error: `Invalid JSON response from server (${response.status})`,
            message: `Server returned status ${response.status}`,
          };
        }
      } else {
        const text = await response.text();
        const isHtml =
          text.includes('<!DOCTYPE') ||
          text.includes('<html') ||
          text.toLowerCase().includes('page does not exist');
        const friendly404 =
          response.status === 404 || isHtml
            ? 'Church management API is not available on the server. Upload backend-php (api/church-management.php and .htaccess) and run the database seed, then try again.'
            : null;
        data = {
          error: friendly404 || text.slice(0, 280) || `Server returned status ${response.status}`,
          message: friendly404 || `HTTP ${response.status}`,
        };
      }

      if (!response.ok) {
        let errorMessage = (data.error as string) || (data.message as string) || 'An error occurred';
        if (response.status === 401) {
          errorMessage = (data.error as string) || (data.message as string) || 'Invalid email or password';
        }
        return { error: errorMessage, message: data.message as string | undefined };
      }

      return { data: data as T };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          error:
            'Unable to connect to the API. Start PHP (npm run api:php) and run backend-php/bin/seed-church-mgmt-admin.php if needed.',
        };
      }
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getAuthTokenKey(): string {
    return AUTH_TOKEN_KEY;
  }
}

export const apiClient = new ApiClient(churchMgmtBaseUrl());
