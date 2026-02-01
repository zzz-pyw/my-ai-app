
export enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}

export type TabType = 'calculator' | 'toolbox' | 'info';

export interface SearchEngine {
  name: string;
  url: string;
  icon: string;
}

export interface EmergencyDrug {
  name: string;
  spec: string;
  defaultAmount: number; 
  amountUnit: string;
  defaultVolume: number; 
  defaultSpeed: number;  
  range: string;         
  indications: string;
  solvent: 'NS' | 'GS' | 'NS/GS' | '原液' | '无'; 
  isWeightDependent: boolean; 
  targetDoseUnit: 'ug/kg/min' | 'mg/kg/h' | 'ug/kg/h' | 'mg/h' | 'ug/min' | 'U/min' | 'U/h' | 'ml/h';
}

export interface ScaleItem {
  label: string;
  options: { label: string; score: number }[];
}

export interface ClinicalScale {
  id: string;
  name: string;
  dept: string;
  description: string;
  items: ScaleItem[];
  interpretation: (total: number) => string;
}

export interface BurnConfig {
  tbsa: number; // 烧伤面积百分比
  weight: number;
  first24hTotal: number;
  first8h: number;
  next16h: number;
  colloid: number; // 胶体
  crystalloid: number; // 晶体
  water: number; // 水分
}
