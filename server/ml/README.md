# ML Estimator

This folder contains both the runtime estimator and the local training scripts. The API loads `server/ml/model.json` when present and falls back to the built-in baseline when no trained artifact exists.

## Retraining (recommended path)
1. Export training data from the `estimates` table (only rows with `final_budget`).
2. Train a regression model (CatBoost recommended for tabular + categorical features).
3. Save the model file as `server/ml/model.json` or update `server/ml/estimator.ts` to load your preferred artifact format.

### Example training command
```bash
python server/ml/train_catboost.py --csv path/to/estimates.csv --model-out server/ml/model.cbm
```

## Synthetic demo training (no external deps)
If you want a demo model without real data, run:
```bash
node server/ml/train_synthetic.cjs
```

This generates:
- `server/ml/synthetic_estimates.csv` (fake training data)
- `server/ml/model.json` (trained linear model used automatically by the API)
- `server/ml/metrics.json` (train/test metrics for the synthetic model)

### Suggested features
- Categorical: `eventType`, `location`, `decor`
- Numeric: `guests`
- Date features: `month`, `isWeekend`, `season`

### Suggested metrics
- MAE (mean absolute error)
- MAPE (mean absolute percentage error)

## Notes
- Keep `modelVersion` updated when you swap models.
- The API logs every estimate and booking so training data grows over time.
- The runtime now returns a point estimate, a budget range, and a confidence score derived from model metrics.
