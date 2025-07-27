import { DependencyContainer } from "tsyringe";
import { OtherFleaMarketChanges } from "../types";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { PrefixLogger } from "../util/PrefixLogger";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { IRagfairConfig } from "@spt/models/spt/config/IRagfairConfig";

export class OtherFleaMarketChangesChanger {
    private logger: PrefixLogger;
    private tables: IDatabaseTables;
    private ragfairConfig: IRagfairConfig;

    constructor(container: DependencyContainer) {
        this.logger = PrefixLogger.getInstance();
        const databaseServer = container.resolve<any>("DatabaseServer");
        const configServer = container.resolve<any>("ConfigServer");
        this.tables = databaseServer.getTables();
        this.ragfairConfig = configServer.getConfig<IRagfairConfig>(ConfigTypes.RAGFAIR);
    }

    public apply(config: OtherFleaMarketChanges) {
        if (!config.enabled) {
            return;
        }
        try {
            if (config.sellingOnFlea) {
                this.doSellingOnFlea();
            }
        } catch (error) {
            this.logger.warning("OtherFleaMarketChanges: doSellingOnFlea failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }

        try {
            if (config.onlyFoundInRaidItemsAllowedForBarters) {
                this.adjustOnlyFIRforBarters();
            }
        } catch (error) {
            this.logger.warning("OtherFleaMarketChanges: adjustOnlyFIRforBarters failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }

        try {
            if (config.fleaPristineItems) {
                this.adjustPristineItems();
            }
        } catch (error) {
            this.logger.warning("OtherFleaMarketChanges: adjustPristineItems failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }

        try {
            this.increaseFleaPrices(config.fleaPricesIncreased);
        } catch (error) {
            this.logger.warning("OtherFleaMarketChanges: increaseFleaPrices failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }
    }

    private doSellingOnFlea() {
        this.ragfairConfig.sell.chance.base = 0;
        this.ragfairConfig.sell.chance.maxSellChancePercent = 0;
    }

    private adjustOnlyFIRforBarters() {
        const globals = this.tables.globals;
        globals!.config.RagFair.isOnlyFoundInRaidAllowed = true;
    }

    private adjustPristineItems() {
        for (const condition of Object.values(this.ragfairConfig.dynamic.condition)) {
            condition.conditionChance = 0;
        }
    }

    private increaseFleaPrices(priceMultiplier: number) {
        this.ragfairConfig.dynamic.priceRanges.default.max *= priceMultiplier;
        this.ragfairConfig.dynamic.priceRanges.default.min *= priceMultiplier;
    }
}
