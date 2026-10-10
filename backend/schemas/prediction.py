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

class PredictionResponse(BaseModel):
    ticker: str = "AAPL"
    current_price: float
    predicted_return: float
    predicted_return_percent: float
    predicted_next_price: float
    direction: str  # "UP" or "DOWN"
    as_of_date: str
    model: str = "XGBoost Regressor"
    technical_indicators: TechnicalIndicators
    market_context: Dict[str, MarketContextItem]
    feature_values: Dict[str, float]
    disclaimer: str = (
        "PricePulse provides machine-learning-based estimates for educational and research purposes only. "
        "It is not financial advice and does not guarantee future market performance."
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

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    features_count: int
    timestamp: str
    project: str = "PricePulse"
