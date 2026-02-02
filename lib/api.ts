const API_BASE_URL = "http://127.0.0.1:8000/api";

interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiRequest(
  endpoint: string,
  options: ApiRequestOptions = {},
) {
  const { requiresAuth = true, ...fetchOptions } = options;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(requiresAuth && token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  console.log(`[API] ${fetchOptions.method || "GET"} ${endpoint}`, {
    requiresAuth,
    hasToken: !!token,
    headers,
  });

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
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
    const errorData = await response.json().catch(() => ({}));

    // Handle DRF list of errors or single error
    let errorMessage = errorData.detail || errorData.message;

    if (!errorMessage && typeof errorData === "object") {
      const keys = Object.keys(errorData);
      if (keys.length > 0) {
        const firstError = errorData[keys[0]];
        errorMessage = `${keys[0]}: ${Array.isArray(firstError) ? firstError[0] : firstError}`;
      }
    }

    throw new Error(errorMessage || "Something went wrong");
  }

  return response.json();
}
