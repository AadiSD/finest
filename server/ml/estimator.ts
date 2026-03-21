import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

export type EstimateInput = {
  eventType: string;
  guests: number;
  location: string;
  decor: string;
  date: string;
};

export type EstimateOutput = {
  estimatedBudget: number;
  budgetLow: number;
  budgetHigh: number;
  currency: string;
  modelVersion: string;
  confidenceLabel: "low" | "medium" | "high";
  confidenceScore: number;
};

type LinearModelMetrics = {
  mae: number;
  rmse: number;
  mape: number;
};

export type EstimatorMetadata = {
  modelVersion: string;
  currency: string;
  trainedAt?: string;
  trainingRows?: number;
  metrics?: LinearModelMetrics;
};

type LinearModel = {
  modelVersion: string;
  currency: string;
  featureList: string[];
  coefficients: Record<string, number>;
  metrics?: LinearModelMetrics;
  residualStdDev?: number;
  trainingRows?: number;
  trainedAt?: string;
};

const EVENT_BIAS: Record<string, number> = {
  Wedding: 90000,
  Destination: 120000,
  Corporate: 60000,
  Private: 30000,
};

const LOCATION_BIAS: Record<string, number> = {
  Mumbai: 70000,
  Delhi: 50000,
  Pune: 20000,
};

const DECOR_BIAS: Record<string, number> = {
  Simple: 0,
  Intermediate: 45000,
  Premium: 90000,
};

const BASE_BUDGET = 150000;
const PER_GUEST = 1100;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODEL_PATH = path.join(__dirname, "model.json");

let cachedModel: LinearModel | null = null;

function roundBudget(value: number) {
  return Math.max(75000, Math.round(value));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function loadModel(): LinearModel | null {
  if (cachedModel) return cachedModel;
  try {
    if (!existsSync(MODEL_PATH)) return null;
    cachedModel = JSON.parse(readFileSync(MODEL_PATH, "utf8")) as LinearModel;
    return cachedModel;
  } catch {
    return null;
  }
}

function getMonthAndWeekend(date: string) {
  const parsed = new Date(date);
  const isValid = !Number.isNaN(parsed.getTime());
  const month = isValid ? parsed.getMonth() + 1 : 1;
  const isWeekend = isValid && (parsed.getDay() === 0 || parsed.getDay() === 6) ? 1 : 0;
  return { month, isWeekend };
}

function buildFeatures(input: EstimateInput, featureList: string[]) {
  const { month, isWeekend } = getMonthAndWeekend(input.date);
  const features: Record<string, number> = {
    intercept: 1,
    guests: input.guests,
    month,
    is_weekend: isWeekend,
    eventType_Wedding: input.eventType === "Wedding" ? 1 : 0,
    eventType_Destination: input.eventType === "Destination" ? 1 : 0,
    eventType_Corporate: input.eventType === "Corporate" ? 1 : 0,
    eventType_Private: input.eventType === "Private" ? 1 : 0,
    eventType_Other:
      ["Wedding", "Destination", "Corporate", "Private"].includes(input.eventType) ? 0 : 1,
    location_Mumbai: input.location === "Mumbai" ? 1 : 0,
    location_Delhi: input.location === "Delhi" ? 1 : 0,
    location_Pune: input.location === "Pune" ? 1 : 0,
    location_Other: ["Mumbai", "Delhi", "Pune"].includes(input.location) ? 0 : 1,
    decor_Simple: input.decor === "Simple" ? 1 : 0,
    decor_Intermediate: input.decor === "Intermediate" ? 1 : 0,
    decor_Premium: input.decor === "Premium" ? 1 : 0,
    decor_Other: ["Simple", "Intermediate", "Premium"].includes(input.decor) ? 0 : 1,
  };

  return featureList.map((key) => features[key] ?? 0);
}

function buildRange(estimate: number, residualStdDev: number | undefined) {
  const spread = Math.max(25000, Math.round((residualStdDev ?? estimate * 0.08) * 1.15));
  return {
    budgetLow: roundBudget(estimate - spread),
    budgetHigh: roundBudget(estimate + spread),
  };
}

function getConfidence(metrics?: LinearModelMetrics) {
  const mape = metrics?.mape ?? 18;
  const score = clamp(1 - mape / 40, 0.2, 0.95);
  if (score >= 0.78) {
    return { confidenceLabel: "high" as const, confidenceScore: Number(score.toFixed(2)) };
  }
  if (score >= 0.55) {
    return { confidenceLabel: "medium" as const, confidenceScore: Number(score.toFixed(2)) };
  }
  return { confidenceLabel: "low" as const, confidenceScore: Number(score.toFixed(2)) };
}

function predictLinear(model: LinearModel, input: EstimateInput): EstimateOutput {
  const vector = buildFeatures(input, model.featureList);
  const estimatedBudget = roundBudget(
    vector.reduce((sum, value, idx) => {
      const key = model.featureList[idx];
      return sum + value * (model.coefficients[key] ?? 0);
    }, 0),
  );
  const range = buildRange(estimatedBudget, model.residualStdDev);
  const confidence = getConfidence(model.metrics);

  return {
    estimatedBudget,
    budgetLow: range.budgetLow,
    budgetHigh: range.budgetHigh,
    currency: model.currency || "INR",
    modelVersion: model.modelVersion || "synthetic-lr-v1",
    confidenceLabel: confidence.confidenceLabel,
    confidenceScore: confidence.confidenceScore,
  };
}

function predictBaseline(input: EstimateInput): EstimateOutput {
  const eventBias = EVENT_BIAS[input.eventType] ?? 45000;
  const locationBias = LOCATION_BIAS[input.location] ?? 25000;
  const decorBias = DECOR_BIAS[input.decor] ?? 20000;
  const estimatedBudget = roundBudget(
    BASE_BUDGET + eventBias + locationBias + decorBias + input.guests * PER_GUEST,
  );
  const range = buildRange(estimatedBudget, estimatedBudget * 0.12);

  return {
    estimatedBudget,
    budgetLow: range.budgetLow,
    budgetHigh: range.budgetHigh,
    currency: "INR",
    modelVersion: "baseline-v1",
    confidenceLabel: "low",
    confidenceScore: 0.35,
  };
}

export function estimateBudget(input: EstimateInput): EstimateOutput {
  const model = loadModel();
  if (model) {
    return predictLinear(model, input);
  }
  return predictBaseline(input);
}

export function getEstimatorMetadata(): EstimatorMetadata {
  const model = loadModel();
  if (model) {
    return {
      modelVersion: model.modelVersion,
      currency: model.currency,
      trainedAt: model.trainedAt,
      trainingRows: model.trainingRows,
      metrics: model.metrics,
    };
  }

  return {
    modelVersion: "baseline-v1",
    currency: "INR",
  };
}
