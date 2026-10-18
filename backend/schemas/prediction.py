from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class TechnicalIndicators(BaseModel):
    rsi_14: float = Field(..., description="14-day Relative Strength Index")
    macd: float = Field(..., description="Moving Average Convergence Divergence")
    bb_position: float = Field(..., description="Bollinger Band relative position (0=lower, 1=upper)")
    volatility_7: float = Field(..., description="7-day rolling return volatility")
    sma20_ratio: float = Field(..., description="Price to 20-day SMA ratio")
    sma50_ratio: float = Field(..., description="Price to 50-day SMA ratio")
    ma7_ratio: float = Field(..., description="Price to 7-day MA ratio")
    ma14_ratio: float = Field(..., description="Price to 14-day MA ratio")
    ma30_ratio: float = Field(..., description="Price to 30-day MA ratio")

class MarketContextItem(BaseModel):
    ticker: str
    name: str
    price: float
    daily_return: float
    daily_return_percent: float
    momentum_5: Optional[float] = None
    momentum_5_percent: Optional[float] = None
    as_of_date: Optional[str] = None

class PredictionResponse(BaseModel):
    ticker: str = "AAPL"
    current_price: float
    predicted_return: float
    predicted_return_percent: float
    predicted_next_price: float
    direction: str  # "UP" or "DOWN"
    as_of_date: str
    target_date: str
    market_data_timestamp: str
    prediction_timestamp: str
    is_cached: bool = False
    model_status: str = "operational"
    uncertainty_calibrated: bool = False
    uncertainty_note: str = (
        "Point estimate. Uncertainty is not statistically calibrated; "
        "next-session financial return intervals are subject to high market noise."
    )
    model: str = "XGBoost Regressor"
    technical_indicators: TechnicalIndicators
    market_context: Dict[str, MarketContextItem]
    feature_values: Dict[str, float]
    disclaimer: str = (
        "PricePulse is an educational market-analysis project. Its model outputs are experimental "
        "estimates based on historical data and selected features. They are not guarantees of "
        "future performance or financial advice."
    )

class PriceHistoryPoint(BaseModel):
    date: str
    close: float
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    open: Optional[float] = None
    volume: Optional[float] = None

class PriceHistoryResponse(BaseModel):
    ticker: str = "AAPL"
    points: List[PriceHistoryPoint]
    latest_price: float
    as_of_date: str

class ModelEvaluation(BaseModel):
    mae: float
    rmse: float
    r2: float
    directional_accuracy: float
    baseline: Optional[Dict[str, Any]] = None
    previous_model: Optional[Dict[str, Any]] = None
    evaluation_split: Optional[Dict[str, Any]] = None

class ModelInfoResponse(BaseModel):
    project: str
    ticker: str
    target: str
    model: str
    hyperparameters: Dict[str, Any]
    features: List[str]
    feature_count: int
    evaluation: ModelEvaluation
    explanation: Dict[str, str]
    online_learning: Optional[Dict[str, Any]] = None

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    features_count: int
    timestamp: str
    project: str = "PricePulse"

class OnlineLearningUpdate(BaseModel):
    timestamp: str
    trained_through_date: str
    total_samples: int
    new_samples_added: int
    mae: float
    rmse: float
    directional_accuracy: float
    r2: float
    status: str

class OnlineLearningStatusResponse(BaseModel):
    enabled: bool = True
    status: str
    last_sync_timestamp: Optional[str] = None
    last_trained_date: Optional[str] = None
    total_samples_trained: int
    features_count: int
    current_metrics: Dict[str, float]
    history: List[OnlineLearningUpdate] = []
    last_check_time: Optional[str] = None
    message: str

