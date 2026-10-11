import { PredictionResponse, PriceHistoryResponse, ModelInfoResponse, HealthResponse } from "@/types/api";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
// Clean trailing slashes to prevent double-slash paths (e.g., https://api.render.com//predict)
const API_BASE_URL = rawApiUrl.replace(/\/+$/, "");

if (typeof window !== "undefined" && process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    "[PricePulse Warning] NEXT_PUBLIC_API_URL is not configured in production environment. Requests may default to localhost."
  );
}

export async function fetchHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
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
  const url = `${API_BASE_URL}/predict${forceRefresh ? "?force_refresh=true" : ""}`;
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
  const url = `${API_BASE_URL}/history?days=${days}`;
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
  const url = `${API_BASE_URL}/model-info`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
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
