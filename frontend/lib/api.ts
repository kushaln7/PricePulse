import { 
  PredictionResponse, 
  PriceHistoryResponse, 
  ModelInfoResponse, 
  HealthResponse,
  OnlineLearningStatusResponse 
} from "@/types/api";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const rawApiUrl = configuredApiUrl || "https://pricepulse-2lku.onrender.com";
// Clean trailing slashes to prevent double-slash paths (e.g., https://api.render.com//predict)
const API_BASE_URL = rawApiUrl.replace(/\/+$/, "");

function apiUrl(path: string): string {
  if (!API_BASE_URL) {
    throw new Error("The market API is not configured. Set NEXT_PUBLIC_API_URL in the deployment environment.");
  }
  return `${API_BASE_URL}${path}`;
}

if (typeof window !== "undefined" && process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    "[PricePulse Warning] NEXT_PUBLIC_API_URL is not configured in production environment. API requests will be unavailable until it is set."
  );
}

export async function fetchHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch(apiUrl("/health"), {
      cache: "no-store",
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) {
      throw new Error(`Health check returned status ${res.status}`);
    }
    return await res.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Backend unreachable";
    throw new Error(`API health check failed: ${msg}`);
  }
}

export async function fetchPrediction(forceRefresh: boolean = false): Promise<PredictionResponse> {
  const url = apiUrl(`/predict${forceRefresh ? "?force_refresh=true" : ""}`);
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
      throw new Error(errorBody.detail || `Prediction request failed (${res.status})`);
    }

    return await res.json();
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("Unable to connect to market inference service. Please check network connection.");
  }
}

export async function fetchHistory(days: number = 90): Promise<PriceHistoryResponse> {
  const url = apiUrl(`/history?days=${days}`);
  try {
    const res = await fetch(url, {
      next: { revalidate: 300 }, // Cache 5 minutes
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      throw new Error(`Failed to load price history (${res.status})`);
    }

    return await res.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load price history";
    throw new Error(msg);
  }
}

export async function fetchModelInfo(): Promise<ModelInfoResponse> {
  const url = apiUrl("/model-info");
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      throw new Error(`Failed to load model specifications (${res.status})`);
    }

    return await res.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load model specifications";
    throw new Error(msg);
  }
}

export async function fetchOnlineStatus(): Promise<OnlineLearningStatusResponse> {
  const url = apiUrl("/model/online-status");
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch online status (${res.status})`);
    }
    return await res.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load online status";
    throw new Error(msg);
  }
}

export async function syncDailyModel(force: boolean = false): Promise<{
  updated: boolean;
  last_trained_date?: string;
  total_samples?: number;
  new_samples_added?: number;
  message: string;
  error?: string;
}> {
  const url = apiUrl(`/model/sync-daily${force ? "?force=true" : ""}`);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
      throw new Error(errBody.detail || "Daily synchronization failed");
    }
    return await res.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to trigger online learning";
    throw new Error(msg);
  }
}

