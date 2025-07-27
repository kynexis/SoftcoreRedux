export interface TraderChanges {
	enabled: boolean;
	betterSalesToTraders: boolean;
	alternativeCategories: boolean;
	pacifistFence: PacifistFence;
	reasonablyPricedCases: boolean;
	skierUsesEuros: boolean;
	biggerLimits: { enabled: boolean; multiplier: number };
}

export interface PacifistFence {
	enabled: boolean;
	numberOfFenceOffers: number;
}
export interface Configuration {
	general: General;
	stashOptions: StashOptions;
	secureContainersOptions: SecureContainerOptions;
	hideoutOptions: HideoutOptions;
	economyOptions: EconomyOptions;
	traderChanges: TraderChanges;
	craftingChanges: CraftingChanges;
	insuranceChanges: InsuranceChanges;
	otherTweaks: OtherTweaks;
}

export interface General {
	enabled: boolean
	debug: boolean
}

export interface SecureContainerOptions {
	enabled: boolean;
	progressiveContainers: ProgressiveContainers;
	biggerContainers: boolean;
	CollectorQuestLevelStart?: number;
}
export interface ProgressiveContainers {
	enabled: boolean
	collectorQuestRedone: boolean
}

export interface HideoutOptions {
	enabled: boolean;
	hideoutContainers: HideoutContainers;
	fasterBitcoinFarming: FasterBitcoinFarming;
	fasterCraftingTime: FasterCraftingTime;
	fasterHideoutConstruction: FasterHideoutConstruction;
	fuelConsumption: FuelConsumption;
	scavCaseOptions: ScavCaseOptions;
	allowGymTrainingWithMusclePain?: boolean;
	disableFIRHideout?: boolean;
}

export interface StashOptions {
	enabled: boolean;
	progressiveStash: boolean;
	biggerStash: boolean;
	lessCurrencyForConstruction: boolean;
	easierLoyalty: boolean;
	currencyRequirementMultiplier?: number;
}

export interface HideoutContainers {
	enabled: boolean
	biggerHideoutContainers: boolean
	siccCaseBuff: boolean
}

export interface FasterBitcoinFarming {
	enabled: boolean;
	bitcoinPrice?: number;
	baseBitcoinTimeMultiplier: number;
	gpuEfficiency: number;
}

export interface FasterCraftingTime {
	enabled: boolean
	baseCraftingTimeMultiplier: number
	hideoutSkillExpFix: HideoutSkillExpFix
	fasterMoonshineProduction: FasterProduction
	fasterPurifiedWaterProduction: FasterProduction
	fasterCultistCircle: FasterProduction
}

export interface FasterProduction {
	enabled: boolean
	baseCraftingTimeMultiplier: number
}

export interface HideoutSkillExpFix {
	enabled: boolean
	hideoutSkillExpMultiplier: number
}

export interface FasterHideoutConstruction {
	enabled: boolean
	hideoutConstructionTimeMultiplier: number
}

export interface FuelConsumption {
	enabled: boolean
	fuelConsumptionMultiplier: number
}

export interface ScavCaseOptions {
	enabled: boolean
	betterRewards: boolean
	fasterScavcase: FasterScavcase
	rebalance: boolean
}

export interface FasterScavcase {
	enabled: boolean
	speedMultiplier: number
}
export interface EconomyOptions {
	enabled: boolean;
	disableFleaMarketCompletely: boolean;
	priceRebalance: PriceRebalance;
	pacifistFleaMarket: PacifistFleaMarket;
	barterEconomy: BarterEconomy;
	otherFleaMarketChanges: OtherFleaMarketChanges;
}

export interface PriceRebalance {
	enabled: boolean
	itemFixes: boolean
}

export interface PacifistFleaMarket {
	enabled: boolean
	whitelist: EconomyToggles
	questKeys: EconomyToggles
	markedKeys: EconomyToggles
}

export interface EconomyToggles {
	enabled: boolean
	priceMultiplier: number
}

export interface BarterEconomy {
	enabled: boolean;
	cashOffersPercentage: number;
	barterPriceVariance: number;
	offerItemCount: { min: number; max: number };
	nonStackableCount: { min: number; max: number };
	itemCountMax: number;
	unbanBitcoinsForBarters?: boolean;
}

export interface OtherFleaMarketChanges {
	enabled: boolean
	sellingOnFlea: boolean
	fleaMarketOpenAtLevel: number
	fleaPricesIncreased: number
	fleaPristineItems: boolean
	onlyFoundInRaidItemsAllowedForBarters: boolean
}

export interface TraderChanges {
	enabled: boolean
	betterSalesToTraders: boolean
	alternativeCategories: boolean
	pacifistFence: PacifistFence
	reasonablyPricedCases: boolean
	skierUsesEuros: boolean
	biggerLimits: { enabled: boolean; multiplier: number }
}

export interface PacifistFence {
	enabled: boolean
	numberOfFenceOffers: number
}

export interface CraftingChanges {
	enabled: boolean;
	craftingRebalance: boolean;
	additionalCraftingRecipes: boolean;
}

export interface FasterCraftingTime {
	enabled: boolean;
	baseCraftingTimeMultiplier: number;
	hideoutSkillExpFix: HideoutSkillExpFix;
	fasterMoonshineProduction: FasterProduction;
	fasterPurifiedWaterProduction: FasterProduction;
	fasterCultistCircle: FasterProduction;
}

export interface FasterProduction {
	enabled: boolean;
	baseCraftingTimeMultiplier: number;
}

export interface HideoutSkillExpFix {
	enabled: boolean;
	hideoutSkillExpMultiplier: number;
}


export interface InsuranceChanges {
	enabled: boolean;
	/**
	 * Per-trader insurance settings. Each trader can have their own return chance and price coefficient.
	 */
	traderInsuranceConfig?: {
		fence: TraderInsuranceConfigValues;
		prapor: TraderInsuranceConfigValues;
		therapist: TraderInsuranceConfigValues;
	};
}

export interface TraderInsuranceConfigValues {
	/** Chance (percent) to get items back from insurance */
	returnChancePercent: number;
	/** Price coefficient for insurance */
	insurancePriceCoef: number;
}

export interface TraderInsuranceChanges {
	enabled: boolean
	returnChance: number
	returnTime: { min: number; max: number }
	insuranceCostPercentage: number
}

export interface OtherTweaks {
	enabled: boolean
	skillExpBuffs: boolean
	signalPistolInSpecialSlots: boolean
	unexaminedItemsAreBack: boolean
	fasterExamineTime: boolean
	removeBackpackRestrictions: boolean
	removeDiscardLimit: boolean
	reshalaAlwaysHasGoldenTT: boolean
	biggerAmmoStacks: BiggerAmmoStacks
	questChanges: boolean
	removeRaidItemLimits: boolean
	biggerCurrencyStacks: boolean
	currencyStackSizes?: {
		euros?: number;
		dollars?: number;
		gpcoin?: number;
		roubles?: number;
	};
	smallContainersInSpecialSlots: boolean
}

export interface BiggerAmmoStacks {
	enabled: boolean
	stackMultiplier: number
	botAmmoStackFix: boolean
}
