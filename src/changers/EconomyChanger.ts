import { EconomyOptions } from "../types";
import { DependencyContainer } from "tsyringe";
import { PriceRebalanceChanger } from "./PriceRebalanceChanger";
import { PacifistFleaMarketChanger } from "./PacifistFleaMarketChanger";
import { BarterEconomyChanger } from "./BarterEconomyChanger";
import { OtherFleaMarketChangesChanger } from "./OtherFleaMarketChangesChanger";
import { PrefixLogger } from "../util/PrefixLogger";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { ItemTpl } from "@spt/models/enums/ItemTpl";

export class EconomyChanger {
    private container: DependencyContainer;
    private logger: PrefixLogger;
    private tables: IDatabaseTables;

    constructor(container: DependencyContainer) {
        this.container = container;
        this.logger = PrefixLogger.getInstance();
        const databaseServer = container.resolve<any>("DatabaseServer");
        this.tables = databaseServer.getTables();
    }

    public apply(config: EconomyOptions & { fasterBitcoinFarming?: any }): void {
        if (!config.enabled) {
            this.logger.info("EconomyChanger: Economy options are disabled.");
            return;
        }

        try {
            if (config.fasterBitcoinFarming?.enabled) {
                this.logger.info("EconomyChanger: Applying faster bitcoin farming changes.");
                this.doFasterBitcoinFarming(
                    config.fasterBitcoinFarming.baseBitcoinTimeMultiplier,
                    config.fasterBitcoinFarming.gpuEfficiency
                );
                if (typeof config.fasterBitcoinFarming.bitcoinPrice === "number") {
                    this.setBitcoinPrice(config.fasterBitcoinFarming.bitcoinPrice);
                }
            }
        } catch (error) {
            this.logger.warning("EconomyChanger: FasterBitcoinFarming logic failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }

        try {
            if (config.disableFleaMarketCompletely) {
                this.logger.info("EconomyChanger: Disabling flea market completely.");
                this.doDisableFleaMarketCompletely();
                return;
            }
        } catch (error) {
            this.logger.warning("EconomyChanger: Error disabling flea market completely. Send bug report. Continue safely.");
            console.warn(error);
        }

        try {
            if (config.priceRebalance?.enabled) {
                this.logger.info("EconomyChanger: Applying price rebalance changes.");
                new PriceRebalanceChanger(this.container).apply(config.priceRebalance);
            }
        } catch (error) {
            this.logger.warning("EconomyChanger: PriceRebalanceChanger failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }

        try {
            if (config.pacifistFleaMarket?.enabled) {
                this.logger.info("EconomyChanger: Applying pacifist flea market changes.");
                new PacifistFleaMarketChanger(this.container).apply(config.pacifistFleaMarket);
            }
        } catch (error) {
            this.logger.warning("EconomyChanger: PacifistFleaMarketChanger failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }

        try {
            if (config.barterEconomy?.enabled) {
                this.logger.info("EconomyChanger: Applying barter economy changes.");
                new BarterEconomyChanger(this.container).apply(config.barterEconomy);
            }
        } catch (error) {
            this.logger.warning("EconomyChanger: BarterEconomyChanger failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }

        try {
            if (config.otherFleaMarketChanges?.enabled) {
                this.logger.info("EconomyChanger: Applying other flea market changes.");
                new OtherFleaMarketChangesChanger(this.container).apply(config.otherFleaMarketChanges);
                this.updateRagfairMinUserLevel(config.otherFleaMarketChanges.fleaMarketOpenAtLevel);
            }
        } catch (error) {
            this.logger.warning("EconomyChanger: OtherFleaMarketChangesChanger failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }
    }

    private doFasterBitcoinFarming(baseBitcoinTimeMultiplier: number, gpuEfficiency: number) {
        const hideout = this.tables.hideout;
        const bitcoinProductions = hideout!.production.recipes.filter((production: any) => production.endProduct === ItemTpl.BARTER_PHYSICAL_BITCOIN);

        for (const prod of bitcoinProductions) {
            prod.productionTime = Math.round(prod.productionTime / baseBitcoinTimeMultiplier);
        }

        hideout!.settings.gpuBoostRate = gpuEfficiency;
    }

    private setBitcoinPrice(price: number = 100000) {
        const bitcoinHandbook = this.tables.templates?.handbook.Items.find((item: any) => item.Id === ItemTpl.BARTER_PHYSICAL_BITCOIN);
        if (bitcoinHandbook) {
            bitcoinHandbook.Price = price;
        }
    }

    private doDisableFleaMarketCompletely() {
        this.updateRagfairMinUserLevel(99);
    }

    private updateRagfairMinUserLevel(level: number) {
        const globals = this.tables.globals;
        globals!.config.RagFair.minUserLevel = level;
    }
}
