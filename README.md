# PRICEPULSE — Short-Term Market Price Prediction System

> **"Predicting tomorrow's market, using today's data."**  
> PricePulse is a production-grade machine learning web application that predicts the next trading day's AAPL return using historical price action, technical signals, and multi-asset macroeconomic context via a trained XGBoost Regressor.

---

## 1. System Architecture

```
                                  [ Live Financial Markets ]
                    (AAPL, S&P 500 [^GSPC], NASDAQ [^IXIC], VIX [^VIX], Tech ETF [XLK])
                                              │
                                              ▼ (yfinance API)
                                    ┌───────────────────┐
                                    │   Data Service    │ ◄── 5-Minute In-Memory Cache
                                    └─────────┬─────────┘
                                              │
                                              ▼
                                    ┌───────────────────┐
                                    │  Feature Service  │ ◄── Exact 25 Engineered Signals
                                    └─────────┬─────────┘     (Zero Lookahead Bias)
                                              │
                                              ▼
                                    ┌───────────────────┐
                                    │ Prediction Service│ ◄── pricepulse_improved_xgb_model.joblib
                                    └─────────┬─────────┘     pricepulse_improved_features.joblib
                                              │               pricepulse_metadata.json
                                              ▼
                                    ┌───────────────────┐
                                    │  FastAPI Backend  │ ◄── /predict, /history, /model-info, /health
                                    └─────────┬─────────┘
                                              │  (REST / JSON)
                                              ▼
                                    ┌───────────────────┐
                                    │ Next.js Frontend  │ ◄── React 19 + TypeScript + Tailwind CSS v4
                                    └─────────┬─────────┘
                       ┌──────────────────────┴──────────────────────┐
                       ▼                                             ▼
           [ 3D WebGL Intelligence ]                    [ Scroll-Driven Cinematic Story ]
        Three.js / React Three Fiber                    GSAP ScrollTrigger (WebP Frames)
```

---

## 2. Machine Learning Pipeline & Feature Engineering

The model predicts **`next_day_return`** (stationary target) rather than the nominal stock price, avoiding non-stationary drift across historical regimes:

$$\text{Predicted Next Price} = \text{Current Price} \times (1 + \text{Predicted Return})$$

### The Exact 25 Feature Set

All moving averages and oscillators are shifted by 1 trading session ($\text{shift}=1$) during calculation to strictly eliminate lookahead bias:

| Category | Features | Calculation Details |
|---|---|---|
| **Price Action Lags** | `Lag_1`, `Lag_2`, `Lag_3`, `Lag_7` | AAPL Close shifted by 1, 2, 3, and 7 trading sessions |
| **Return & Volatility** | `Return`, `Volatility_7` | Daily percentage change and 7-day rolling return standard deviation |
| **Moving Average Ratios** | `MA7_Ratio`, `MA14_Ratio`, `MA30_Ratio` | $\text{AAPL Close} / \text{Rolling Mean}(\text{period})$ with $\text{shift}(1)$ |
| **SMA Ratios & MACD** | `SMA20_Ratio`, `SMA50_Ratio`, `MACD` | Ratio to 20/50 SMA and $\text{EMA}_{12} - \text{EMA}_{26}$ |
| **Envelopes & Oscillators** | `BB_Position`, `RSI_14` | Relative position in 20-day 2-std bands, 14-day Wilder RSI |
| **Market Context Returns** | `SP500_Return`, `NASDAQ_Return`, `VIX_Return`, `XLK_Return` | Daily returns of S&P 500, NASDAQ, VIX index, and Tech ETF |
| **Relative Alpha Spreads** | `AAPL_vs_SP500`, `AAPL_vs_NASDAQ`, `AAPL_vs_XLK` | $\text{AAPL Return} - \text{Benchmark Return}$ |
| **Cumulative Momentum** | `SP500_Momentum_5`, `NASDAQ_Momentum_5`, `XLK_Momentum_5` | 5-day cumulative percentage return of indices |
| **Implied Volatility Level**| `VIX_Level` | Absolute spot level of the CBOE Volatility Index |

