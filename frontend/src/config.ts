const readOnly = import.meta.env.VITE_READ_ONLY_DASHBOARD !== "false";

export const appConfig = {
  appName: import.meta.env.VITE_APP_NAME || "SAM UC Trader",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  authBaseUrl: import.meta.env.VITE_AUTH_BASE_URL || "http://localhost:3000",
  timezone: import.meta.env.VITE_APP_TIME_ZONE || "Africa/Lagos",
  useDemoData: import.meta.env.VITE_ENABLE_DEMO_DATA !== "false",
  readOnly,
} as const;
