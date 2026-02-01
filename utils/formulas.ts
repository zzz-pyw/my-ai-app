
import { Gender, BurnConfig } from '../types';

/**
 * 肌酐清除率 (CCr) - Cockcroft-Gault 公式
 */
export const calculateCCr = (age: number, weight: number, cr: number, gender: Gender, isUmol: boolean): number => {
  const cr_mg_dl = isUmol ? cr / 88.4 : cr;
  if (!cr_mg_dl) return 0;
  let result = ((140 - age) * weight) / (72 * cr_mg_dl);
  if (gender === Gender.FEMALE) result *= 0.85;
  return Number(result.toFixed(2));
};

/**
 * 估算肾小球滤过率 (eGFR) - CKD-EPI 公式
 */
export const calculateEGFR = (age: number, cr: number, gender: Gender, isUmol: boolean): number => {
  const scr = isUmol ? cr : cr * 88.4;
  if (!scr) return 0;
  const k = gender === Gender.FEMALE ? 62 : 80;
  const a = gender === Gender.FEMALE ? -0.329 : -0.411;
  const genderFactor = gender === Gender.FEMALE ? 1.018 : 1;
  const scr_k = scr / k;
  const result = 141 * Math.min(scr_k, 1) ** a * Math.max(scr_k, 1) ** -1.209 * 0.993 ** age * genderFactor;
  return Number(result.toFixed(2));
};

/**
 * 补钾计算 (mmol & g)
 * 1g KCl ≈ 13.4 mmol K+
 */
export const calculateKCorrection = (current: number, target: number, weight: number): { mmol: number, grams: number } => {
  if (current >= target || !weight) return { mmol: 0, grams: 0 };
  const mmol = (target - current) * weight * 0.3;
  const grams = mmol / 13.4;
  return { mmol: Number(mmol.toFixed(1)), grams: Number(grams.toFixed(2)) };
};

/**
 * 补钠计算 (mmol & g)
 * 1g NaCl ≈ 17 mmol Na+
 */
export const calculateNaDeficit = (current: number, target: number, weight: number, gender: Gender): { mmol: number, grams: number } => {
  if (current >= target || !weight) return { mmol: 0, grams: 0 };
  const factor = gender === Gender.FEMALE ? 0.5 : 0.6;
  const mmol = (target - current) * weight * factor;
  const grams = mmol / 17;
  return { mmol: Number(mmol.toFixed(1)), grams: Number(grams.toFixed(2)) };
};

/**
 * 烧伤补液计算 - Parkland 公式
 * 总量 = 4ml * 体重(kg) * TBSA(%)
 */
export const calculateBurnFluids = (weight: number, tbsa: number): BurnConfig => {
  const crystalloidColloidTotal = 1.5 * weight * tbsa; // 晶胶总量 (1.5ml/kg/%)
  const water = 2000; // 每日基础水分
  const total = crystalloidColloidTotal + water;
  
  return {
    tbsa,
    weight,
    first24hTotal: Math.round(total),
    first8h: Math.round(crystalloidColloidTotal / 2 + water / 2),
    next16h: Math.round(crystalloidColloidTotal / 2 + water / 2),
    colloid: Math.round(0.5 * weight * tbsa),
    crystalloid: Math.round(1.0 * weight * tbsa),
    water
  };
};
