import { DependencyContainer } from "tsyringe";
import { CraftingChanges } from "../types";
import { FasterCraftingTime } from "../types";
import { PrefixLogger } from "../util/PrefixLogger";
import { CraftingChanger } from "./CraftingChanger";

export class CraftingOptionsChanger {
    private logger: PrefixLogger;
    private craftingChanger: CraftingChanger;

    constructor(container: DependencyContainer) {
        this.logger = PrefixLogger.getInstance();
        this.craftingChanger = new CraftingChanger(container);
    }

    public applyCraftingChanges(config: CraftingChanges) {
        if (!config.enabled) {
            return;
        }
        try {
            if (config.craftingRebalance) {
                this.craftingChanger.doCraftingRebalance();
            }
        } catch (error) {
            this.logger.warning("CraftingOptionsChanger: doCraftingRebalance failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }
        try {
            if (config.additionalCraftingRecipes) {
                this.craftingChanger.doAdditionalCraftingRecipes();
            }
        } catch (error) {
            this.logger.warning("CraftingOptionsChanger: doAdditionalCraftingRecipes failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }
    }

    public applyFasterCraftingTime(config: FasterCraftingTime) {
        if (!config.enabled) {
            return;
        }
        try {
            this.craftingChanger.doFasterProductionForAll(config.baseCraftingTimeMultiplier);
        } catch (error) {
            this.logger.warning("CraftingOptionsChanger: doFasterProductionForAll failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }
        try {
            if (config.hideoutSkillExpFix.enabled) {
                this.craftingChanger.doHideoutSkillExpFix(config.hideoutSkillExpFix.hideoutSkillExpMultiplier);
            }
        } catch (error) {
            this.logger.warning("CraftingOptionsChanger: doHideoutSkillExpFix failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }
        try {
            if (config.fasterMoonshineProduction.enabled) {
                this.craftingChanger.doFasterProductionFor("DRINK_BOTTLE_OF_FIERCE_HATCHLING_MOONSHINE", config.fasterMoonshineProduction.baseCraftingTimeMultiplier);
            }
        } catch (error) {
            this.logger.warning("CraftingOptionsChanger: doFasterProductionFor DRINK_BOTTLE_OF_FIERCE_HATCHLING_MOONSHINE failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }
        try {
            if (config.fasterPurifiedWaterProduction.enabled) {
                this.craftingChanger.doFasterProductionFor("DRINK_CANISTER_WITH_PURIFIED_WATER", config.fasterPurifiedWaterProduction.baseCraftingTimeMultiplier);
            }
        } catch (error) {
            this.logger.warning("CraftingOptionsChanger: doFasterProductionFor DRINK_CANISTER_WITH_PURIFIED_WATER failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }
        try {
            if (config.fasterCultistCircle.enabled) {
                this.craftingChanger.doFasterCultistCircle(config.fasterCultistCircle.baseCraftingTimeMultiplier);
            }
        } catch (error) {
            this.logger.warning("CraftingOptionsChanger: doFasterCultistCircle failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }
    }
}
