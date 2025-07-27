import { TraderChangesChanger } from "./changers/TraderChanger";
import { ScavCaseOptionsChanger } from "./changers/ScavCaseOptionsChanger";
import { OtherTweaksChanger } from "./changers/OtherTweaksChanger";
import { DependencyContainer } from "tsyringe";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables";
import { ConfigServer } from "./servers/ConfigServer";
import { InsuranceChanger } from "./changers/InsuranceChanger";
import { StashChanger } from "./changers/StashChanger";
import { SecureContainerChanger } from "./changers/SecureContainerChanger";
import { HideoutContainersChanger, FuelConsumptionChanger, FasterHideoutConstructionChanger } from "./changers/HideoutChanger";
import { EconomyChanger } from "./changers/EconomyChanger";
import { CraftingOptionsChanger } from "./changers/CraftingOptionsChanger";
import { PrefixLogger } from "./util/PrefixLogger";


class Mod implements IPostDBLoadMod {
    private logger!: PrefixLogger;
    private databaseServer!: DatabaseServer;
    private tables!: IDatabaseTables;

    public postDBLoad(container: DependencyContainer): void {
        
        this.logger = PrefixLogger.getInstance(container);
        this.databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        this.tables = this.databaseServer.getTables();
        const configServer = new ConfigServer().loadConfig();
        const config = configServer.getConfig();
        if (!config) {
            throw new Error("Config could not be loaded. Aborting mod initialization.");
        }

        this.logger.success("Loaded...");
        this.logger.debugLog(`Config: ${JSON.stringify(config, null, 2)}`);

        // --- Trader Changes ---
        if (config.traderChanges?.enabled) {
            const traderChangesChanger = new TraderChangesChanger(container);
            traderChangesChanger.apply(config.traderChanges);
        }

        // --- Crafting Changes ---
        const craftingOptionsChanger = new CraftingOptionsChanger(container);
        if (config.craftingChanges) {
            craftingOptionsChanger.applyCraftingChanges(config.craftingChanges);
        }
        if (config.hideoutOptions?.fasterCraftingTime) {
            craftingOptionsChanger.applyFasterCraftingTime(config.hideoutOptions.fasterCraftingTime);
        }

        // --- Insurance Changes ---
        if (config.insuranceChanges?.enabled && this.tables.globals?.config?.Insurance) {
            const insuranceConfig = this.tables.globals.config.Insurance;
            const insuranceChanger = new InsuranceChanger(this.logger, this.tables, insuranceConfig);
            insuranceChanger.applyInsuranceChanges(config.insuranceChanges);
        } else if (config.insuranceChanges?.enabled) {
            this.logger.error("SoftcoreRedux: Insurance config not found in database tables.");
        }
        
        // --- Hideout Options ---
        const hideout = config.hideoutOptions;
        if (hideout?.hideoutContainers?.enabled) {
            const hideoutContainersChanger = new HideoutContainersChanger(container);
            hideoutContainersChanger.apply(
                hideout.hideoutContainers,
                hideout.disableFIRHideout,
                hideout.allowGymTrainingWithMusclePain
            );
        }
        if (hideout?.fuelConsumption?.enabled) {
            const fuelConsumptionChanger = new FuelConsumptionChanger(container);
            fuelConsumptionChanger.apply(hideout.fuelConsumption);
        }
        if (hideout?.fasterHideoutConstruction?.enabled) {
            const fasterHideoutConstructionChanger = new FasterHideoutConstructionChanger(container);
            fasterHideoutConstructionChanger.apply(hideout.fasterHideoutConstruction);
        }
        // --- Scav Case Options ---
        if (hideout?.scavCaseOptions?.enabled) {
            const scavCaseOptionsChanger = new ScavCaseOptionsChanger(container);
            scavCaseOptionsChanger.apply(hideout.scavCaseOptions);
        }

        // --- Stash Options ---
        const stash = config.stashOptions;
        const stashChanger = new StashChanger(this.logger, this.tables);
        stashChanger.apply(stash);

        // --- Secure Container Options ---
        const secureContainerChanger = new SecureContainerChanger(this.logger, this.tables);
        secureContainerChanger.apply(config.secureContainersOptions);

        // --- Price/Economy/Flea Options ---
        const economy = {
            ...config.economyOptions,
            fasterBitcoinFarming: config.hideoutOptions?.fasterBitcoinFarming
        };
        const economyChanger = new EconomyChanger(container);
        economyChanger.apply(economy);

        // --- Other Tweaks ---
        if (config.otherTweaks?.enabled) {
            const otherTweaksChanger = new OtherTweaksChanger(container);
            otherTweaksChanger.apply(config.otherTweaks);
        }
    }

}

export const mod = new Mod()
