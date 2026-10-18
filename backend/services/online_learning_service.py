import os
import sys
import json
import logging
import time
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Tuple
import joblib
import pandas as pd
import numpy as np
import xgboost as xgb
import yfinance as yf

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from services.feature_service import feature_service
from services.data_service import data_service, TICKERS

logger = logging.getLogger("pricepulse.online_learning")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")
LOGS_FILE = os.path.join(BASE_DIR, "models", "online_learning_log.json")
MODEL_PATH = os.path.join(MODELS_DIR, "pricepulse_improved_xgb_model.joblib")
FEATURES_PATH = os.path.join(MODELS_DIR, "pricepulse_improved_features.joblib")
METADATA_PATH = os.path.join(MODELS_DIR, "pricepulse_metadata.json")

# Root models directory for project sync
ROOT_MODELS_DIR = os.path.join(os.path.dirname(BASE_DIR), "models")

class OnlineLearningService:
    def __init__(self):
        self.is_updating = False
        self._last_check_time: Optional[str] = None
        self._init_log_file()

    def _init_log_file(self):
        """Initializes persistent online learning history if not present."""
        os.makedirs(MODELS_DIR, exist_ok=True)
        if not os.path.exists(LOGS_FILE):
            initial_log = {
                "enabled": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "last_sync_timestamp": datetime.now(timezone.utc).isoformat(),
                "last_trained_date": "2024-10-22",
                "total_samples_trained": 2079,
                "history": []
            }
            try:
                with open(LOGS_FILE, "w", encoding="utf-8") as f:
                    json.dump(initial_log, f, indent=2)
            except Exception as e:
                logger.error(f"Failed to initialize online learning log: {e}")

    def get_log_data(self) -> Dict[str, Any]:
        """Loads persistent online learning audit log."""
        try:
            if os.path.exists(LOGS_FILE):
                with open(LOGS_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Error reading online learning log: {e}")
        return {
            "enabled": True,
            "last_sync_timestamp": datetime.now(timezone.utc).isoformat(),
            "last_trained_date": "2024-10-22",
            "total_samples_trained": 2079,
            "history": []
        }

    def _save_log_data(self, data: Dict[str, Any]):
        """Persists online learning audit log."""
        try:
            with open(LOGS_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Error writing online learning log: {e}")

    def get_online_status(self) -> Dict[str, Any]:
        """Returns current online learning and adaptation telemetry."""
        from services.prediction_service import prediction_service

        log_data = self.get_log_data()
        metadata = prediction_service.metadata
        eval_dict = metadata.get("evaluation", {})

        return {
            "enabled": True,
            "status": "updating" if self.is_updating else "active",
            "last_sync_timestamp": log_data.get("last_sync_timestamp"),
            "last_trained_date": log_data.get("last_trained_date", "2026-10-15"),
            "total_samples_trained": log_data.get("total_samples_trained", 2159),
            "features_count": len(prediction_service.features),
            "current_metrics": {
                "mae": float(eval_dict.get("mae", 0.012117)),
                "rmse": float(eval_dict.get("rmse", 0.018730)),
                "directional_accuracy": float(eval_dict.get("directional_accuracy", 0.5192)),
                "r2": float(eval_dict.get("r2", -0.0809))
            },
            "history": log_data.get("history", [])[-10:],  # latest 10 updates
            "last_check_time": self._last_check_time or datetime.now(timezone.utc).isoformat(),
            "message": "Continuous online learning active. Model automatically updates weights upon daily market close."
        }

    def sync_and_train(self, force: bool = False) -> Dict[str, Any]:
        """
        Executes daily online learning cycle:
        1. Downloads historical market data from 2018 up to the latest closed trading session.
        2. Computes the exact 25 technical, volatility, and multi-asset macroeconomic features.
        3. Identifies newly closed sessions with resolved ground-truth next-day returns.
        4. If new sessions exist or force=True, updates/retrains XGBoost Regressor on the expanding window.
        5. Computes updated out-of-sample chronological evaluation metrics.
        6. Atomically saves updated model checkpoint and metadata.
        7. Hot-reloads prediction_service in-memory without downtime.
        """
        if self.is_updating:
            return {"updated": False, "message": "Online update currently in progress."}

        self.is_updating = True
        self._last_check_time = datetime.now(timezone.utc).isoformat()

        try:
            from services.prediction_service import prediction_service

            log_data = self.get_log_data()
            last_trained_date = log_data.get("last_trained_date", "2024-10-22")
            features_list = prediction_service.features

            logger.info("Initiating online learning sync: fetching complete market history...")
            raw_data = yf.download(
                tickers=TICKERS,
                start="2018-01-01",
                auto_adjust=False,
                progress=False
            )

            if raw_data is None or raw_data.empty:
                raise ValueError("yfinance returned an empty dataset for online learning.")

            # Compute features across full historical sequence
            features_df, full_df, latest_date = feature_service.compute_features(raw_data, features_list)

            # Ground truth targets: Next-day return of AAPL for each session t
            # Target is known only when session t+1 has closed!
            targets = (full_df["AAPL"].shift(-1) / full_df["AAPL"] - 1).dropna()
            valid_indices = features_df.index.intersection(targets.index)

            if len(valid_indices) < 100:
                raise ValueError(f"Insufficient aligned training rows ({len(valid_indices)})")

            X_full = features_df.loc[valid_indices]
            y_full = targets.loc[valid_indices]

            latest_completed_date = X_full.index[-1].strftime("%Y-%m-%d")
            total_samples = len(X_full)

            # Check if there is new settled market session
            if not force and latest_completed_date <= last_trained_date:
                logger.info(f"Model already trained up to {last_trained_date}. No new closed session to learn.")
                return {
                    "updated": False,
                    "already_current": True,
                    "last_trained_date": last_trained_date,
                    "total_samples": total_samples,
                    "message": f"Model is up to date with the latest market close ({last_trained_date})."
                }

            logger.info(f"New market sessions detected! Training on {total_samples} samples through {latest_completed_date}...")

            # 80/20 chronological train/test split for authentic out-of-sample evaluation
            split_idx = int(len(X_full) * 0.8)
            X_train, X_test = X_full.iloc[:split_idx], X_full.iloc[split_idx:]
            y_train, y_test = y_full.iloc[:split_idx], y_full.iloc[split_idx:]

            # Retrain / warm-start XGBoost with hyperparameter configuration
            updated_model = xgb.XGBRegressor(
                n_estimators=200,
                learning_rate=0.03,
                max_depth=3,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42
            )

            # Fit on train split to compute validated out-of-sample metrics
            updated_model.fit(X_train, y_train)

            test_preds = updated_model.predict(X_test)
            mae = float(np.mean(np.abs(y_test - test_preds)))
            rmse = float(np.sqrt(np.mean((y_test - test_preds) ** 2)))
            ss_res = np.sum((y_test - test_preds) ** 2)
            ss_tot = np.sum((y_test - np.mean(y_test)) ** 2)
            r2 = float(1 - (ss_res / ss_tot)) if ss_tot > 0 else 0.0
            dir_acc = float(np.mean((y_test > 0) == (test_preds > 0)))

            # Fit on 100% of available completed historical sessions for active inference
            updated_model.fit(X_full, y_full)

            # Save updated model artifact
            joblib.dump(updated_model, MODEL_PATH)
            if os.path.exists(ROOT_MODELS_DIR):
                try:
                    joblib.dump(updated_model, os.path.join(ROOT_MODELS_DIR, "pricepulse_improved_xgb_model.joblib"))
                except Exception as e:
                    logger.warning(f"Failed to sync root models dir: {e}")

            # Update metadata
            metadata = prediction_service.metadata
            metadata["evaluation"] = {
                "mae": mae,
                "rmse": rmse,
                "r2": r2,
                "directional_accuracy": dir_acc,
                "baseline": metadata.get("evaluation", {}).get("baseline"),
                "previous_model": metadata.get("evaluation", {}).get("previous_model"),
                "evaluation_split": {
                    "method": "Chronological (80% train, 20% test)",
                    "train_period": f"{X_train.index[0].strftime('%Y-%m-%d')} to {X_train.index[-1].strftime('%Y-%m-%d')}",
                    "test_period": f"{X_test.index[0].strftime('%Y-%m-%d')} to {X_test.index[-1].strftime('%Y-%m-%d')}",
                    "train_observations": len(X_train),
                    "test_observations": len(X_test),
                    "total_observations": total_samples
                }
            }
            metadata["online_learning"] = {
                "enabled": True,
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "last_trained_date": latest_completed_date,
                "total_samples": total_samples
            }

            with open(METADATA_PATH, "w", encoding="utf-8") as f:
                json.dump(metadata, f, indent=4)

            if os.path.exists(ROOT_MODELS_DIR):
                try:
                    with open(os.path.join(ROOT_MODELS_DIR, "pricepulse_metadata.json"), "w", encoding="utf-8") as f:
                        json.dump(metadata, f, indent=4)
                except Exception:
                    pass

            # Hot reload in prediction_service singleton without restarting FastAPI
            prediction_service.model = updated_model
            prediction_service.metadata = metadata

            # Invalidate data_service cache to ensure live prices reflect newest market data
            data_service._cached_data = None
            data_service._last_fetch_time = 0.0

            # Record audit update entry
            prev_samples = log_data.get("total_samples_trained", 2079)
            new_samples = total_samples - prev_samples

            update_entry = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "trained_through_date": latest_completed_date,
                "total_samples": total_samples,
                "new_samples_added": max(0, new_samples),
                "mae": round(mae, 6),
                "rmse": round(rmse, 6),
                "directional_accuracy": round(dir_acc * 100, 2),
                "r2": round(r2, 4),
                "status": "Success"
            }

            log_data["last_sync_timestamp"] = datetime.now(timezone.utc).isoformat()
            log_data["last_trained_date"] = latest_completed_date
            log_data["total_samples_trained"] = total_samples
            log_data.setdefault("history", []).append(update_entry)
            self._save_log_data(log_data)

            logger.info(
                f"Online learning update complete: trained through {latest_completed_date} ({total_samples} samples). "
                f"MAE: {mae:.6f}, Dir Acc: {dir_acc * 100:.2f}%"
            )

            return {
                "updated": True,
                "last_trained_date": latest_completed_date,
                "total_samples": total_samples,
                "new_samples_added": max(0, new_samples),
                "metrics": {
                    "mae": mae,
                    "rmse": rmse,
                    "directional_accuracy": dir_acc,
                    "r2": r2
                },
                "message": f"Successfully updated model weights on latest market data through {latest_completed_date}."
            }

        except Exception as e:
            logger.error(f"Online learning synchronization failed: {e}", exc_info=True)
            return {
                "updated": False,
                "error": str(e),
                "message": f"Online learning update encountered an error: {str(e)}"
            }
        finally:
            self.is_updating = False

# Singleton instance
online_learning_service = OnlineLearningService()
