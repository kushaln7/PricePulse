import os
import sys
import logging
import time
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, Tuple
import pandas as pd
import yfinance as yf

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

logger = logging.getLogger("pricepulse.data_service")

TICKERS = ["AAPL", "^GSPC", "^IXIC", "^VIX", "XLK"]
CACHE_TTL_SECONDS = 300  # 5 minutes in-memory cache to prevent yfinance rate limits

def compute_good_friday(year: int) -> datetime:
    """Meeus algorithm to calculate Good Friday (2 days before Easter Sunday)."""
    a = year % 19
    b = year // 100
    c = year % 100
    d = b // 4
    e = b % 4
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i = c // 4
    k = c % 4
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    month = (h + l - 7 * m + 114) // 31
    day = ((h + l - 7 * m + 114) % 31) + 1
    easter = datetime(year, month, day)
    return easter - timedelta(days=2)

def is_nyse_holiday(date_obj: datetime) -> bool:
    """Checks whether the given date is an official US NYSE market closure holiday."""
    m = date_obj.month
    d = date_obj.day
    wd = date_obj.weekday()  # 0=Monday, ..., 6=Sunday

    # Fixed holidays with Monday/Friday observance
    if (m == 1 and d == 1 and wd < 5) or (m == 1 and d == 2 and wd == 0) or (m == 12 and d == 31 and wd == 4):
        return True
    if (m == 6 and d == 19 and wd < 5) or (m == 6 and d == 20 and wd == 0) or (m == 6 and d == 18 and wd == 4):
        return True
    if (m == 7 and d == 4 and wd < 5) or (m == 7 and d == 5 and wd == 0) or (m == 7 and d == 3 and wd == 4):
        return True
    if (m == 12 and d == 25 and wd < 5) or (m == 12 and d == 26 and wd == 0) or (m == 12 and d == 24 and wd == 4):
        return True

    # Floating holidays:
    # MLK Day: 3rd Monday in January (between Jan 15 and 21)
    if m == 1 and wd == 0 and 15 <= d <= 21:
        return True
    # Presidents' Day: 3rd Monday in February (between Feb 15 and 21)
    if m == 2 and wd == 0 and 15 <= d <= 21:
        return True
    # Memorial Day: Last Monday in May (between May 25 and 31)
    if m == 5 and wd == 0 and 25 <= d <= 31:
        return True
    # Labor Day: First Monday in September (between Sep 1 and 7)
    if m == 9 and wd == 0 and 1 <= d <= 7:
        return True
    # Thanksgiving Day: 4th Thursday in November (between Nov 22 and 28)
    if m == 11 and wd == 3 and 22 <= d <= 28:
        return True

    # Good Friday
    gf = compute_good_friday(date_obj.year)
    if gf.month == m and gf.day == d:
        return True

    return False

def get_next_trading_session(as_of_date_str: str) -> str:
    """
    Computes the calendar date (YYYY-MM-DD) of the next official NYSE trading session,
    handling weekends (Saturday/Sunday) and official US market holidays.
    """
    try:
        dt = datetime.strptime(as_of_date_str, "%Y-%m-%d")
    except Exception:
        dt = datetime.now()

    next_dt = dt + timedelta(days=1)
    while next_dt.weekday() >= 5 or is_nyse_holiday(next_dt):
        next_dt += timedelta(days=1)

    return next_dt.strftime("%Y-%m-%d")

class DataService:
    def __init__(self):
        self._cached_data: Optional[pd.DataFrame] = None
        self._last_fetch_time: float = 0.0
        self._last_fetch_iso: Optional[str] = None
        self._last_was_cached: bool = False

    def get_latest_market_data(self, period: str = "2y", force_refresh: bool = False) -> pd.DataFrame:
        """
        Retrieves market data for AAPL, ^GSPC, ^IXIC, ^VIX, and XLK.
        Uses in-memory cache if within TTL to avoid yfinance rate limiting.
        """
        now = time.time()
        if not force_refresh and self._cached_data is not None and (now - self._last_fetch_time < CACHE_TTL_SECONDS):
            logger.info("Serving market data from in-memory cache.")
            self._last_was_cached = True
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
            self._last_fetch_iso = datetime.now(timezone.utc).isoformat()
            self._last_was_cached = False
            logger.info(f"Successfully retrieved and cached {len(close_df)} market data rows.")
            return raw_data.copy()

        except Exception as e:
            logger.error(f"Error fetching market data from yfinance: {e}")
            if self._cached_data is not None:
                logger.warning("Returning stale cached data due to download failure.")
                self._last_was_cached = True
                return self._cached_data.copy()
            raise RuntimeError(f"Unable to retrieve market data: {str(e)}")

    def get_fetch_metadata(self) -> Tuple[str, bool]:
        """Returns the ISO timestamp of market data and whether current request is served from cache."""
        ts = self._last_fetch_iso or datetime.now(timezone.utc).isoformat()
        return ts, self._last_was_cached

    def get_aapl_history(self, num_points: int = 90) -> pd.DataFrame:
        """
        Returns recent AAPL price history with moving averages for chart visualization.
        """
        period = "2y" if num_points > 180 else "1y"
        raw_data = self.get_latest_market_data(period=period)
        aapl_df = pd.DataFrame(index=raw_data.index)
        
        # Extract AAPL series
        for col in ["Close", "Open", "High", "Low", "Volume"]:
            if (col, "AAPL") in raw_data.columns:
                aapl_df[col] = raw_data[(col, "AAPL")]
            elif col in raw_data and "AAPL" in raw_data[col]:
                aapl_df[col] = raw_data[col]["AAPL"]

        # Drop non-trading days where Close is NaN, sort chronologically
        aapl_df = aapl_df.dropna(subset=["Close"]).sort_index()

        # Compute moving averages on clean trading sessions
        aapl_df["SMA_20"] = aapl_df["Close"].rolling(20).mean()
        aapl_df["SMA_50"] = aapl_df["Close"].rolling(50).mean()

        return aapl_df.tail(num_points)

# Singleton instance
data_service = DataService()
