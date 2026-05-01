import {createMMKV} from 'react-native-mmkv';

const storage = createMMKV({id: 'api-storage'});

const BASE_URL_KEY = 'api_base_url';
const JWT_TOKEN_KEY = 'jwt_token';
const DEFAULT_BASE_URL = 'http://localhost:8080';

export function setBaseUrl(url: string): void {
  storage.set(BASE_URL_KEY, url);
}

export function setJwtToken(token: string | null): void {
  if (token) {
    storage.set(JWT_TOKEN_KEY, token);
  } else {
    storage.remove(JWT_TOKEN_KEY);
  }
}

export function getJwtToken(): string | null {
  return storage.getString(JWT_TOKEN_KEY) ?? null;
}

// Signature matches what orval generates: fetchClient<T>(url, init)
export async function fetchClient<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const baseUrl = storage.getString(BASE_URL_KEY) ?? DEFAULT_BASE_URL;
  const token = storage.getString(JWT_TOKEN_KEY);

  const headers = new Headers(init.headers);
  headers.set('X-API-Version', '1');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${baseUrl}${url}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new ApiError(response.status, response.statusText, errorBody);
  }

  // Return response with data + status shape that orval expects
  const contentType = response.headers.get('content-type');
  const data = contentType?.includes('application/json')
    ? await response.json()
    : undefined;

  return {data, status: response.status, headers: response.headers} as T;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: string,
  ) {
    super(`${status} ${statusText}`);
    this.name = 'ApiError';
  }
}
