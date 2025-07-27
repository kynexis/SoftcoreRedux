import { DependencyContainer } from "tsyringe";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import { ItemTpl } from "@spt/models/enums/ItemTpl";
import { PrefixLogger } from "../util/PrefixLogger";
import { HideoutContainers, FuelConsumption, FasterHideoutConstruction } from "../types";

export class HideoutContainersChanger {
    private logger: PrefixLogger;
    private databaseServer: DatabaseServer;
    private tables: IDatabaseTables;
    private items: Record<string, ITemplateItem> | undefined;

    constructor(container: DependencyContainer) {
        this.logger = PrefixLogger.getInstance();
        this.databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        this.tables = this.databaseServer.getTables();
        this.items = this.tables.templates?.items;
    }

    public apply(config: HideoutContainers, disableFIRHideout?: boolean, allowGymTrainingWithMusclePain?: boolean) {
        if (!config.enabled) {
            return;
        }
        try {
            if (config.biggerHideoutContainers) {
                this.doBiggerHideoutContainers();
            }
        } catch (error) {
            this.logger.warning("HideoutContainers: doBiggerHideoutContainers failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }
        try {
            if (config.siccCaseBuff) {
                this.doSiccCaseBuff();
            }
        } catch (error) {
            this.logger.warning("HideoutContainers: doSiccCaseBuff failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }
        if (disableFIRHideout) {
            this.disableFIRHideout();
        }
        if (allowGymTrainingWithMusclePain) {
            this.doAllowGymTrainingWithMusclePain();
        }
    }

    private doAllowGymTrainingWithMusclePain() {
        const globals = this.tables.globals;
        globals!.config.Health.Effects.SevereMusclePain.GymEffectivity = 0.75;
    }

    private disableFIRHideout() {
        if (!this.tables?.hideout?.areas) {
            this.logger.warning("[SoftcoreRedux] Hideout areas not found for FIR removal.");
            return;
        }
        for (const hideoutAreaData of Object.values(this.tables.hideout.areas)) {
            if (!hideoutAreaData?.stages) continue;
            for (const stage of Object.values(hideoutAreaData.stages)) {
                const requirements = stage.requirements;
                if (requirements && requirements.length > 0) {
                    for (const requirement of requirements) {
                        if (Object.prototype.hasOwnProperty.call(requirement, "isSpawnedInSession")) {
                            requirement.isSpawnedInSession = false;
                        }
                    }
                }
            }
        }
        this.logger.info("[SoftcoreRedux] No FIR Hideout loaded.");
    }

    private doBiggerHideoutContainers() {
        const containersToModify = [
            { tpl: ItemTpl.CONTAINER_MONEY_CASE, cellsH: 10, cellsV: 10 },
            { tpl: ItemTpl.CONTAINER_GRENADE_CASE, cellsH: 8, cellsV: 8 },
            { tpl: ItemTpl.CONTAINER_BALLISTIC_PLATE_CASE, cellsH: 12, cellsV: 12 },
            { tpl: ItemTpl.CONTAINER_ITEM_CASE, cellsH: 10, cellsV: 10 },
            { tpl: ItemTpl.CONTAINER_WEAPON_CASE, cellsH: 6, cellsV: 15 },
            { tpl: ItemTpl.CONTAINER_MAGAZINE_CASE, cellsH: 10, cellsV: 7 },
            { tpl: ItemTpl.CONTAINER_MEDICINE_CASE, cellsH: 10, cellsV: 10 },
            { tpl: ItemTpl.CONTAINER_THICC_ITEM_CASE, cellsH: 16, cellsV: 16 },  
            { tpl: ItemTpl.CONTAINER_THICC_WEAPON_CASE, cellsH: 14, cellsV: 15 },     
            { tpl: ItemTpl.CONTAINER_KEY_TOOL, cellsH: 5, cellsV: 5 },
            { tpl: ItemTpl.CONTAINER_INJECTOR_CASE, cellsH: 3, cellsV: 4 },
            { tpl: ItemTpl.CONTAINER_MR_HOLODILNICK_THERMAL_BAG, cellsH: 10, cellsV: 10 },
            
            
        ];
        for (const container of containersToModify) {
            const item = this.items?.[container.tpl];
            if (item?._props?.Grids?.[0]?._props) {
                item._props.Grids[0]._props.cellsH = container.cellsH;
                item._props.Grids[0]._props.cellsV = container.cellsV;
            } else {
                this.logger.warning(`doBiggerHideoutContainers: ${container.tpl} not found.`);
            }
        }
    }

    private doSiccCaseBuff() {
        const siccItem = this.items?.[ItemTpl.CONTAINER_SICC];
        const docsItem = this.items?.[ItemTpl.CONTAINER_DOCUMENTS_CASE];
        const docsFilter = docsItem?._props?.Grids?.[0]?._props?.filters?.[0]?.Filter;
        const siccFilter = siccItem?._props?.Grids?.[0]?._props?.filters?.[0]?.Filter;
        if (!docsFilter || !siccFilter || !siccItem) {
            this.logger.warning("HideoutContainers: doSiccCaseBuff: docsFilter or siccFilter not found");
            return;
        }
        const mergeFilters = [...new Set([...docsFilter, ...siccFilter, ItemTpl.CONTAINER_KEY_TOOL])];
        if (siccItem._props?.Grids?.[0]?._props?.filters?.[0]) {
            siccItem._props.Grids[0]._props.filters[0].Filter = mergeFilters;
        }
    }
}

export class FuelConsumptionChanger {
    private logger: PrefixLogger;
    private databaseServer: DatabaseServer;
    private tables: IDatabaseTables;

    constructor(container: DependencyContainer) {
        this.logger = PrefixLogger.getInstance();
        this.databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        this.tables = this.databaseServer.getTables();
    }

    public apply(config: FuelConsumption) {
        if (!config.enabled) {
            return;
        }
        try {
            this.doChangeFuelConsumption(config.fuelConsumptionMultiplier);
        } catch (error) {
            this.logger.warning("FuelConsumption: doChangeFuelConsumption failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }
    }

    private doChangeFuelConsumption(multiplier: number) {
        const hideout = this.tables.hideout;
        hideout!.settings.generatorFuelFlowRate *= multiplier;
    }
}

export class FasterHideoutConstructionChanger {
    private logger: PrefixLogger;
    private databaseServer: DatabaseServer;
    private tables: IDatabaseTables;

    constructor(container: DependencyContainer) {
        this.logger = PrefixLogger.getInstance();
        this.databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        this.tables = this.databaseServer.getTables();
    }

    public apply(config: FasterHideoutConstruction) {
        if (!config.enabled) {
            return;
        }
        try {
            this.doFasterHideoutConstruction(config.hideoutConstructionTimeMultiplier);
        } catch (error) {
            this.logger.warning("FasterHideoutConstruction: doFasterHideoutConstruction failed gracefully. Send bug report. Continue safely.");
            console.warn(error);
        }
    }

    private doFasterHideoutConstruction(multiplier: number) {
        const hideout = this.tables.hideout;
        for (const area of hideout!.areas) {
            for (const [, stageRaw] of Object.entries(area.stages)) {
                const stage = stageRaw as { constructionTime: number };
                stage.constructionTime = Math.round(stage.constructionTime / multiplier);
            }
        }
    }
}
