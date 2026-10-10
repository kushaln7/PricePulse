import { PredictionResponse, PriceHistoryResponse, ModelInfoResponse, HealthResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/health`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) {
    throw new Error(`Health check failed with status ${res.status}`);
  }
  return res.json();
}

export async function fetchPrediction(forceRefresh: boolean = false): Promise<PredictionResponse> {
  const url = `${API_BASE_URL}/predict${forceRefresh ? "?force_refresh=true" : ""}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" }
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: "Network request failed" }));
    throw new Error(errorBody.detail || `Prediction request failed (${res.status})`);
  }

  return res.json();
}

export async function fetchHistory(days: number = 90): Promise<PriceHistoryResponse> {
  const url = `${API_BASE_URL}/history?days=${days}`;
  const res = await fetch(url, {
    next: { revalidate: 300 }, // Cache 5 minutes
    headers: { "Content-Type": "application/json" }
  });

  if (!res.ok) {
    throw new Error(`Failed to load price history (${res.status})`);
  }

  return res.json();
}

export async function fetchModelInfo(): Promise<ModelInfoResponse> {
  const url = `${API_BASE_URL}/model-info`;
  const res = await fetch(url, {
    next: { revalidate: 3600 },
    headers: { "Content-Type": "application/json" }
  });

  if (!res.ok) {
    throw new Error(`Failed to load model specifications (${res.status})`);
  }

  return res.json();
}
