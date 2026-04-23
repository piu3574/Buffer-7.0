import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Ward } from "./dsa/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Validation utilities
export function validateWard(ward: any): ward is Ward {
  return (
    typeof ward === 'object' &&
    typeof ward.id === 'string' &&
    typeof ward.name === 'string' &&
    typeof ward.ndvi === 'number' &&
    typeof ward.population === 'number' &&
    typeof ward.maxPopulation === 'number' &&
    typeof ward.heatExcess === 'number' &&
    typeof ward.maxHeatExcess === 'number' &&
    typeof ward.floodRisk === 'number' &&
    typeof ward.windPotential === 'number' &&
    typeof ward.pollution === 'number' &&
    Array.isArray(ward.centroid) &&
    ward.centroid.length === 2 &&
    typeof ward.deficitScore === 'number' &&
    typeof ward.saplingsPlanted === 'number' &&
    typeof ward.soilType === 'string' &&
    Array.isArray(ward.availableSpaces)
  );
}

export function validateOptimizationInput(saplings: any, budget: any): { isValid: boolean; error?: string } {
  if (typeof saplings !== 'number' || saplings <= 0) {
    return { isValid: false, error: 'Saplings must be a positive number' };
  }
  if (typeof budget !== 'number' || budget <= 0) {
    return { isValid: false, error: 'Budget must be a positive number' };
  }
  if (saplings > 100000) {
    return { isValid: false, error: 'Maximum saplings limit is 100,000' };
  }
  if (budget > 1000000) {
    return { isValid: false, error: 'Maximum budget limit is 1,000,000' };
  }
  return { isValid: true };
}
