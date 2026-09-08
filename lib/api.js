import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./tokens";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export class ApiError extends Error {
  constructor(message, status, data = null, fieldErrors = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.fieldErrors = fieldErrors;
  }
}

// Single active refresh promise to deduplicate concurrent refresh calls
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (newAccessToken) => {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
};

/**
 * Core API request function
 */
export async function apiRequest(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    requiresAuth = true,
    retryOnAuthFailure = true,
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;

  const requestHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (requiresAuth) {
    const token = getAccessToken();
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const config = {
    method,
    headers: requestHeaders,
  };

  if (body) {
    config.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    throw new ApiError(
      "Unable to connect to the server. Please check your internet connection or try again later.",
      0,
      null
    );
  }

  // Parse JSON response
  let jsonResult = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      jsonResult = await response.json();
    } catch {
      jsonResult = null;
    }
  }

  // Handle 401 Unauthorized with automatic refresh token rotation
  if (response.status === 401 && retryOnAuthFailure && !endpoint.includes("/auth/login") && !endpoint.includes("/auth/refresh")) {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearTokens();
      throw new ApiError("Session expired. Please sign in again.", 401, null);
    }

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        const refreshData = await refreshResponse.json();

        if (refreshResponse.ok && refreshData.success && refreshData.data?.accessToken) {
          const { accessToken: newAccess, refreshToken: newRefresh } = refreshData.data;
          setTokens(newAccess, newRefresh);
          isRefreshing = false;
          onRefreshed(newAccess);

          // Retry original request with new token
          return apiRequest(endpoint, {
            ...options,
            retryOnAuthFailure: false, // Prevent infinite loops
          });
        } else {
          // Refresh failed or token was revoked
          isRefreshing = false;
          clearTokens();
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("autocare:session-expired"));
          }
          throw new ApiError("Session expired. Please sign in again.", 401, null);
        }
      } catch (err) {
        isRefreshing = false;
        clearTokens();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("autocare:session-expired"));
        }
        throw new ApiError("Session expired. Please sign in again.", 401, null);
      }
    } else {
      // Another request is already refreshing, wait for it
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(async (newToken) => {
          try {
            const retryRes = await apiRequest(endpoint, {
              ...options,
              retryOnAuthFailure: false,
            });
            resolve(retryRes);
          } catch (retryErr) {
            reject(retryErr);
          }
        });
      });
    }
  }

  // Non-2xx response handling
  if (!response.ok) {
    const defaultMsg = "An unexpected error occurred. Please try again.";
    const errorMessage = jsonResult?.message || defaultMsg;
    
    // Check for field-specific validation errors from Spring Boot (HTTP 400)
    let fieldErrors = null;
    if (response.status === 400 && jsonResult?.data && typeof jsonResult.data === "object") {
      fieldErrors = jsonResult.data;
    }

    throw new ApiError(errorMessage, response.status, jsonResult?.data, fieldErrors);
  }

  return jsonResult;
}
