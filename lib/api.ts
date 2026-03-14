export const BACKEND_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");
const API_BASE_URL = `${BACKEND_URL}/api`;

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  requiresAuth?: boolean;
  body?: RequestInit["body"] | object | null;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest(endpoint: string, options: ApiRequestOptions = {}) {
  const { requiresAuth = true, ...fetchOptions } = options;
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(requiresAuth && token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const body =
    options.body && typeof options.body === "object" && !(options.body instanceof FormData)
      ? JSON.stringify(options.body)
      : options.body;

  if (process.env.NODE_ENV !== "production") {
    console.log(`[API] ${fetchOptions.method || "GET"} ${normalizedEndpoint}`, {
      requiresAuth,
      hasToken: !!token,
      headers,
    });
  }

  const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, {
    ...options,
    headers,
    body,
  });

  if (response.status === 401) {
    // Handle token refresh logic here in the future
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      // window.location.href = '/auth/login';
    }
  }

  if (!response.ok) {
    const errorData: Record<string, unknown> = await response.json().catch(() => ({}));

    // Handle DRF list of errors or single error
    let errorMessage =
      typeof errorData.detail === "string"
        ? errorData.detail
        : typeof errorData.message === "string"
          ? errorData.message
          : undefined;

    if (!errorMessage && typeof errorData === "object") {
      const keys = Object.keys(errorData);
      if (keys.length > 0) {
        const firstError = errorData[keys[0]];
        const normalizedFirstError = Array.isArray(firstError)
          ? String(firstError[0])
          : String(firstError);
        errorMessage = `${keys[0]}: ${normalizedFirstError}`;
      }
    }

    throw new ApiError(errorMessage || "Something went wrong", response.status, errorData);
  }

  return response.json();
}
