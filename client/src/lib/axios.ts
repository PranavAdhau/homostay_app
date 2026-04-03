import axios from 'axios';
import { resolveApiBaseUrl } from './apiBaseUrl';

const configuredBaseURL = resolveApiBaseUrl();
const apiBaseURL = configuredBaseURL.endsWith('/api/v1')
  ? configuredBaseURL
  : `${configuredBaseURL}/api/v1`;

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// CSRF token interceptor
api.interceptors.request.use((config) => {
  const token = document.querySelector('meta[name="csrf-token"]')?.content;
  if (token) {
    config.headers['X-CSRF-Token'] = token;
  }
  return config;
});

export default api;
