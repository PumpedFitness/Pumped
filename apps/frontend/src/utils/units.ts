import type { WeightUnit } from '@/data/local/schema/userProfile';

const KG_TO_LBS = 2.20462;

function kgToLbs(kg: number): number {
  return kg * KG_TO_LBS;
}

function lbsToKg(lbs: number): number {
  return lbs / KG_TO_LBS;
}

export function displayWeight(kg: number, unit: WeightUnit): number {
  return unit === 'lbs' ? kgToLbs(kg) : kg;
}

export function toKg(value: number, unit: WeightUnit): number {
  return unit === 'lbs' ? lbsToKg(value) : value;
}

export function formatWeight(kg: number, unit: WeightUnit): string {
  const value = displayWeight(kg, unit);
  return `${value.toFixed(1)} ${unit}`;
}
