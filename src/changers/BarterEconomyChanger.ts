import { DependencyContainer } from "tsyringe";
import { BarterEconomy } from "../types";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { PrefixLogger } from "../util/PrefixLogger";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { IRagfairConfig } from "@spt/models/spt/config/IRagfairConfig";
import { fleaBarterRequestWhitelist, requestWhitelist, BSGblacklist } from "../assets/fleamarket";
import { IItemConfig } from "@spt/models/spt/config/IItemConfig";
import { BaseClasses } from "@spt/models/enums/BaseClasses";
import { ItemHelper } from "@spt/helpers/ItemHelper";

export class BarterEconomyChanger {
    private logger: PrefixLogger;
    private tables: IDatabaseTables;
    private ragfairConfig: IRagfairConfig;
    private itemconfig: IItemConfig;
    private itemHelper: ItemHelper;

    constructor(container: DependencyContainer) {
        this.logger = PrefixLogger.getInstance();
        const databaseServer = container.resolve<any>("DatabaseServer");
        const configServer = container.resolve<any>("ConfigServer");
        this.itemHelper = container.resolve<ItemHelper>("ItemHelper");
        this.tables = databaseServer.getTables();
        this.ragfairConfig = configServer.getConfig<IRagfairConfig>(ConfigTypes.RAGFAIR);
        this.itemconfig = configServer.getConfig<IItemConfig>(ConfigTypes.ITEM);
    }

    public apply(config: BarterEconomy) {
        if (!config.enabled) {
            return;
        }

        try {
            this.doBarterEconomy();
        } catch (error) {
            this.logger.warning("BarterEconomy: doBarterEconomy failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }

        try {
            this.adjustCashOffers(config.cashOffersPercentage);
        } catch (error) {
            this.logger.warning("BarterEconomy: adjustCashOffers failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }

        try {
            this.adjustBarterPriceVariance(config.barterPriceVariance);
        } catch (error) {
            this.logger.warning("BarterEconomy: adjustBarterPriceVariance failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }

        try {
            this.adjustItemCountMax(config.itemCountMax);
        } catch (error) {
            this.logger.warning("BarterEconomy: adjustItemCountMax failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }

        try {
            this.adjustOfferItemCount(config.offerItemCount);
        } catch (error) {
            this.logger.warning("BarterEconomy: adjustOfferItemCount failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }

        try {
            this.adjustNonStackableAmount(config.nonStackableCount);
        } catch (error) {
            this.logger.warning("BarterEconomy: adjustNonStackableAmount failed gracefully. Send bug report. Continue safely.");
            console.log(error);
        }
    }

    private doBarterEconomy() {
        const locale = this.tables.locales?.global.en;
        const barterBlacklist = Object.values(BaseClasses).filter((baseClass) => !fleaBarterRequestWhitelist.includes(baseClass)) as string[];
        this.ragfairConfig.dynamic.barter.itemTypeBlacklist = barterBlacklist;
        this.ragfairConfig.dynamic.barter.minRoubleCostToBecomeBarter = 100;

        const items = this.tables.templates?.items;
        if (!items) {
            this.logger.warning("BarterEconomyChanger: doBarterEconomy: Handbook not found, skipping price adjust");
            return;
        }

        const fleaPrices = this.tables.templates?.prices;
        if (!fleaPrices) {
            this.logger.warning("BarterEconomyChanger: doBarterEconomy: tables.templates.prices not found");
            return;
        }

        for (const item in items) {
            if (
                items[item]._type === "Item" &&
                !this.itemHelper.isOfBaseclasses(item, this.ragfairConfig.dynamic.barter.itemTypeBlacklist) &&
                items[item]._parent !== BaseClasses.MONEY
            ) {
                if (items[item]._props.QuestItem === true) {
                    fleaPrices[item] = 0;
                } else if (!items[item]._props.CanSellOnRagfair) {
                    fleaPrices[item] = 0;
                } else {
                    if (BSGblacklist.includes(item) && items[item]._props.CanSellOnRagfair === true) {
                        this.logger.warning(`Item ${locale?.[`${item} Name`]} can be bought on flea, don't use BSG blacklist unlockers with Barter Economy enabled!`);
                    }
                }
            }
        }

        for (const item in requestWhitelist) {
            fleaPrices[item] = requestWhitelist[item];
        }
    }

    private adjustCashOffers(cashOffersPercentage: number) {
        this.ragfairConfig.dynamic.barter.chancePercent = 100 - cashOffersPercentage;
    }

    private adjustBarterPriceVariance(barterPriceVariance: number) {
        this.ragfairConfig.dynamic.barter.priceRangeVariancePercent = barterPriceVariance;
    }

    private adjustItemCountMax(itemCountMax: number) {
        this.ragfairConfig.dynamic.barter.itemCountMax = itemCountMax;
    }

    private adjustOfferItemCount(minMaxRecord: { min: number; max: number }) {
        this.ragfairConfig.dynamic.offerItemCount = minMaxRecord;
    }

    private adjustNonStackableAmount(minMaxRecord: { min: number; max: number }) {
        this.ragfairConfig.dynamic.nonStackableCount = minMaxRecord;
    }
}
