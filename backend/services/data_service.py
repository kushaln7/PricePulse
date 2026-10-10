import logging
import time
from typing import Dict, Any, Optional
import pandas as pd
import yfinance as yf

logger = logging.getLogger("pricepulse.data_service")

TICKERS = ["AAPL", "^GSPC", "^IXIC", "^VIX", "XLK"]
CACHE_TTL_SECONDS = 300  # 5 minutes in-memory cache to prevent yfinance rate limits

class DataService:
    def __init__(self):
        self._cached_data: Optional[pd.DataFrame] = None
        self._last_fetch_time: float = 0.0

    def get_latest_market_data(self, period: str = "2y", force_refresh: bool = False) -> pd.DataFrame:
        """
        Retrieves market data for AAPL, ^GSPC, ^IXIC, ^VIX, and XLK.
        Uses in-memory cache if within TTL to avoid yfinance rate limiting.
        """
        now = time.time()
        if not force_refresh and self._cached_data is not None and (now - self._last_fetch_time < CACHE_TTL_SECONDS):
            logger.info("Serving market data from in-memory cache.")
            return self._cached_data.copy()

        logger.info(f"Downloading market data for tickers {TICKERS} with period={period}...")
        try:
            raw_data = yf.download(
                tickers=TICKERS,
                period=period,
                auto_adjust=False,
                progress=False
            )

            if raw_data is None or raw_data.empty:
                raise ValueError("yfinance returned an empty dataset.")

            if "Close" not in raw_data:
                raise ValueError("Expected 'Close' prices not found in yfinance response.")

            close_df = raw_data["Close"].copy()

            # Ensure data contains enough records (at least 60 trading days for rolling indicators)
            if len(close_df) < 60:
                raise ValueError(f"Insufficient market data retrieved ({len(close_df)} days). Minimum 60 days required.")

            self._cached_data = raw_data.copy()
            self._last_fetch_time = now
            logger.info(f"Successfully retrieved and cached {len(close_df)} market data rows.")
            return raw_data.copy()

        except Exception as e:
            logger.error(f"Error fetching market data from yfinance: {e}")
            if self._cached_data is not None:
                logger.warning("Returning stale cached data due to download failure.")
                return self._cached_data.copy()
            raise RuntimeError(f"Unable to retrieve market data: {str(e)}")

    def get_aapl_history(self, num_points: int = 90) -> pd.DataFrame:
        """
        Returns recent AAPL price history with moving averages for chart visualization.
        """
        raw_data = self.get_latest_market_data(period="1y")
        aapl_df = pd.DataFrame(index=raw_data.index)
        
        # Extract AAPL series
        for col in ["Close", "Open", "High", "Low", "Volume"]:
            if (col, "AAPL") in raw_data.columns:
                aapl_df[col] = raw_data[(col, "AAPL")]
            elif col in raw_data and "AAPL" in raw_data[col]:
                aapl_df[col] = raw_data[col]["AAPL"]

        aapl_df["SMA_20"] = aapl_df["Close"].rolling(20).mean()
        aapl_df["SMA_50"] = aapl_df["Close"].rolling(50).mean()

        return aapl_df.dropna(subset=["Close"]).tail(num_points)

# Singleton instance
data_service = DataService()
