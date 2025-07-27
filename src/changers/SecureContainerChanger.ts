import { PrefixLogger } from "../util/PrefixLogger";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { ItemTpl } from "@spt/models/enums/ItemTpl";
import { IHideoutConfig } from "@spt/models/spt/config/IHideoutConfig";
import { SecureContainerOptions } from "../types";
import { containerRecipes } from "../assets/recipes";
import { Traders } from "@spt/models/enums/Traders";



export class SecureContainerChanger {
    private logger: PrefixLogger;
    private items: Record<string, any>;
    private tables: IDatabaseTables;
    private hideoutConfig?: IHideoutConfig;

    constructor(logger: PrefixLogger, tables: IDatabaseTables, hideoutConfig?: IHideoutConfig) {
        this.logger = logger;
        if (!tables.templates || !tables.templates.items) {
            this.logger.error("SecureContainerChanger: templates or templates.items not found in database tables.");
            this.items = {};
        } else {
            this.items = tables.templates.items;
        }
        this.tables = tables;
        this.hideoutConfig = hideoutConfig;
    }

    public apply(config: SecureContainerOptions): void {
        if (!config) {
            return;
        }
        if (config.biggerContainers) {
            try {
                this.doBiggerSecureContainers();
            } catch (error: unknown) {
                this.logger.warning("SecureContainerOptions: Error applying BiggerSecureContainers");
                if (error instanceof Error) {
                    this.logger.error(error.stack || error.message);
                } else {
                    this.logger.error(String(error));
                }
            }
        }
        if (config.progressiveContainers?.enabled) {
            try {
                this.doProgressiveContainers();
            } catch (error: unknown) {
                this.logger.warning("SecureContainerOptions: Error applying ProgressiveContainers");
                if (error instanceof Error) {
                    this.logger.error(error.stack || error.message);
                } else {
                    this.logger.error(String(error));
                }
            }
        }
        if (config.progressiveContainers?.collectorQuestRedone) {
            try {
                this.doCollectorQuestRedone(config.CollectorQuestLevelStart);
            } catch (error: unknown) {
                this.logger.warning("SecureContainerOptions: Error applying CollectorQuestRedone");
                if (error instanceof Error) {
                    this.logger.error(error.stack || error.message);
                } else {
                    this.logger.error(String(error));
                }
            }
        }
    }

    private doCollectorQuestRedone(collectorQuestLevelStart: number = 10) {
        if (!this.tables.templates || !this.tables.templates.quests) {
            this.logger.error("SecureContainerChanger: templates or templates.quests not found in database tables.");
            return;
        }
        const quests = this.tables.templates.quests;
        const collectorID = Object.keys(quests).find((key) => {
            return quests[key].QuestName === "Collector";
        });

        if (!collectorID) {
            this.logger.warning("SecureContainerOptions: doCollectorQuestRedone: Collector questID");
            return;
        }
        quests[collectorID].conditions.AvailableForFinish.push({
            conditionType: "HandoverItem",
            dogtagLevel: 0,
            id: "639135534b15ca31f76bc319",
            index: 69, // nice
            maxDurability: 100,
            minDurability: 0,
            parentId: "5448bf274bdc2dfc2f8b456a",
            isEncoded: false,
            onlyFoundInRaid: false,
            dynamicLocale: false,
            target: [ItemTpl.SECURE_CONTAINER_GAMMA],
            value: 2,
            visibilityConditions: [],
        });

        this.tables.locales!.global.ru["639135534b15ca31f76bc319"] = "Передать носитель"; // Russian locale fix
        // Start condition
        quests[collectorID].conditions.AvailableForStart = [
            {
                id: "51d33b2d4fad9e61441772c0",
                compareMethod: ">=",
                conditionType: "Level",
                dynamicLocale: false,
                globalQuestCounterId: "",
                index: 0,
                parentId: "",
                value: collectorQuestLevelStart,
                visibilityConditions: [],
            },
        ];
    }

    private doProgressiveContainers() {
        if (!this.tables.templates || !this.tables.templates.profiles) {
            this.logger.error("SecureContainerChanger: templates or templates.profiles not found in database tables.");
            return;
        }
        const profileTemplates = this.tables.templates.profiles as { [key: string]: any };

        for (const profileName of Object.keys(profileTemplates)) {
            const profile = profileTemplates[profileName];
            const bearContainer = profile.bear.character.Inventory.items.find((x: any) => x.slotId === "SecuredContainer");
            if (bearContainer) {
                bearContainer._tpl = ItemTpl.SECURE_WAIST_POUCH;
            }
            const usecContainer = profile.usec.character.Inventory.items.find((x: any) => x.slotId === "SecuredContainer");
            if (usecContainer) {
                usecContainer._tpl = ItemTpl.SECURE_WAIST_POUCH;
            }
        }

        const peacekeeper = this.tables.traders?.[Traders.PEACEKEEPER];
        if (peacekeeper?.assort?.items) {
            // "Remove" Beta container from Peacekeeper. Never Delete items from Assorts. This can lead to issues.
            const betaAssortUpd = peacekeeper.assort.items.find((item) => item._tpl === ItemTpl.SECURE_CONTAINER_BETA)?.upd;
            if (betaAssortUpd) {
                betaAssortUpd.UnlimitedCount = false;
                betaAssortUpd.StackObjectsCount = 0;
                betaAssortUpd.BuyRestrictionMax = 0;
            }
        }

        // Block cultistCircle Kappa reward for SECURE_WAIST_POUCH
        if (this.hideoutConfig?.cultistCircle?.directRewards) {
            const reward = this.hideoutConfig.cultistCircle.directRewards.find((reward) => reward.requiredItems.includes("5732ee6a24597719ae0c0281"));
            if (reward) {
                const index = reward.requiredItems.indexOf("5732ee6a24597719ae0c0281");
                if (index !== -1) {
                    reward.requiredItems[index] = "5c093ca986f7740a1867ab12";
                }
            }
        }

        // Custom Secure Container recipes
        if (this.tables.hideout?.production) {
            this.tables.hideout.production.recipes.push(...containerRecipes);
        }
    }

    private doBiggerSecureContainers(): void {
        this.modifyContainer(ItemTpl.SECURE_WAIST_POUCH, 2, 4);
        this.modifyContainer(ItemTpl.SECURE_CONTAINER_ALPHA, 3, 3);
        this.modifyContainer(ItemTpl.SECURE_CONTAINER_BETA, 3, 4);
        this.modifyContainer(ItemTpl.SECURE_CONTAINER_EPSILON, 3, 5);
        this.modifyContainer(ItemTpl.SECURE_CONTAINER_GAMMA, 4, 5);
        this.modifyContainer(ItemTpl.SECURE_CONTAINER_KAPPA, 5, 5);
    }

    private modifyContainer(itemTpl: string, cellsV: number, cellsH: number): void {
        if (this.items[itemTpl]?._props.Grids?.[0]?._props) {
            this.items[itemTpl]._props.Grids[0]._props.cellsV = cellsV;
            this.items[itemTpl]._props.Grids[0]._props.cellsH = cellsH;
        } else {
            this.logger.warning(`Kynexis Custom Changes: Failed to modify container with Tpl ${itemTpl}, skipping`);
        }
    }
}
