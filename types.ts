
export enum Tab {
  CLICKER = 'CLICKER',
  MARKET = 'MARKET',
  MANAGEMENT = 'MANAGEMENT',
  SCHEMES = 'SCHEMES',
  PROFILE = 'PROFILE'    
}

export enum VerticalType {
  DATING = 'Дейтинг',
  ESCORT = 'Эскорт',
  SHOP = 'Шоп',
  NFT = 'НФТ',
  TRADE = 'Трейд',
  TRAFFIC = 'Трафик',
  OFFICE = 'Офис',
  LIFESTYLE = 'Имущество',
  LAUNDERING = 'Обмыв',
  DARK = 'Чернуха',
  SECURITY = 'Крыша'
}

export enum UpgradeType {
  RENTAL = 'RENTAL',       
  SOFTWARE = 'SOFTWARE',   
  TRAFFIC = 'TRAFFIC',     
  BLACK_MARKET = 'BLACK_MARKET',
  SECURITY = 'SECURITY'
}

export enum BusinessStage {
  NONE = 'NONE',
  REMOTE_TEAM = 'REMOTE_TEAM', 
  OFFICE = 'OFFICE',           
  NETWORK = 'NETWORK'          
}

export enum TeamStrategy {
  SAFE = 'SAFE',       
  BALANCED = 'BALANCED', 
  AGGRESSIVE = 'AGGRESSIVE' 
}

export enum AssetType {
  CRYPTO = 'CRYPTO',
  STOCK = 'STOCK',
  RESOURCE = 'RESOURCE'
}

export interface AssetItem {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  basePrice: number;
  volatility: number; 
  icon: string;
}

export enum SchemeCategory {
  GREY = 'GREY',   
  BLACK = 'BLACK'  
}

export interface SchemeItem {
  id: string;
  name: string;
  description: string;
  category: SchemeCategory;
  cost: number;
  durationSeconds: number; 
  riskPercentage: number;  
  minProfit: number;
  maxProfit: number;
  icon: string;
  reqReputation?: number;
}

export interface ActiveScheme {
  id: string; 
  schemeId: string;
  startTime: number;
  endTime: number;
  isReady: boolean;
}

export interface UpgradeItem {
  id: string;
  name: string;
  type: UpgradeType;
  vertical: VerticalType;
  baseCost: number;
  baseProfit: number; 
  level: number;
  description: string;
  maxLevel?: number;
  tierNames?: string[]; 
}

export interface LaunderingItem {
  id: string;
  name: string;
  baseCost: number;
  baseLimit: number; 
  baseIncome: number; 
  description: string;
  reqBusinessStage: BusinessStage;
  icon: string;
}

export interface PropertyItem {
  id: string;
  name: string;
  baseCost: number;
  reputationBonus: number;
  description: string;
  image: string;
}

export interface JobPosition {
  id: string;
  title: string;
  vertical: string;
  salaryPerClick: number;
  passiveIncome: number;
  requiredReputation: number;
  costToPromote: number;
  isManager: boolean;
  reqBusinessStage: BusinessStage; 
  baseRisk: number; 
  reqUpgradeId?: string; 
  reqPropertyId?: string; 
  reqWorkers?: number; 
  description: string; 
  promotionCooldownHours?: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  baseExpCost: number;
  icon: string;
}

export interface DropItem {
  id: string;
  name: string;
  role: string;
  hireCost: number;
  limitBonus: number;
  baseFearRate: number; // growth per second
  icon: string;
}

export interface OwnedDrop {
  id: string;
  fear: number;
  lastPremiumTime: number;
}

export interface GameEvent {
  id: string;
  title: string;
  message: string;
  type: 'GOOD' | 'BAD' | 'URGENT';
  effectValue: number;
  actionLabel?: string;
  onAction?: () => void;
}

export interface GameState {
  balance: number;
  lifetimeEarnings: number;
  reputation: number;
  experience: number; 
  clickValue: number;
  profitPerSecond: number; 
  riskLevel: number; 
  upgrades: Record<string, number>; 
  properties: Record<string, number>; 
  launderingUpgrades: Record<string, number>; 
  skills: Record<string, number>; 
  ownedAssets: Record<string, number>; 
  assetPrices: Record<string, number>; 
  activeSchemes: ActiveScheme[];
  ownedDrops: Record<string, OwnedDrop>;
  currentJobId: string;
  lastPromotionTime: number; 
  hasBusiness: boolean;
  businessStage: BusinessStage; 
  teamStrategy: TeamStrategy; 
  workers: number;     
  officeLevel: number;
  officeBranches: number;
  workerSalaryRate: number; 
  lastSaveTime: number;
  isPanicMode: boolean; 
  panicClicks: number;
}

export const INITIAL_STATE: GameState = {
  balance: 0,
  lifetimeEarnings: 0,
  profitPerSecond: 0,
  clickValue: 1,
  reputation: 0,
  experience: 0,
  riskLevel: 0,
  upgrades: {},
  properties: {},
  launderingUpgrades: {}, 
  skills: {},
  ownedAssets: {},
  assetPrices: {},
  activeSchemes: [],
  ownedDrops: {},
  currentJobId: 'job_start',
  lastPromotionTime: 0,
  hasBusiness: false,
  businessStage: BusinessStage.NONE,
  teamStrategy: TeamStrategy.SAFE,
  workers: 0,
  officeLevel: 1,
  officeBranches: 1,
  workerSalaryRate: 0.4, 
  lastSaveTime: Date.now(),
  isPanicMode: false,
  panicClicks: 0
};