### Target Session & Calendar Computation
To prevent predicting over weekends or market closures, PricePulse implements an explicit NYSE trading session calendar (`get_next_trading_session`):
- Automatically advances Friday closes to the upcoming Monday session.
- Handles all official US equity market holidays (New Year's Day, MLK Day, Washington's Birthday, Good Friday via the astronomical Meeus algorithm, Memorial Day, Juneteenth, Independence Day, Labor Day, Thanksgiving Day, and Christmas Day) with proper Friday/Monday observation shifts.

### Uncertainty & Confidence Disclosure Policy
Financial time series exhibit substantial stochastic noise. PricePulse enforces a strict transparency policy:
- **No Fabricated Confidence Percentages**: The model outputs a continuous regression point estimate. It does NOT generate synthetic confidence scores (e.g., "94% AI confidence").
- **Uncalibrated Uncertainty**: The system explicitly identifies that uncertainty intervals are not statistically calibrated, protecting users from false certainty.

---

## 3. Model Specifications & Authentic Evaluation

The model loaded by the backend is the final, saved **XGBoost Regressor**:
- Model file: `backend/models/pricepulse_improved_xgb_model.joblib`
- Features file: `backend/models/pricepulse_improved_features.joblib`
- Metadata: `backend/models/pricepulse_metadata.json`

### Hyperparameters
```json
{
  "n_estimators": 200,
  "learning_rate": 0.03,
  "max_depth": 3,
  "subsample": 0.8,
  "colsample_bytree": 0.8,
  "random_state": 42
}
```

### Out-of-Sample Test Evaluation Metrics
Metrics are reported directly from `pricepulse_metadata.json` evaluated chronologically on out-of-sample test data:

| Metric | Model Score | Context & Interpretation |
|---|---|---|
| **MAE** | `0.012117` (~1.21%) | Average absolute return error per trading session |
| **RMSE** | `0.018730` (~1.87%) | Penalizes outlier volatility spikes |
| **Directional Accuracy** | `51.92%` | Correctly predicts market direction (+/-) 51.92% of the time, exceeding 50% random walk |
| **$R^2$ Score** | `-0.0809` | Typical for daily equity returns due to high stochastic newsflow |

### Model Comparison Table (Test Set)
| Model | MAE | RMSE | $R^2$ | Directional Accuracy |
|---|---|---|---|---|
| **Naive Baseline** | `0.011789` | `0.018039` | `-0.002602` | N/A (predicts zero return) |
| **Old XGBoost (15 Features)** | `0.012770` | `0.019645` | `-0.082560` | `52.26%` |
| **Improved XGBoost (25 Features)** | `0.012117` | `0.018730` | `-0.080865` | `51.92%` |

---

## 4. API Endpoints Specification

| Method | Endpoint | Query Parameters | Description |
|---|---|---|---|
| `GET` | `/` | None | Root status and project info |
| `GET` | `/health` | None | Health check verifying model integrity, feature count (25), and system timestamp |
| `GET`, `POST` | `/predict` | `force_refresh` (bool, default `false`) | Runs live inference: downloads latest market feeds, computes 25 features, predicts next-day return & projected price |
| `GET` | `/history` | `days` (int, 10–365, default `90`) | Returns historical AAPL price points with 20-day and 50-day SMAs |
| `GET` | `/model-info` | None | Model transparency: hyperparameters, exact evaluation metrics, and feature catalog |
| `GET` | `/model/online-status` | None | Real-time status of continuous online learning engine, total samples, and training audit history |
| `POST` | `/model/sync-daily` | `force` (bool, default `false`) | Triggers automated daily adaptation cycle: ingests settled prices, retrains on expanding window, and hot-reloads model |


---

## 5. Project Structure

