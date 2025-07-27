import { PrefixLogger } from "../util/PrefixLogger";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
// import { IInsuranceConfig } from "@spt/models/spt/config/IInsuranceConfig";
import { InsuranceChanges } from "../types";

// Use the runtime insurance config type from the database
type IInsurance = any;

export class InsuranceChanger {
    private logger: PrefixLogger;
    private tables: IDatabaseTables;
    private insuranceConfig: IInsurance;

    constructor(logger: PrefixLogger, tables: IDatabaseTables, insuranceConfig: IInsurance) {
        this.logger = logger;
        this.tables = tables;
        this.insuranceConfig = insuranceConfig;
    }

    public applyInsuranceChanges(config: InsuranceChanges): void {
        if (!this.tables.traders) {
            this.logger.error("InsuranceChanger: Traders table not found in database tables.");
            return;
        }
        const prapor = this.tables.traders["54cb50c76803fa8b248b4571"];
        const therapist = this.tables.traders["54cb57776803fa99248b456e"];
        const fence = this.tables.traders["579dc571d53a0658a154fbec"];

        if (!prapor || !therapist || !fence) {
            this.logger.error("InsuranceChanger: One or more required traders (Prapor, Therapist, Fence) not found in database tables.");
            return;
        }

        try {
            // Set static insurance times
            fence.base.insurance.min_return_hour = 0;
            fence.base.insurance.max_return_hour = 0;
            fence.base.insurance.max_storage_time = 720;
            prapor.base.insurance.min_return_hour = 0;
            prapor.base.insurance.max_return_hour = 0;
            prapor.base.insurance.max_storage_time = 720;
            therapist.base.insurance.min_return_hour = 0;
            therapist.base.insurance.max_return_hour = 0;
            therapist.base.insurance.max_storage_time = 720;

            // Use config values for returnChancePercent and insurance_price_coef
            const insuranceConfig = config.traderInsuranceConfig || {
                fence: { returnChancePercent: 95, insurancePriceCoef: 45 },
                prapor: { returnChancePercent: 80, insurancePriceCoef: 27 },
                therapist: { returnChancePercent: 50, insurancePriceCoef: 15 }
            };


            // Ensure returnChancePercent is initialized
            if (!this.insuranceConfig.returnChancePercent) {
                this.insuranceConfig.returnChancePercent = {};
            }
            this.insuranceConfig.returnChancePercent["579dc571d53a0658a154fbec"] = insuranceConfig.fence.returnChancePercent;
            this.insuranceConfig.returnChancePercent["54cb50c76803fa8b248b4571"] = insuranceConfig.prapor.returnChancePercent;
            this.insuranceConfig.returnChancePercent["54cb57776803fa99248b456e"] = insuranceConfig.therapist.returnChancePercent;

            for (const loyaltyLevelID in fence.base.loyaltyLevels) {
                fence.base.loyaltyLevels[loyaltyLevelID].insurance_price_coef = insuranceConfig.fence.insurancePriceCoef;
            }
            for (const loyaltyLevelID in prapor.base.loyaltyLevels) {
                prapor.base.loyaltyLevels[loyaltyLevelID].insurance_price_coef = insuranceConfig.prapor.insurancePriceCoef;
            }
            for (const loyaltyLevelID in therapist.base.loyaltyLevels) {
                therapist.base.loyaltyLevels[loyaltyLevelID].insurance_price_coef = insuranceConfig.therapist.insurancePriceCoef;
            }
        } catch (error: unknown) {
            this.logger.warning("InsuranceChanger: InsuranceChanges failed.");
            if (error instanceof Error) {
                this.logger.error(error.stack || error.message);
            } else {
                this.logger.error(String(error));
            }
        }
    }
}
