const fs = require("fs");
const path = require("path");

const OUT_DIR = __dirname;
const CSV_PATH = path.join(OUT_DIR, "synthetic_estimates.csv");
const MODEL_PATH = path.join(OUT_DIR, "model.json");
const METRICS_PATH = path.join(OUT_DIR, "metrics.json");

const EVENT_TYPES = ["Wedding", "Destination", "Corporate", "Private"];
const LOCATIONS = ["Mumbai", "Delhi", "Pune"];
const DECOR = ["Simple", "Intermediate", "Premium"];
const FEATURE_LIST = [
  "intercept",
  "guests",
  "month",
  "is_weekend",
  "eventType_Wedding",
  "eventType_Destination",
  "eventType_Corporate",
  "eventType_Private",
  "eventType_Other",
  "location_Mumbai",
  "location_Delhi",
  "location_Pune",
  "location_Other",
  "decor_Simple",
  "decor_Intermediate",
  "decor_Premium",
  "decor_Other",
];

function createRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

const random = createRng(42);

function randomInt(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function randomChoice(list) {
  return list[Math.floor(random() * list.length)];
}

function generateSyntheticRow() {
  const eventType = randomChoice(EVENT_TYPES);
  const location = randomChoice(LOCATIONS);
  const decor = randomChoice(DECOR);
  const guests = randomInt(80, 1000);
  const date = new Date(2024 + randomInt(0, 2), randomInt(0, 11), randomInt(1, 28));
  const month = date.getMonth() + 1;
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  const base = 160000;
  const eventBias =
    eventType === "Wedding" ? 95000 :
    eventType === "Destination" ? 135000 :
    eventType === "Corporate" ? 65000 : 35000;
  const locationBias = location === "Mumbai" ? 80000 : location === "Delhi" ? 55000 : 25000;
  const decorBias = decor === "Premium" ? 100000 : decor === "Intermediate" ? 50000 : 5000;
  const seasonBias = [11, 12, 1, 2].includes(month) ? 22000 : 0;
  const weekendBias = isWeekend ? 12000 : 0;
  const noise = randomInt(-22000, 22000);

  const finalBudget = Math.max(
    90000,
    Math.round(base + eventBias + locationBias + decorBias + seasonBias + weekendBias + guests * 1125 + noise),
  );

  return {
    eventType,
    guests,
    location,
    decor,
    date: date.toISOString().slice(0, 10),
    final_budget: finalBudget,
  };
}

function buildFeatureVector(row, featureList) {
  const date = new Date(row.date);
  const month = date.getMonth() + 1;
  const isWeekend = date.getDay() === 0 || date.getDay() === 6 ? 1 : 0;

  const features = {
    intercept: 1,
    guests: row.guests,
    month,
    is_weekend: isWeekend,
    eventType_Wedding: row.eventType === "Wedding" ? 1 : 0,
    eventType_Destination: row.eventType === "Destination" ? 1 : 0,
    eventType_Corporate: row.eventType === "Corporate" ? 1 : 0,
    eventType_Private: row.eventType === "Private" ? 1 : 0,
    eventType_Other: EVENT_TYPES.includes(row.eventType) ? 0 : 1,
    location_Mumbai: row.location === "Mumbai" ? 1 : 0,
    location_Delhi: row.location === "Delhi" ? 1 : 0,
    location_Pune: row.location === "Pune" ? 1 : 0,
    location_Other: LOCATIONS.includes(row.location) ? 0 : 1,
    decor_Simple: row.decor === "Simple" ? 1 : 0,
    decor_Intermediate: row.decor === "Intermediate" ? 1 : 0,
    decor_Premium: row.decor === "Premium" ? 1 : 0,
    decor_Other: DECOR.includes(row.decor) ? 0 : 1,
  };

  return featureList.map((key) => features[key] ?? 0);
}

function transpose(matrix) {
  return matrix[0].map((_, index) => matrix.map((row) => row[index]));
}

function multiply(a, b) {
  const result = Array.from({ length: a.length }, () => Array(b[0].length).fill(0));
  for (let i = 0; i < a.length; i += 1) {
    for (let k = 0; k < b.length; k += 1) {
      for (let j = 0; j < b[0].length; j += 1) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return result;
}

function addRidge(matrix, lambda) {
  return matrix.map((row, i) => row.map((value, j) => (i === j ? value + lambda : value)));
}

function invert(matrix) {
  const n = matrix.length;
  const identity = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  );
  const augmented = matrix.map((row, i) => row.concat(identity[i]));

  for (let pivot = 0; pivot < n; pivot += 1) {
    let pivotValue = augmented[pivot][pivot];
    if (pivotValue === 0) {
      for (let row = pivot + 1; row < n; row += 1) {
        if (augmented[row][pivot] !== 0) {
          const tmp = augmented[pivot];
          augmented[pivot] = augmented[row];
          augmented[row] = tmp;
          pivotValue = augmented[pivot][pivot];
          break;
        }
      }
    }

    if (pivotValue === 0) {
      throw new Error("Matrix not invertible");
    }

    for (let col = 0; col < augmented[pivot].length; col += 1) {
      augmented[pivot][col] /= pivotValue;
    }

    for (let row = 0; row < n; row += 1) {
      if (row === pivot) continue;
      const factor = augmented[row][pivot];
      for (let col = 0; col < augmented[row].length; col += 1) {
        augmented[row][col] -= factor * augmented[pivot][col];
      }
    }
  }

  return augmented.map((row) => row.slice(n));
}

function trainLinearRegression(rows) {
  const X = rows.map((row) => buildFeatureVector(row, FEATURE_LIST));
  const y = rows.map((row) => [row.final_budget]);
  const Xt = transpose(X);
  const XtX = multiply(Xt, X);
  const XtY = multiply(Xt, y);
  const weights = multiply(invert(addRidge(XtX, 1e-6)), XtY);

  const coefficients = {};
  FEATURE_LIST.forEach((key, index) => {
    coefficients[key] = weights[index][0];
  });
  return coefficients;
}

function predict(row, coefficients) {
  const vector = buildFeatureVector(row, FEATURE_LIST);
  return vector.reduce((sum, value, index) => sum + value * (coefficients[FEATURE_LIST[index]] ?? 0), 0);
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function calculateMetrics(rows, coefficients) {
  const errors = rows.map((row) => row.final_budget - predict(row, coefficients));
  const absErrors = errors.map((value) => Math.abs(value));
  const sqErrors = errors.map((value) => value * value);
  const pctErrors = rows.map((row, index) => absErrors[index] / row.final_budget);

  return {
    mae: Number(mean(absErrors).toFixed(2)),
    rmse: Number(Math.sqrt(mean(sqErrors)).toFixed(2)),
    mape: Number((mean(pctErrors) * 100).toFixed(2)),
    residualStdDev: Number(Math.sqrt(mean(sqErrors)).toFixed(2)),
  };
}

function main() {
  const rows = Array.from({ length: 900 }, generateSyntheticRow);
  const splitIndex = Math.floor(rows.length * 0.8);
  const trainRows = rows.slice(0, splitIndex);
  const testRows = rows.slice(splitIndex);

  const coefficients = trainLinearRegression(trainRows);
  const trainMetrics = calculateMetrics(trainRows, coefficients);
  const testMetrics = calculateMetrics(testRows, coefficients);

  const csvHeader = ["eventType", "guests", "location", "decor", "date", "final_budget"];
  const csv = [csvHeader.join(",")]
    .concat(rows.map((row) => [row.eventType, row.guests, row.location, row.decor, row.date, row.final_budget].join(",")))
    .join("\n");
  fs.writeFileSync(CSV_PATH, csv, "utf8");

  const model = {
    modelVersion: "synthetic-lr-v2",
    currency: "INR",
    trainedAt: new Date().toISOString(),
    trainingRows: trainRows.length,
    featureList: FEATURE_LIST,
    coefficients,
    residualStdDev: testMetrics.residualStdDev,
    metrics: {
      mae: testMetrics.mae,
      rmse: testMetrics.rmse,
      mape: testMetrics.mape,
    },
  };

  const metrics = {
    train: trainMetrics,
    test: testMetrics,
    trainingRows: trainRows.length,
    testRows: testRows.length,
    modelVersion: model.modelVersion,
  };

  fs.writeFileSync(MODEL_PATH, JSON.stringify(model, null, 2), "utf8");
  fs.writeFileSync(METRICS_PATH, JSON.stringify(metrics, null, 2), "utf8");

  console.log(`Synthetic CSV saved: ${CSV_PATH}`);
  console.log(`Model saved: ${MODEL_PATH}`);
  console.log(`Metrics saved: ${METRICS_PATH}`);
  console.log(`Test MAE: INR ${testMetrics.mae}`);
  console.log(`Test MAPE: ${testMetrics.mape}%`);
}

main();
