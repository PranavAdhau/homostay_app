const trimTrailingSlash = (value: string) => value.replace(/\/$/, '');

export const resolveApiBaseUrl = () => {
  const configuredBaseURL = import.meta.env.VITE_API_BASE_URL?.trim();
  const baseURL =
    import.meta.env.MODE === 'development'
      ? window.location.origin
      : import.meta.env.MODE === 'test'
        ? configuredBaseURL || window.location.origin
        : configuredBaseURL;

  if (!baseURL) {
    throw new Error('VITE_API_BASE_URL is not configured');
  }

  return trimTrailingSlash(baseURL);
};

export const resolveAppBaseUrl = () => {
  const baseURL = resolveApiBaseUrl();
  return baseURL.endsWith('/api/v1') ? baseURL.replace(/\/api\/v1$/, '') : baseURL;
};

export const resolveCanonicalBaseUrl = () => {
  const configuredFrontEndURL = import.meta.env.VITE_FRONTEND_URL?.trim();

  if (import.meta.env.MODE === 'development') {
    return trimTrailingSlash(window.location.origin);
  }

  if (import.meta.env.MODE === 'test') {
    return trimTrailingSlash(configuredFrontEndURL || window.location.origin);
  }

  return trimTrailingSlash(configuredFrontEndURL || resolveAppBaseUrl());
};
