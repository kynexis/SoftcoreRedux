import { DependencyContainer } from "tsyringe";
import { PacifistFleaMarket } from "../types";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { PrefixLogger } from "../util/PrefixLogger";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { IRagfairConfig } from "@spt/models/spt/config/IRagfairConfig";
import { fleaListingsWhitelistHandBook, whitelist } from "../assets/fleamarket";

export class PacifistFleaMarketChanger {
    private logger: PrefixLogger;
    private tables: IDatabaseTables;
    private ragfairConfig: IRagfairConfig;

    constructor(container: DependencyContainer) {
        this.logger = PrefixLogger.getInstance();
        const databaseServer = container.resolve<any>("DatabaseServer");
        const configServer = container.resolve<any>("ConfigServer");
        this.tables = databaseServer.getTables();
        // getConfig is untyped, so cast the result instead of using a type argument
        this.ragfairConfig = configServer.getConfig(ConfigTypes.RAGFAIR) as IRagfairConfig;
    }

    public apply(config: PacifistFleaMarket) {
        if (!config.enabled) {
            return;
        }

        try {
            this.pacifistFleaMarket();
        } catch (error) {
            this.logger.warning("PacifistFleaMarket: pacifistFleaMarket failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }

        try {
            if (config.whitelist.enabled) {
                this.allowOnRagfair(whitelist, config.whitelist.priceMultiplier);
            }
        } catch (error) {
            this.logger.warning("PacifistFleaMarket: allowOnRagfair whitelist failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }
    }

    private pacifistFleaMarket() {
        const handbookItems = this.tables.templates?.handbook.Items;
        const items = this.tables.templates?.items;
        if (!handbookItems || !items) {
            this.logger.warning("PacifistFleaMarket: handbookItems or items table not found");
            return;
        }
        for (const handbookItem of handbookItems) {
            const itemID = handbookItem.Id;
            if (
                !fleaListingsWhitelistHandBook.includes(handbookItem.ParentId) ||
                items[itemID]._props.QuestItem
            ) {
                this.ragfairConfig.dynamic.blacklist.custom.push(itemID);
            }
        }
    }

    private allowOnRagfair(whitelistArr: string[], priceMultiplier: number) {
        const items = this.tables.templates!.items;
        const prices = this.tables.templates!.prices;
        for (const itemID of whitelistArr) {
            const item = items[itemID];
            if (!item) {
                this.logger.warning(`PacifistFleaMarket: adjustedSellableOnRagfair: item ${itemID} not found, skipping`);
                continue;
            }
            prices[itemID] = Math.round(prices[itemID] * priceMultiplier);
            item._props.CanSellOnRagfair = true;
            this.ragfairConfig.dynamic.blacklist.custom = this.ragfairConfig.dynamic.blacklist.custom.filter((x) => x !== itemID);
        }
    }
}
