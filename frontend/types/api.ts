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
  as_of_date?: string;
}

export interface PredictionResponse {
  ticker: string;
  current_price: number;
  predicted_return: number;
  predicted_return_percent: number;
  predicted_next_price: number;
  direction: "UP" | "DOWN";
  as_of_date: string;
  target_date: string;
  market_data_timestamp: string;
  prediction_timestamp: string;
  is_cached?: boolean;
  model_status?: string;
  uncertainty_calibrated?: boolean;
  uncertainty_note?: string;
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

export interface BaselineEvaluation {
  name: string;
  mae: number;
  rmse: number;
  r2: number;
  directional_accuracy?: number | null;
}

export interface PreviousModelEvaluation {
  name: string;
  features_count: number;
  mae: number;
  rmse: number;
  r2: number;
  directional_accuracy: number;
}

export interface EvaluationSplit {
  method: string;
  train_period: string;
  test_period: string;
  train_observations: number;
  test_observations: number;
  total_observations: number;
}

export interface ModelEvaluation {
  mae: number;
  rmse: number;
  r2: number;
  directional_accuracy: number;
  baseline?: BaselineEvaluation;
  previous_model?: PreviousModelEvaluation;
  evaluation_split?: EvaluationSplit;
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
  online_learning?: {
    enabled: boolean;
    last_updated: string;
    last_trained_date: string;
    total_samples: number;
  };
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  features_count: number;
  timestamp: string;
  project: string;
}

export interface OnlineLearningUpdate {
  timestamp: string;
  trained_through_date: string;
  total_samples: number;
  new_samples_added: number;
  mae: number;
  rmse: number;
  directional_accuracy: number;
  r2: number;
  status: string;
}

export interface OnlineLearningStatusResponse {
  enabled: boolean;
  status: string;
  last_sync_timestamp: string | null;
  last_trained_date: string | null;
  total_samples_trained: number;
  features_count: number;
  current_metrics: {
    mae: number;
    rmse: number;
    directional_accuracy: number;
    r2: number;
  };
  history: OnlineLearningUpdate[];
  last_check_time: string | null;
  message: string;
}

