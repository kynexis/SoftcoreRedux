import { StashOptions } from "../types";

import { PrefixLogger } from "../util/PrefixLogger";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { ItemTpl } from "@spt/models/enums/ItemTpl";
import { HideoutAreas } from "@spt/models/enums/HideoutAreas";
import { IProfileSides } from "@spt/models/eft/common/tables/IProfileTemplate";
import { Money } from "@spt/models/enums/Money";


export class StashChanger {
    private logger: PrefixLogger;
    private tables: IDatabaseTables;
    private items: Record<string, any>;

    constructor(logger: PrefixLogger, tables: IDatabaseTables) {
        this.logger = logger;
        this.tables = tables;
        if (!tables.templates || !tables.templates.items) {
            this.logger.error("StashChanger: templates or templates.items not found in database tables.");
            this.items = {};
        } else {
            this.items = tables.templates.items;
        }
    }

    public apply(config: StashOptions): void {
        if (!config) {
            return;
        }
        try {
            if (config.biggerStash) {
                this.doBiggerStash();
            }
        } catch (error) {
            this.logger.warning("StashChanger: doBiggerStash failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }
        try {
            if (config.progressiveStash) {
                this.doProgressiveStash();
            }
        } catch (error) {
            this.logger.warning("StashChanger: doProgressiveStash failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }
        try {
            if (config.lessCurrencyForConstruction) {
                this.doLessCurrencyForConstruction(config);
            }
        } catch (error) {
            this.logger.warning("StashChanger: doLessCurrencyForConstruction failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }
        try {
            if (config.easierLoyalty) {
                this.doEasierLoyalty();
            }
        } catch (error) {
            this.logger.warning("StashChanger: doEasierLoyalty failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }
    }

    public doEasierLoyalty(): void {
        if (!this.tables.hideout || !this.tables.hideout.areas) {
            this.logger.error("StashChanger: hideout or hideout.areas not found in database tables.");
            return;
        }
        const hideoutStashStages = this.tables.hideout.areas.find((area) => area.type === HideoutAreas.STASH)?.stages;
        if (!hideoutStashStages) return;
        for (const [, stageRaw] of Object.entries(hideoutStashStages)) {
            const stage = stageRaw as { requirements: any[] };
            const loyaltylevels = stage.requirements.filter((req) => req.loyaltyLevel !== undefined);
            for (const loyaltyLevel of loyaltylevels) {
                if (loyaltyLevel.loyaltyLevel !== undefined) {
                    loyaltyLevel.loyaltyLevel -= 1;
                }
            }
        }
    }

    public doBiggerStash(): void {
        const stashUpdates: Record<string, number> = {
            [ItemTpl.STASH_STANDARD_STASH_10X30]: 50,
            [ItemTpl.STASH_LEFT_BEHIND_STASH_10X40]: 100,
            [ItemTpl.STASH_PREPARE_FOR_ESCAPE_STASH_10X50]: 150,
            [ItemTpl.STASH_EDGE_OF_DARKNESS_STASH_10X68]: 200,
            [ItemTpl.STASH_THE_UNHEARD_EDITION_STASH_10X72]: 250,
        };

        for (const [itemTpl, stashSize] of Object.entries(stashUpdates)) {
            const stashItem = this.items[itemTpl];
            if (stashItem?._props?.Grids?.[0]?._props) {
                stashItem._props.Grids[0]._props.cellsV = stashSize;
            } else {
                this.logger.warning(`HideoutOptions: doBiggerStash: Failed to modify stash with Tpl ${itemTpl}, skipping`);
            }
        }
    }

    public doProgressiveStash(): void {
        if (!this.tables.templates || !this.tables.templates.profiles) {
            this.logger.error("StashChanger: templates or templates.profiles not found in database tables.");
            return;
        }
        const profileTemplates = this.tables.templates.profiles;
        const basicStashBonuses = {
            id: "64f5b9e5fa34f11b380756c0",
            templateId: ItemTpl.STASH_STANDARD_STASH_10X30,
            type: "StashSize",
        };
        const startingStashes = [
            ItemTpl.STASH_STANDARD_STASH_10X30,
            ItemTpl.STASH_LEFT_BEHIND_STASH_10X40,
            ItemTpl.STASH_PREPARE_FOR_ESCAPE_STASH_10X50,
            ItemTpl.STASH_EDGE_OF_DARKNESS_STASH_10X68,
            ItemTpl.STASH_THE_UNHEARD_EDITION_STASH_10X72,
        ];
        for (const [profile, profileVal] of Object.entries(profileTemplates)) {
            if (typeof profileVal !== "object" || profileVal === null) continue;
            for (const sidekey of Object.keys(profileVal) as (keyof IProfileSides)[]) {
                if (sidekey === "descriptionLocaleKey") {
                    continue;
                }
                const side = (profileVal as any)[sidekey];
                const hideoutArea = side.character.Hideout?.Areas.find((area: any) => area.type === HideoutAreas.STASH);
                if (!hideoutArea) {
                    this.logger.warning(`HideoutOptionsChanger: doProgressiveStash: hideoutArea for profile ${profileVal} not found`);
                    continue;
                }
                hideoutArea.level = 1;
                const startingStashItems = side.character.Inventory.items.filter((item: any) => startingStashes.includes(item._tpl));
                for (const item of startingStashItems) {
                    item._tpl = ItemTpl.STASH_STANDARD_STASH_10X30;
                }
                side.character.Bonuses = side.character.Bonuses.filter((x: any) => x.type !== "StashSize");
                side.character.Bonuses.push(basicStashBonuses);
            }
        }
    }

    public doLessCurrencyForConstruction(config?: StashOptions): void {
        if (!this.tables.hideout || !this.tables.hideout.areas) {
            this.logger.error("StashChanger: hideout or hideout.areas not found in database tables.");
            return;
        }
        const multiplier = config?.currencyRequirementMultiplier ?? 0.1;
        const hideoutStashStages2 = this.tables.hideout.areas.find((area) => area.type === HideoutAreas.STASH)?.stages;
        if (!hideoutStashStages2) return;
        for (const [, stageRaw] of Object.entries(hideoutStashStages2)) {
            const stage = stageRaw as { requirements: any[] };
            const currencyRequirements = stage.requirements.filter((req) => req.templateId === Money.ROUBLES || req.templateId === Money.EUROS);
            for (const currencyRequirement of currencyRequirements) {
                if (currencyRequirement.count) {
                    currencyRequirement.count *= multiplier;
                }
            }
        }
    }
}
