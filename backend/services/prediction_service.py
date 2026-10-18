import os
import sys
import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import joblib
import pandas as pd
import numpy as np

# Ensure backend root is always in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from services.data_service import data_service
from services.feature_service import feature_service
from schemas.prediction import (
    PredictionResponse,
    TechnicalIndicators,
    MarketContextItem,
    ModelInfoResponse,
    ModelEvaluation,
    PriceHistoryResponse,
    PriceHistoryPoint
)

logger = logging.getLogger("pricepulse.prediction_service")

# Resolve model paths relative to backend root or models folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")

MODEL_PATH = os.path.join(MODELS_DIR, "pricepulse_improved_xgb_model.joblib")
FEATURES_PATH = os.path.join(MODELS_DIR, "pricepulse_improved_features.joblib")
METADATA_PATH = os.path.join(MODELS_DIR, "pricepulse_metadata.json")

class PredictionService:
    def __init__(self):
        self.model = None
        self.features: List[str] = []
        self.metadata: Dict[str, Any] = {}
        self.load_artifacts()

    def load_artifacts(self):
        # Search candidate locations for model artifacts
        candidates = [
            MODELS_DIR,
            os.path.join(os.path.dirname(BASE_DIR), "models"),
            os.path.abspath("models"),
            os.path.abspath("backend/models")
        ]

        active_models_dir = None
        for cand in candidates:
            if (
                os.path.exists(os.path.join(cand, "pricepulse_improved_xgb_model.joblib")) and
                os.path.exists(os.path.join(cand, "pricepulse_improved_features.joblib")) and
                os.path.exists(os.path.join(cand, "pricepulse_metadata.json"))
            ):
                active_models_dir = cand
                break

        if not active_models_dir:
            raise FileNotFoundError(
                f"Model artifacts not found. Checked candidate paths: {candidates}"
            )

        logger.info(f"Loading ML artifacts from: {active_models_dir}")
        model_file = os.path.join(active_models_dir, "pricepulse_improved_xgb_model.joblib")
        features_file = os.path.join(active_models_dir, "pricepulse_improved_features.joblib")
        metadata_file = os.path.join(active_models_dir, "pricepulse_metadata.json")

        self.model = joblib.load(model_file)
        self.features = joblib.load(features_file)

        with open(metadata_file, "r", encoding="utf-8") as f:
            self.metadata = json.load(f)

        logger.info(f"Loaded model: {type(self.model).__name__}")
        logger.info(f"Loaded {len(self.features)} features: {self.features}")

        # Verify feature order and names match the model
        if hasattr(self.model, "feature_names_in_"):
            model_feat = list(self.model.feature_names_in_)
            if model_feat != self.features:
                raise ValueError("Model feature_names_in_ does not match saved features list!")
        logger.info("Model and feature verification passed successfully.")

    def run_prediction(self, force_refresh: bool = False) -> PredictionResponse:
        """
        Runs the end-to-end inference pipeline:
        1. Fetch fresh market data
        2. Clean & align
        3. Compute exact 25 technical and market features
        4. Select latest row
        5. XGBoost Regressor predicts next-day AAPL return
        6. Compute predicted next price
        """
        raw_data = data_service.get_latest_market_data(force_refresh=force_refresh)
        features_df, full_df, latest_date = feature_service.compute_features(raw_data, self.features)

        # Get latest observation row
        latest_row = features_df.iloc[[-1]]
        latest_idx = latest_row.index[-1]

        # Model inference
        predicted_return = float(self.model.predict(latest_row)[0])
        current_price = float(full_df.loc[latest_idx, "AAPL"])
        predicted_next_price = round(current_price * (1 + predicted_return), 2)
        predicted_return_percent = round(predicted_return * 100, 4)
        direction = "UP" if predicted_return > 0 else "DOWN"

        # Technical indicators snapshot
        tech_indicators = TechnicalIndicators(
            rsi_14=round(float(full_df.loc[latest_idx, "RSI_14"]), 2),
            macd=round(float(full_df.loc[latest_idx, "MACD"]), 4),
            bb_position=round(float(full_df.loc[latest_idx, "BB_Position"]), 4),
            volatility_7=round(float(full_df.loc[latest_idx, "Volatility_7"]), 5),
            sma20_ratio=round(float(full_df.loc[latest_idx, "SMA20_Ratio"]), 4),
            sma50_ratio=round(float(full_df.loc[latest_idx, "SMA50_Ratio"]), 4),
            ma7_ratio=round(float(full_df.loc[latest_idx, "MA7_Ratio"]), 4),
            ma14_ratio=round(float(full_df.loc[latest_idx, "MA14_Ratio"]), 4),
            ma30_ratio=round(float(full_df.loc[latest_idx, "MA30_Ratio"]), 4),
        )

        # Calculate next trading session
        from services.data_service import get_next_trading_session
        target_date = get_next_trading_session(latest_date)
        market_data_ts, is_cached = data_service.get_fetch_metadata()
        prediction_ts = datetime.now(timezone.utc).isoformat()

        # Real market context details (raw index levels & returns)
        raw_close = raw_data["Close"]
        market_context: Dict[str, MarketContextItem] = {}

        # Add AAPL context item for unified market overview
        aapl_series = raw_close["AAPL"].dropna() if "AAPL" in raw_close.columns else pd.Series([current_price])
        aapl_ret = float(aapl_series.pct_change().iloc[-1]) if len(aapl_series) > 1 else 0.0
        aapl_mom5 = float(aapl_series.pct_change(5).iloc[-1]) if len(aapl_series) > 5 else 0.0
        market_context["AAPL"] = MarketContextItem(
            ticker="AAPL",
            name="Apple Inc.",
            price=round(current_price, 2),
            daily_return=round(aapl_ret, 4),
            daily_return_percent=round(aapl_ret * 100, 2),
            momentum_5=round(aapl_mom5, 4),
            momentum_5_percent=round(aapl_mom5 * 100, 2),
            as_of_date=latest_date
        )

        indices_meta = [
            ("^GSPC", "S&P 500"),
            ("^IXIC", "NASDAQ Composite"),
            ("^VIX", "CBOE Volatility Index"),
            ("XLK", "Technology Select Sector SPDR")
        ]

        for ticker, name in indices_meta:
            if ticker in raw_close.columns:
                series = raw_close[ticker].dropna()
                price = float(series.iloc[-1])
                ret = float(series.pct_change().iloc[-1]) if len(series) > 1 else 0.0
                mom5 = float(series.pct_change(5).iloc[-1]) if len(series) > 5 else 0.0
                key = ticker.replace("^", "")
                market_context[key] = MarketContextItem(
                    ticker=ticker,
                    name=name,
                    price=round(price, 2),
                    daily_return=round(ret, 4),
                    daily_return_percent=round(ret * 100, 2),
                    momentum_5=round(mom5, 4),
                    momentum_5_percent=round(mom5 * 100, 2),
                    as_of_date=latest_date
                )

        # Feature values dictionary
        feature_vals = {feat: round(float(latest_row[feat].values[0]), 6) for feat in self.features}

        return PredictionResponse(
            ticker="AAPL",
            current_price=round(current_price, 2),
            predicted_return=predicted_return,
            predicted_return_percent=predicted_return_percent,
            predicted_next_price=predicted_next_price,
            direction=direction,
            as_of_date=latest_date,
            target_date=target_date,
            market_data_timestamp=market_data_ts,
            prediction_timestamp=prediction_ts,
            is_cached=is_cached,
            model_status="operational",
            uncertainty_calibrated=False,
            model="XGBoost Regressor",
            technical_indicators=tech_indicators,
            market_context=market_context,
            feature_values=feature_vals
        )

    def get_price_history(self, days: int = 90) -> PriceHistoryResponse:
        aapl_history = data_service.get_aapl_history(num_points=days)
        points: List[PriceHistoryPoint] = []
        
        for date_idx, row in aapl_history.iterrows():
            d_str = date_idx.strftime("%Y-%m-%d")
            points.append(PriceHistoryPoint(
                date=d_str,
                close=round(float(row["Close"]), 2),
                sma_20=round(float(row["SMA_20"]), 2) if pd.notna(row.get("SMA_20")) else None,
                sma_50=round(float(row["SMA_50"]), 2) if pd.notna(row.get("SMA_50")) else None,
                high=round(float(row["High"]), 2) if pd.notna(row.get("High")) else None,
                low=round(float(row["Low"]), 2) if pd.notna(row.get("Low")) else None,
                open=round(float(row["Open"]), 2) if pd.notna(row.get("Open")) else None,
                volume=float(row["Volume"]) if pd.notna(row.get("Volume")) else None
            ))

        if aapl_history.empty:
            return PriceHistoryResponse(
                ticker="AAPL",
                points=[],
                latest_price=0.0,
                as_of_date=pd.Timestamp.now().strftime("%Y-%m-%d")
            )

        latest_price = round(float(aapl_history["Close"].iloc[-1]), 2)
        as_of_date = aapl_history.index[-1].strftime("%Y-%m-%d")

        return PriceHistoryResponse(
            ticker="AAPL",
            points=points,
            latest_price=latest_price,
            as_of_date=as_of_date
        )

    def get_model_info(self) -> ModelInfoResponse:
        eval_dict = self.metadata.get("evaluation", {})
        evaluation = ModelEvaluation(
            mae=float(eval_dict.get("mae", 0.0)),
            rmse=float(eval_dict.get("rmse", 0.0)),
            r2=float(eval_dict.get("r2", 0.0)),
            directional_accuracy=float(eval_dict.get("directional_accuracy", 0.0)),
            baseline=eval_dict.get("baseline"),
            previous_model=eval_dict.get("previous_model"),
            evaluation_split=eval_dict.get("evaluation_split")
        )

        explanation = {
            "prediction_objective": "Predicts next trading day's AAPL return (percentage change) rather than raw closing price to enforce stationarity.",
            "target_transformation": "Predicted Return is combined with latest Apple close to compute predicted next-day closing price.",
            "feature_composition": "25 engineered features comprising multi-day lags, rolling return volatility, moving-average ratios (MA7, MA14, MA30, SMA20, SMA50), momentum, MACD, Bollinger Band position, RSI(14), and broader market context (S&P 500, NASDAQ, VIX, XLK).",
            "market_context_rationale": "Apple does not trade in a vacuum. Broader market regimes, tech sector momentum (XLK), and volatility spikes (VIX) provide vital macroeconomic context.",
            "stationarity_and_leakage": "All moving average and indicator calculations are lagged or shifted by 1 to strictly eliminate lookahead bias."
        }

        return ModelInfoResponse(
            project=self.metadata.get("project", "PricePulse"),
            ticker=self.metadata.get("ticker", "AAPL"),
            target=self.metadata.get("target", "next_day_return"),
            model=self.metadata.get("model", "XGBoost Regressor"),
            hyperparameters=self.metadata.get("hyperparameters", {}),
            features=self.features,
            feature_count=len(self.features),
            evaluation=evaluation,
            explanation=explanation,
            online_learning=self.metadata.get("online_learning")
        )

# Singleton instance
prediction_service = PredictionService()
