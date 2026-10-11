import os
import sys
import logging
from typing import Tuple, Dict, Any, List
import pandas as pd
import numpy as np

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

logger = logging.getLogger("pricepulse.feature_service")

class FeatureService:
    def compute_features(self, raw_data: pd.DataFrame, feature_names: List[str]) -> Tuple[pd.DataFrame, pd.DataFrame, str]:
        """
        Reproduces the exact feature engineering pipeline from the PricePulse training notebook.
        
        Returns:
            - features_df: DataFrame containing all valid rows with exact feature names and order
            - full_close_df: DataFrame with all intermediate calculations and prices
            - latest_date: Date string (YYYY-MM-DD) of the latest observation
        """
        logger.info("Computing features according to training notebook specification...")
        
        if "Close" not in raw_data:
            raise ValueError("Input data must contain 'Close' prices.")

        raw_close = raw_data["Close"].copy()

        # The notebook retrieved ['AAPL', '^GSPC', '^IXIC', '^VIX', 'XLK'].
        # In yfinance, data['Close'] columns were sorted alphabetically:
        # ['AAPL', 'XLK', '^GSPC', '^IXIC', '^VIX'].
        # The notebook assigned close.columns = ["AAPL", "SP500", "NASDAQ", "VIX", "XLK"].
        # To guarantee 100% exact parity regardless of yfinance version, reindex to that exact order:
        expected_raw_order = ["AAPL", "XLK", "^GSPC", "^IXIC", "^VIX"]
        missing_tickers = [c for c in expected_raw_order if c not in raw_close.columns]
        if missing_tickers:
            raise ValueError(
                f"Missing required market ticker data: {missing_tickers}. Upstream provider did not return all necessary symbols."
            )

        close = raw_close[expected_raw_order].copy()
        close.columns = ["AAPL", "SP500", "NASDAQ", "VIX", "XLK"]

        # Ensure strict chronological order
        close = close.sort_index()

        # Clean non-trading sessions where AAPL did not trade (e.g. market holidays)
        close = close.dropna(subset=["AAPL"])
        # Forward-fill any brief single-symbol index anomalies, then drop remaining gaps
        close = close.ffill().dropna()

        # 1. Target return (for inspection/alignment)
        close["Target_Return"] = close["AAPL"].shift(-1) / close["AAPL"] - 1

        # 2. Lag features
        close["Lag_1"] = close["AAPL"].shift(1)
        close["Lag_2"] = close["AAPL"].shift(2)
        close["Lag_3"] = close["AAPL"].shift(3)
        close["Lag_7"] = close["AAPL"].shift(7)

        # 3. AAPL Daily Return
        close["Return"] = close["AAPL"].pct_change()

        # 4. 7-day Volatility
        close["Volatility_7"] = close["Return"].rolling(7).std()

        # 5. Moving Average Ratios (MA_7, MA_14, MA_30 shifted by 1 to prevent lookahead)
        close["MA_7"] = close["AAPL"].shift(1).rolling(7).mean()
        close["MA_14"] = close["AAPL"].shift(1).rolling(14).mean()
        close["MA_30"] = close["AAPL"].shift(1).rolling(30).mean()

        close["MA7_Ratio"] = close["AAPL"] / close["MA_7"].replace(0, np.nan)
        close["MA14_Ratio"] = close["AAPL"] / close["MA_14"].replace(0, np.nan)
        close["MA30_Ratio"] = close["AAPL"] / close["MA_30"].replace(0, np.nan)

        # 6. SMA and EMA features
        close["SMA_20"] = close["AAPL"].shift(1).rolling(20).mean()
        close["SMA_50"] = close["AAPL"].shift(1).rolling(50).mean()

        close["EMA_12"] = close["AAPL"].shift(1).ewm(span=12, adjust=False).mean()
        close["EMA_26"] = close["AAPL"].shift(1).ewm(span=26, adjust=False).mean()

        close["SMA20_Ratio"] = close["AAPL"] / close["SMA_20"].replace(0, np.nan)
        close["SMA50_Ratio"] = close["AAPL"] / close["SMA_50"].replace(0, np.nan)
        close["MACD"] = close["EMA_12"] - close["EMA_26"]

        # 7. Bollinger Bands (20-day, 2 std)
        rolling_mean = close["AAPL"].shift(1).rolling(20).mean()
        rolling_std = close["AAPL"].shift(1).rolling(20).std()
        close["BB_Upper"] = rolling_mean + 2 * rolling_std
        close["BB_Lower"] = rolling_mean - 2 * rolling_std
        
        # Position within the bands
        bb_denom = close["BB_Upper"] - close["BB_Lower"]
        # Guard against zero division
        bb_denom = bb_denom.replace(0, np.nan)
        close["BB_Position"] = (close["AAPL"] - close["BB_Lower"]) / bb_denom

        # 8. RSI (14-day)
        delta = close["AAPL"].diff()
        gain = delta.clip(lower=0)
        loss = -delta.clip(upper=0)
        avg_gain = gain.shift(1).rolling(14).mean()
        avg_loss = loss.shift(1).rolling(14).mean()
        rs = avg_gain / avg_loss.replace(0, np.nan)
        close["RSI_14"] = 100 - (100 / (1 + rs))
        close.loc[(avg_loss == 0) & (avg_gain > 0), "RSI_14"] = 100.0
        close.loc[(avg_gain == 0) & (avg_loss > 0), "RSI_14"] = 0.0
        close.loc[(avg_gain == 0) & (avg_loss == 0), "RSI_14"] = 50.0

        # 9. Market Returns
        close["SP500_Return"] = close["SP500"].pct_change()
        close["NASDAQ_Return"] = close["NASDAQ"].pct_change()
        close["VIX_Return"] = close["VIX"].pct_change()
        close["XLK_Return"] = close["XLK"].pct_change()

        # 10. Relative performance
        close["AAPL_vs_SP500"] = close["Return"] - close["SP500_Return"]
        close["AAPL_vs_NASDAQ"] = close["Return"] - close["NASDAQ_Return"]
        close["AAPL_vs_XLK"] = close["Return"] - close["XLK_Return"]

        # 11. Momentum (5-day return)
        close["SP500_Momentum_5"] = close["SP500"].pct_change(5)
        close["NASDAQ_Momentum_5"] = close["NASDAQ"].pct_change(5)
        close["XLK_Momentum_5"] = close["XLK"].pct_change(5)

        # 12. VIX Level
        close["VIX_Level"] = close["VIX"]

        # Ensure all required features exist in the exact specified order
        missing = [f for f in feature_names if f not in close.columns]
        if missing:
            raise ValueError(f"Failed to generate required features: {missing}")

        features_df = close[feature_names].replace([np.inf, -np.inf], np.nan).dropna()
        if features_df.empty:
            raise ValueError("No valid rows remaining after feature engineering and dropna.")

        latest_date = str(features_df.index[-1].strftime("%Y-%m-%d"))
        logger.info(f"Feature engineering complete. {len(features_df)} valid observations. Latest date: {latest_date}")
        
        return features_df, close, latest_date

# Singleton instance
feature_service = FeatureService()
