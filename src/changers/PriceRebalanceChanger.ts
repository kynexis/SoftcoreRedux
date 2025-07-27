import { DependencyContainer } from "tsyringe";
import { PriceRebalance } from "../types";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { PrefixLogger } from "../util/PrefixLogger";
import { HandbookHelper } from "@spt/helpers/HandbookHelper";
import { ItemTpl } from "@spt/models/enums/ItemTpl"

export class PriceRebalanceChanger {
    private logger: PrefixLogger;
    private tables: IDatabaseTables;
    private handbookHelper: HandbookHelper;

    constructor(container: DependencyContainer) {
        this.logger = PrefixLogger.getInstance();
        const databaseServer = container.resolve<any>("DatabaseServer");
        this.tables = databaseServer.getTables();
        this.handbookHelper = container.resolve<HandbookHelper>("HandbookHelper");
    }

    public apply(config: PriceRebalance) {
        if (!config.enabled) {
            return;
        }

        try {
            if (config.itemFixes) {
                this.doItemFixes();
            }
        } catch (error) {
            this.logger.warning("PriceRebalance: doItemFixes failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }

        try {
            this.doPriceRebalance();
        } catch (error) {
            this.logger.warning("PriceRebalance: doPriceRebalance failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }
    }

    private doItemFixes() {
        const itemsToFix: Record<string, number> = {
            [ItemTpl.VISORS_ROUND_FRAME_SUNGLASSES]: 3084 * 5,
            [ItemTpl.AMMO_40MMRU_VOG25]: 6750 * 5,
            [ItemTpl.VISORS_ANTIFRAGMENTATION_GLASSES]: 2181 * 2,
            [ItemTpl.BACKPACK_LOLKEK_3F_TRANSFER_TOURIST]: 18000 * 2,
            [ItemTpl.FOOD_EMELYA_RYE_CROUTONS]: 1500,
            [ItemTpl.FOOD_RYE_CROUTONS]: 2000,
            [ItemTpl.INFO_INTELLIGENCE_FOLDER]: 588000,
            [ItemTpl.INFO_MILITARY_FLASH_DRIVE]: 224400,
            "67449b6c89d5e1ddc603f504": 32524 * 20, // Skier contraband case key

            // Miscellaneous Balance Fixes
            [ItemTpl.KEYCARD_TERRAGROUP_LABS_ACCESS]: 157000,
            [ItemTpl.KEYCARD_TERRAGROUP_LABS_KEYCARD_VIOLET]: 624963,
            [ItemTpl.KEYCARD_TERRAGROUP_LABS_KEYCARD_GREEN]: 1884025,
            [ItemTpl.KEYCARD_TERRAGROUP_LABS_KEYCARD_RED]: 1633152,
            [ItemTpl.KEYCARD_TERRAGROUP_LABS_KEYCARD_BLUE]: 1119502,
            [ItemTpl.KEYCARD_TERRAGROUP_LABS_KEYCARD_YELLOW]: 1756373,
            [ItemTpl.KEYCARD_TERRAGROUP_LABS_KEYCARD_BLACK]: 1934463,
            [ItemTpl.KNIFE_CRASH_AXE]: 785496,
            [ItemTpl.KNIFE_RED_REBEL_ICE_PICK]: 1319516,
            [ItemTpl.KEY_RBPKPM_MARKED]: 2249301,
            [ItemTpl.KEY_RBVO_MARKED]: 3084927,
            [ItemTpl.KEY_RBBK_MARKED]: 3604434,
            [ItemTpl.KEY_ABANDONED_FACTORY_MARKED]: 3244026,
            [ItemTpl.KEY_DORM_ROOM_314_MARKED]: 4322904,
            [ItemTpl.KEY_MYSTERIOUS_ROOM_MARKED]: 1865236,
        };

        for (const [itemTpl, price] of Object.entries(itemsToFix)) {
            const item = this.tables.templates!.handbook.Items.find((item) => item.Id === itemTpl);
            if (!item) {
                this.logger.error(`Item ${itemTpl} not found in handbook`);
                continue;
            }
            item.Price = price;
        }

        this.handbookHelper.hydrateLookup();
    }

    private doPriceRebalance() {
        const handbookItems = this.tables.templates!.handbook.Items;
        const fleaPrices = this.tables.templates!.prices;
        for (const item of handbookItems) {
            fleaPrices[item.Id] = item.Price;
        }
    }
}
