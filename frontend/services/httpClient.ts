const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(null);
    }
  });
  failedQueue = [];
};

/**
 * Universal fetch wrapper that automatically transmits HTTP-only cookies
 * and silently renews expired access tokens on 401/403 responses.
 */
export async function http(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  const defaultHeaders: Record<string, string> = {};
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    ...options,
    credentials: 'include', // Transmit HTTP-only cookies
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  let response = await fetch(url, config);

  // If unauthorized / forbidden and not already hitting the refresh or logout endpoint
  if (
    (response.status === 401 || response.status === 403) &&
    !url.includes('/auth/refresh') &&
    !url.includes('/auth/logout') &&
    !url.includes('/auth/login') &&
    !url.includes('/auth/google')
  ) {
    if (isRefreshing) {
      // Queue concurrent requests while a single refresh completes
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => fetch(url, config));
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!refreshRes.ok) {
        throw new Error('Session renewal failed');
      }

      isRefreshing = false;
      processQueue(null);

      // Replay original request with refreshed cookie
      return fetch(url, config);
    } catch (err) {
      isRefreshing = false;
      processQueue(err);
      return response;
    }
  }

  return response;
}