```
PricePulse/
│
├── backend/
│   ├── main.py                     # FastAPI application endpoints
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Backend environment configuration
│   ├── models/
│   │   ├── pricepulse_improved_xgb_model.joblib
│   │   ├── pricepulse_improved_features.joblib
│   │   └── pricepulse_metadata.json
│   ├── services/
│   │   ├── data_service.py         # yfinance data retrieval & caching
│   │   ├── feature_service.py      # Notebook feature engineering
│   │   └── prediction_service.py   # Model inference & state management
│   └── schemas/
│       └── prediction.py           # Pydantic request/response schemas
│
├── models/                         # Project root model artifacts
│   ├── pricepulse_improved_xgb_model.joblib
│   ├── pricepulse_improved_features.joblib
│   └── pricepulse_metadata.json
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx              # Root HTML & SEO configuration
│   │   ├── page.tsx                # Main PricePulse experience
│   │   └── globals.css             # Tailwind v4 & glassmorphism theme
│   ├── components/
│   │   ├── Navbar.tsx              # Brand header & quick navigation
│   │   ├── Preloader.tsx           # Cinematic boot sequence
│   │   ├── CinematicHero.tsx       # Live Three.js interactive 3D core
│   │   ├── ScrollFrameSequence.tsx # GSAP pinned canvas frame scrubber
│   │   ├── LivePredictionDashboard.tsx # Inference card & Run button
│   │   ├── PriceChart.tsx          # Recharts trajectory & prediction dot
│   │   ├── MarketContextCards.tsx  # S&P, NASDAQ, VIX, XLK cards
│   │   ├── TechnicalIndicatorsGrid.tsx # RSI, MACD, BB, Volatility gauges
│   │   ├── ModelArchitectureSection.tsx# 5-stage pipeline & 25-feature catalog
│   │   ├── ModelPerformanceSection.tsx # Honest test-set metrics
│   │   ├── TechStackSection.tsx    # Technology stack showcase
│   │   └── DisclaimerFooter.tsx    # Financial and research disclaimer
│   ├── types/
│   │   └── api.ts                  # TypeScript API contract
│   ├── lib/
│   │   └── api.ts                  # Fetch client with error handling
│   ├── public/
│   │   └── sequence/
│   │       ├── desktop/            # 100 WebP cinematic frames
│   │       └── mobile/             # 50 WebP mobile-optimized frames
│   ├── package.json
│   └── tsconfig.json
│
├── notebooks/
│   ├── PricePulse_Improved.ipynb   # Source of truth training notebook
│   ├── pricepulse_features.joblib
│   ├── pricepulse_metadata.json
│   └── pricepulse_xgb_model.joblib
│
├── scripts/
│   └── generate_cinematic_sequence.py # Python WebP frame generator
│
└── README.md
```

---

## 6. Running Locally

### Step 1: Clone Repository & Setup Backend
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
Verify the API:
- Health: `http://127.0.0.1:8000/health`
- Predict: `http://127.0.0.1:8000/predict`
- Interactive Docs: `http://127.0.0.1:8000/docs`

### Step 2: Setup Frontend
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 7. Deployment Guide

### Backend Deployment (Render)
1. In Render dashboard, create a new **Web Service**.
2. Connect your Git repository.
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to:
   ```bash
   pip install -r requirements.txt
   ```
5. Set **Start Command** to:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
6. Add Environment Variables:
   - `ALLOWED_ORIGINS`: `https://your-frontend-deployment.vercel.app`
   - `PORT`: (auto-assigned by Render)
7. Health Check Path: `/health`.

### Frontend Deployment (Vercel)
1. In Vercel dashboard, import your repository.
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Next.js**.
4. Set Environment Variable:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-service.onrender.com`
5. Deploy.

---

## 8. Known Limitations

1. **Single Stock Focus (AAPL)**: The model architecture, feature distributions, and macroeconomic context cross-assets were trained exclusively on Apple Inc. (`AAPL`). It should not be applied to other arbitrary tickers without re-training and feature engineering validation.
2. **Horizon**: PricePulse is designed strictly for next-trading-day return estimation ($t+1$). It does not model multi-week, monthly, or intraday price action.
3. **Market Regimes & Black Swans**: While macroeconomic indices (S&P 500, NASDAQ, VIX, XLK) provide broader market context, extreme exogenous events (earnings releases, geopolitical shocks, unexpected regulatory actions) introduce stochastic variance that cannot be captured by technical price action alone.
4. **Upstream Data Availability**: Relies on Yahoo Finance (`yfinance`) feeds which are subject to upstream rate limits and exchange market holiday calendars.

---

## 9. Disclaimer

PricePulse provides machine-learning-based estimates for educational and research purposes only. It does not constitute financial advice, investment counsel, or an endorsement to buy or sell securities. Past model performance on historical test sets does not guarantee future market returns.
