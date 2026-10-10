import os
import logging
from datetime import datetime, timezone
from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from services.prediction_service import prediction_service
from schemas.prediction import (
    PredictionResponse,
    HealthResponse,
    PriceHistoryResponse,
    ModelInfoResponse
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("pricepulse.api")

app = FastAPI(
    title="PricePulse API",
    description="Short-Term Market Price Prediction System API powered by XGBoost",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env:
    origins = [orig.strip() for orig in allowed_origins_env.split(",") if orig.strip()]
else:
    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://pricepulse.vercel.app",
        "*"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Root"])
def root():
    return {
        "project": "PricePulse — Short-Term Market Price Prediction System",
        "version": "1.0.0",
        "model": "XGBoost Regressor",
        "status": "operational",
        "docs": "/docs"
    }

@app.get("/health", response_model=HealthResponse, tags=["Monitoring"])
def health():
    """
    Health check endpoint verifying API status, model loading, and feature integrity.
    """
    try:
        is_loaded = prediction_service.model is not None
        feat_count = len(prediction_service.features)
        return HealthResponse(
            status="healthy" if is_loaded and feat_count == 25 else "degraded",
            model_loaded=is_loaded,
            features_count=feat_count,
            timestamp=datetime.now(timezone.utc).isoformat(),
            project="PricePulse"
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthResponse(
            status="unhealthy",
            model_loaded=False,
            features_count=0,
            timestamp=datetime.now(timezone.utc).isoformat(),
            project="PricePulse"
        )

@app.get("/predict", response_model=PredictionResponse, tags=["Inference"])
def predict(force_refresh: bool = Query(False, description="Force re-download fresh market data")):
    """
    Executes live inference pipeline:
    1. Downloads latest market data via yfinance (AAPL, ^GSPC, ^IXIC, ^VIX, XLK).
    2. Calculates the 25 exact technical and market features.
    3. Runs the saved XGBoost Regressor on the latest observation.
    4. Computes next-day expected return and projected price.
    """
    try:
        prediction = prediction_service.run_prediction(force_refresh=force_refresh)
        return prediction
    except ValueError as ve:
        logger.warning(f"Data or feature validation error: {ve}")
        raise HTTPException(
            status_code=422,
            detail=f"Market data processing error: {str(ve)}"
        )
    except RuntimeError as re:
        logger.error(f"Market data retrieval failure: {re}")
        raise HTTPException(
            status_code=503,
            detail="Market data is temporarily unavailable from the upstream provider. Please try again in a few moments."
        )
    except Exception as e:
        logger.error(f"Unexpected prediction error: {e}", exc_info=False)
        raise HTTPException(
            status_code=500,
            detail="An error occurred while generating the market prediction. Please try again."
        )

@app.get("/history", response_model=PriceHistoryResponse, tags=["Market Data"])
def get_history(days: int = Query(90, ge=10, le=365, description="Number of historical trading days")):
    """
    Retrieves recent AAPL price history and moving averages for the chart interface.
    """
    try:
        return prediction_service.get_price_history(days=days)
    except Exception as e:
        logger.error(f"Failed to fetch price history: {e}")
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve historical price series at this time."
        )

@app.get("/model-info", response_model=ModelInfoResponse, tags=["Model Transparency"])
def model_info():
    """
    Provides full transparency into the trained XGBoost model:
    Hyperparameters, exact evaluation metrics (MAE, RMSE, R², Directional Accuracy),
    and feature composition.
    """
    try:
        return prediction_service.get_model_info()
    except Exception as e:
        logger.error(f"Failed to fetch model info: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unable to load model metadata."
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
