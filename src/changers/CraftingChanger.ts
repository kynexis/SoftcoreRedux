import { DependencyContainer } from "tsyringe";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { PrefixLogger } from "../util/PrefixLogger";
import { HideoutAreas } from "@spt/models/enums/HideoutAreas";
import { ItemTpl } from "@spt/models/enums/ItemTpl";
import { craftingAdjustments } from "../assets/productionAdjustments";
import { IHideoutProduction } from "@spt/models/eft/hideout/IHideoutProduction";
import { additionalCraftingRecipes } from "../assets/recipes";
import { IHideoutConfig } from "@spt/models/spt/config/IHideoutConfig";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";

export class CraftingChanger {
    private logger: PrefixLogger;
    private tables: IDatabaseTables;
    private hideoutConfig: IHideoutConfig;

    constructor(container: DependencyContainer) {
        this.logger = PrefixLogger.getInstance();
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        this.tables = databaseServer.getTables();
        const configServer = container.resolve<ConfigServer>("ConfigServer");
        this.hideoutConfig = configServer.getConfig<IHideoutConfig>(ConfigTypes.HIDEOUT);
    }

    // --- Crafting Rebalance ---
    public doCraftingRebalance() {
        for (const adjustment of craftingAdjustments) {
            const craft = this.getCraftByEndProduct(adjustment.id) as IHideoutProduction;
            if (!craft) {
                this.logger.warning(`CraftingChanger: doCraftingRebalance: craft not found, skipping ${adjustment.id}`);
                continue;
            }
            adjustment.adjust(craft);
        }
    }

    public getCraftByEndProduct(endProductID: ItemTpl) {
        return this.tables.hideout?.production.recipes.find(
            (production) => production.endProduct === endProductID && production.areaType !== HideoutAreas.CHRISTMAS_TREE
        );
    }

    // --- Additional Crafting Recipes ---
    public doAdditionalCraftingRecipes() {
        this.tables.hideout?.production.recipes.push(...additionalCraftingRecipes);
    }

    // --- Faster Crafting Time ---
    public doFasterProductionFor(itemTpl: ItemTpl, multiplier: number) {
        const hideout = this.tables.hideout;
        const productionsForItem = hideout!.production.recipes.filter((prod) => prod.endProduct === itemTpl);
        if (!productionsForItem) {
            this.logger.warning(`CraftingChanger: doFasterProduction: productions for item ${itemTpl} not found, skipping`);
            return;
        }
        for (const production of productionsForItem) {
            production.productionTime = Math.ceil(production.productionTime / multiplier);
        }
    }

    public doFasterProductionForAll(multiplier: number) {
        const exclude = [
            ItemTpl.BARTER_PHYSICAL_BITCOIN,
            ItemTpl.DRINK_BOTTLE_OF_FIERCE_HATCHLING_MOONSHINE,
            ItemTpl.DRINK_CANISTER_WITH_PURIFIED_WATER,
        ] as string[];
        const hideout = this.tables.hideout;
        for (const production of hideout!.production.recipes) {
            if (!exclude.includes(production.endProduct)) {
                production.productionTime = Math.ceil(production.productionTime / multiplier);
            }
        }
    }

    public doHideoutSkillExpFix(multiplier: number) {
        this.hideoutConfig.hoursForSkillCrafting /= multiplier;
    }

    public doFasterCultistCircle(multiplier: number) {
        this.hideoutConfig.cultistCircle.hideoutTaskRewardTimeSeconds = Math.ceil(this.hideoutConfig.cultistCircle.hideoutTaskRewardTimeSeconds / multiplier);
        for (const craft of this.hideoutConfig.cultistCircle.craftTimeThreshholds) {
            craft.craftTimeSeconds = Math.ceil(craft.craftTimeSeconds / multiplier);
        }
        for (const craft of this.hideoutConfig.cultistCircle.directRewards) {
            craft.craftTimeSeconds = Math.ceil(craft.craftTimeSeconds / multiplier);
        }
    }
}
