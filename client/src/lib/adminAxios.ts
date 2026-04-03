import axios from 'axios';
import { resolveApiBaseUrl } from './apiBaseUrl';

const baseURL = resolveApiBaseUrl();

// Build admin API path safely
const adminBaseURL = baseURL.includes('/api/v1')
  ? baseURL.replace('/api/v1', '/admin/api/v1')
  : `${baseURL}/admin/api/v1`;

const adminApi = axios.create({
  baseURL: adminBaseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
adminApi.interceptors.request.use((config) => {
  const token = document
    .querySelector('meta[name="csrf-token"]')
    ?.content;

  if (token) {
    config.headers = config.headers || {};
    config.headers['X-CSRF-Token'] = token;
  }

  if (config.data instanceof FormData && config.headers) {
    delete config.headers['Content-Type'];
  }

  return config;
});

export default adminApi;
