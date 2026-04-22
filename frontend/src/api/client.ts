import axios from 'axios';
import { store } from '../store';
import { clear } from '../store/slices/authSlice';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status: number | undefined = error?.response?.status;
    const url: string = error?.config?.url ?? '';
    const isAuthCall = url === '/me' || url.startsWith('/auth');
    if (status === 401 && !isAuthCall) {
      store.dispatch(clear());
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
      }
    }
    return Promise.reject(error);
  },
);
