const trimTrailingSlash = (value: string) => value.replace(/\/$/, '');

const resolveBrowserOrigin = () =>
  typeof window === 'undefined' ? '' : window.location.origin.trim();

export const resolveApiBaseUrl = () => {
  const configuredBaseURL = import.meta.env.VITE_API_BASE_URL?.trim();
  const baseURL = configuredBaseURL || resolveBrowserOrigin();

  if (!baseURL) {
    throw new Error('API base URL could not be resolved');
  }

  return trimTrailingSlash(baseURL);
};

export const resolveAppBaseUrl = () => {
  const baseURL = resolveApiBaseUrl();
  return baseURL.endsWith('/api/v1') ? baseURL.replace(/\/api\/v1$/, '') : baseURL;
};

export const resolveCanonicalBaseUrl = () => {
  const configuredFrontEndURL = import.meta.env.VITE_FRONTEND_URL?.trim();
  const browserOrigin = resolveBrowserOrigin();

  if (import.meta.env.MODE === 'development' && browserOrigin) {
    return trimTrailingSlash(browserOrigin);
  }

  if (import.meta.env.MODE === 'test') {
    return trimTrailingSlash(configuredFrontEndURL || browserOrigin);
  }

  return trimTrailingSlash(configuredFrontEndURL || browserOrigin || resolveAppBaseUrl());
};
