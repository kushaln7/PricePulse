export interface TechnicalIndicators {
  rsi_14: number;
  macd: number;
  bb_position: number;
  volatility_7: number;
  sma20_ratio: number;
  sma50_ratio: number;
  ma7_ratio: number;
  ma14_ratio: number;
  ma30_ratio: number;
}

export interface MarketContextItem {
  ticker: string;
  name: string;
  price: number;
  daily_return: number;
  daily_return_percent: number;
  momentum_5?: number;
  momentum_5_percent?: number;
}

export interface PredictionResponse {
  ticker: string;
  current_price: number;
  predicted_return: number;
  predicted_return_percent: number;
  predicted_next_price: number;
  direction: "UP" | "DOWN";
  as_of_date: string;
  model: string;
  technical_indicators: TechnicalIndicators;
  market_context: Record<string, MarketContextItem>;
  feature_values: Record<string, number>;
  disclaimer: string;
}

export interface PriceHistoryPoint {
  date: string;
  close: number;
  sma_20?: number | null;
  sma_50?: number | null;
  high?: number | null;
  low?: number | null;
  open?: number | null;
  volume?: number | null;
}

export interface PriceHistoryResponse {
  ticker: string;
  points: PriceHistoryPoint[];
  latest_price: number;
  as_of_date: string;
}

export interface ModelEvaluation {
  mae: number;
  rmse: number;
  r2: number;
  directional_accuracy: number;
}

export interface ModelInfoResponse {
  project: string;
  ticker: string;
  target: string;
  model: string;
  hyperparameters: {
    n_estimators: number;
    learning_rate: number;
    max_depth: number;
    subsample: number;
    colsample_bytree: number;
    random_state: number;
    [key: string]: unknown;
  };
  features: string[];
  feature_count: number;
  evaluation: ModelEvaluation;
  explanation: Record<string, string>;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  features_count: number;
  timestamp: string;
  project: string;
}
