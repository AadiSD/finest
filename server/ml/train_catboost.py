import argparse
from pathlib import Path

import pandas as pd

try:
    from catboost import CatBoostRegressor
except Exception as exc:  # pragma: no cover - optional dependency
    raise SystemExit(
        "CatBoost is not installed. Install with: pip install catboost"
    ) from exc


def main() -> None:
    parser = argparse.ArgumentParser(description="Train CatBoost budget estimator")
    parser.add_argument("--csv", required=True, help="Path to estimates CSV with final_budget")
    parser.add_argument("--model-out", default="server/ml/model.cbm", help="Output model path")
    args = parser.parse_args()

    data_path = Path(args.csv)
    if not data_path.exists():
        raise SystemExit(f"CSV not found: {data_path}")

    df = pd.read_csv(data_path)
    required = ["eventType", "guests", "location", "decor", "date", "final_budget"]
    missing = [col for col in required if col not in df.columns]
    if missing:
        raise SystemExit(f"Missing columns: {missing}")

    df = df.dropna(subset=["final_budget"])

    # Feature engineering
    df["date"] = pd.to_datetime(df["date"])
    df["month"] = df["date"].dt.month
    df["is_weekend"] = (df["date"].dt.dayofweek >= 5).astype(int)

    features = ["eventType", "guests", "location", "decor", "month", "is_weekend"]
    target = "final_budget"

    cat_features = ["eventType", "location", "decor"]

    model = CatBoostRegressor(
        iterations=400,
        depth=6,
        learning_rate=0.1,
        loss_function="MAE",
        verbose=False,
    )
    model.fit(df[features], df[target], cat_features=cat_features)
    model.save_model(args.model_out)

    print(f"Model saved to {args.model_out}")


if __name__ == "__main__":
    main()
