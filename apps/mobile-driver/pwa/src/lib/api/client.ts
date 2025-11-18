import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/shared/constants';

class ApiClient {
  private clients: Map<string, AxiosInstance> = new Map();

  constructor() {
    this.initializeClients();
  }

  private initializeClients() {
    Object.entries(API_ENDPOINTS).forEach(([key, baseURL]) => {
      const client = axios.create({
        baseURL,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Request interceptor
      client.interceptors.request.use(
        (config) => {
          const token = this.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      // Response interceptor
      client.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
          if (error.response?.status === 401) {
            this.clearToken();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
          return Promise.reject(error);
        }
      );

      this.clients.set(key, client);
    });
  }

  public getClient(serviceName: keyof typeof API_ENDPOINTS): AxiosInstance {
    const client = this.clients.get(serviceName);
    if (!client) {
      throw new Error(`Client for service ${serviceName} not found`);
    }
    return client;
  }

  public setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    }
  }

  public getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    }
    return null;
  }

  public clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
