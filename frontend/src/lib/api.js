import axios from "axios";
import { supabase } from "./supabase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api",
});

// Session cache to avoid repeated calls
let cachedSession = null;
let sessionFetchTime = 0;
const SESSION_CACHE_DURATION = 1000; // Cache for 1 second

// Initialize session on module load
(async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    cachedSession = session;
    sessionFetchTime = Date.now();
  } catch (err) {
    console.error("Failed to initialize session on module load:", err);
  }
})();

// Listen for auth changes to update cached session
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth state changed:", event);
  cachedSession = session;
  sessionFetchTime = Date.now();
});

// Add Auth header
api.interceptors.request.use(async (config) => {
  try {
    // Use cached session if still valid
    if (cachedSession && (Date.now() - sessionFetchTime) < SESSION_CACHE_DURATION) {
      if (cachedSession.user) {
        config.headers["X-User-Id"] = cachedSession.user.id;
        config.headers["Authorization"] = `Bearer ${cachedSession.access_token}`;
      }
      return config;
    }

    // Otherwise, fetch fresh session with longer timeout
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((resolve) => 
      setTimeout(() => resolve({ data: { session: null } }), 8000)
    );

    const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
    
    // Update cache
    if (session) {
      cachedSession = session;
      sessionFetchTime = Date.now();
      config.headers["X-User-Id"] = session.user.id;
      config.headers["Authorization"] = `Bearer ${session.access_token}`;
    } else {
      // Use stale cache if available, even if expired
      if (cachedSession?.user) {
        console.warn("Using stale cached session");
        config.headers["X-User-Id"] = cachedSession.user.id;
        config.headers["Authorization"] = `Bearer ${cachedSession.access_token}`;
      } else {
        console.warn("No session available - user may not be logged in");
      }
    }
  } catch (err) {
    // Even on error, try to use cached session
    if (cachedSession?.user) {
      config.headers["X-User-Id"] = cachedSession.user.id;
      config.headers["Authorization"] = `Bearer ${cachedSession.access_token}`;
    }
    console.error("Interceptor error:", err.message);
  }

  return config;
});

// Add error interceptor for debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

export default api;
