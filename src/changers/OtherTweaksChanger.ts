import { DependencyContainer } from "tsyringe"
import { DatabaseServer } from "@spt/servers/DatabaseServer"
import { OtherTweaks } from "../types"
import { IDatabaseTables } from "@spt/models/spt/server/IDatabaseTables"
import { PrefixLogger } from "../util/PrefixLogger"
import { ItemTpl } from "@spt/models/enums/ItemTpl"
import { ItemType } from "@spt/models/eft/common/tables/ITemplateItem"
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem"
import { BaseClasses } from "@spt/models/enums/BaseClasses"
import { ConfigServer } from "@spt/servers/ConfigServer"
import { ConfigTypes } from "@spt/models/enums/ConfigTypes"
import { IBotConfig } from "@spt/models/spt/config/IBotConfig"

export class OtherTweaksChanger {
	private logger: PrefixLogger
	private tables: IDatabaseTables
	private items: Record<string, ITemplateItem> | undefined
	private botConfig: IBotConfig

	constructor(container: DependencyContainer) {
		this.logger = PrefixLogger.getInstance()
		const databaseServer = container.resolve<DatabaseServer>("DatabaseServer")
		const configServer = container.resolve<ConfigServer>("ConfigServer")
		this.tables = databaseServer.getTables()
		this.items = this.tables.templates?.items
		this.botConfig = configServer.getConfig<IBotConfig>(ConfigTypes.BOT)
	}

	public apply(config: OtherTweaks) {
		if (!config.enabled) {
			return
		}

		try {
			if (config.skillExpBuffs) {
				this.doSkillExpBuffs()
			}
		} catch (error) {
			this.logger.warning("OtherTweaks: doSkillExpBuffs failed gracefully. Send bug report. Continue safely.")
			console.warn(error)
		}

		try {
			if (config.signalPistolInSpecialSlots) {
				this.doSignalPistolInSpecialSlots()
			}
		} catch (error) {
			this.logger.warning("OtherTweaks: doSignalPistolInSpecialSlots failed gracefully. Send bug report. Continue safely.")
			console.warn(error)
		}

		try {
			if (config.unexaminedItemsAreBack) {
				this.doUnexaminedItemsAreBack()
			}
		} catch (error) {
			this.logger.warning("OtherTweaks: doUnexaminedItemsAreBack failed gracefully. Send bug report. Continue safely.")
			console.warn(error)
		}

		try {
			if (config.fasterExamineTime) {
				this.doFasterExamineTime()
			}
		} catch (error) {
			this.logger.warning("OtherTweaks: doFasterExamineTime failed gracefully. Send bug report. Continue safely.")
			console.warn(error)
		}

		try {
			if (config.removeBackpackRestrictions) {
				this.doRemoveBackpackRestrictions()
			}
		} catch (error) {
			this.logger.warning("OtherTweaks: doRemoveBackpackRestrictions failed gracefully. Send bug report. Continue safely.")
			console.warn(error)
		}

		try {
			if (config.removeDiscardLimit) {
				this.doRemoveDiscardLimit()
			}
		} catch (error) {
			this.logger.warning("OtherTweaks: doRemoveDiscardLimit failed gracefully. Send bug report. Continue safely.")
			console.warn(error)
		}

		try {
			if (config.reshalaAlwaysHasGoldenTT) {
				this.doReshalaAlwaysHasGoldenTT()
			}
		} catch (error) {
			this.logger.warning("OtherTweaks: doReshalaAlwaysHasGoldenTT failed gracefully. Send bug report. Continue safely.")
			console.warn(error)
		}

		try {
			if (config.biggerAmmoStacks.enabled) {
				this.doBiggerAmmoStacks(config.biggerAmmoStacks.stackMultiplier, config.biggerAmmoStacks.botAmmoStackFix)
			}
		} catch (error) {
			this.logger.warning("OtherTweaks: doBiggerAmmoStacks failed gracefully. Send bug report. Continue safely.")
			console.warn(error)
		}

		try {
			if (config.questChanges) {
				this.doQuestChanges()
			}
		} catch (error) {
			this.logger.warning("OtherTweaks: doQuestChanges failed gracefully. Send bug report. Continue safely.")
			console.warn(error)
		}

		try {
			if (config.removeRaidItemLimits) {
				this.doRemoveRaidItemLimits()
			}
		} catch (error) {
			this.logger.warning("OtherTweaks: doRemoveRaidItemLimits failed gracefully. Send bug report. Continue safely.")
			console.warn(error)
		}

	   try {
		   if (config.biggerCurrencyStacks) {
			   this.doCurrencyStack(config.currencyStackSizes)
		   }
	   } catch (error) {
		   this.logger.warning("OtherTweaks: doCurrencyStack failed gracefully. Send bug report. Continue safely.")
		   console.warn(error)
	   }

		try {
			if (config.smallContainersInSpecialSlots) {
				this.doSmallContainersInSpecialSlots()
			}
		} catch (error) {
			this.logger.warning("OtherTweaks: doCurrencyStack failed gracefully. Send bug report. Continue safely.")
			console.warn(error)
		}
	}

	private doSkillExpBuffs() {
		const globals = this.tables.globals

		globals!.config.SkillsSettings.Vitality.DamageTakenAction *= 10
		globals!.config.SkillsSettings.Sniper.WeaponShotAction *= 10
		globals!.config.SkillsSettings.Surgery.SurgeryAction *= 10
		// biome-ignore lint/complexity/noForEach: Small array.
		Object.values(globals!.config.SkillsSettings.MagDrills).forEach((x) => x * 10)
		globals!.config.SkillsSettings.WeaponTreatment.SkillPointsPerRepair *= 100
	}

	doSignalPistolInSpecialSlots() {
		this.pushToSpecialSlots(ItemTpl.SIGNALPISTOL_ZID_SP81_26X75_SIGNAL_PISTOL)
	}

	doUnexaminedItemsAreBack() {
		if (!this.items) {
			this.logger.warning("OtherTweaksChanger: doFasterExamineTime: items not found");
			return;
		}
		for (const item of Object.values(this.items ?? {})) {
			if (
				item._parent === BaseClasses.BUILT_IN_INSERTS ||
				item._parent === BaseClasses.MAGAZINE ||
				item._parent === BaseClasses.CYLINDER_MAGAZINE ||
				item._parent === BaseClasses.ARMOR_PLATE
			) {
				continue;
			}
			if (item._props.ExaminedByDefault) {
				item._props.ExaminedByDefault = false;
			}
		}
	}

	doFasterExamineTime() {
		for (const item of Object.values(this.items ?? {})) {
			if (item._props.ExamineTime) {
				item._props.ExamineTime = 0.2;
			}
		}
	}

	doRemoveBackpackRestrictions() {
		for (const item of Object.values(this.items ?? {})) {
			if (item._type !== ItemType.ITEM) {
				continue;
			}
			if (JSON.stringify(item).indexOf("ExcludedFilter") > -1) {
				const filtered = item._props?.Grids?.[0]?._props?.filters[0]?.ExcludedFilter;
				if (filtered?.includes(ItemTpl.CONTAINER_AMMUNITION_CASE)) {
					if (item._props.Grids?.[0]._props.filters[0].ExcludedFilter) {
						item._props.Grids[0]._props.filters[0].ExcludedFilter = [];
					}
				}
			}
		}
	}

	doRemoveDiscardLimit() {
		for (const item of Object.values(this.items ?? {})) {
			if (item._type === ItemType.ITEM) {
				item._props.DiscardLimit = -1;
			}
		}
	}

	doReshalaAlwaysHasGoldenTT() {
		const reshala = this.tables.bots!.types.bossbully
		reshala.chances.equipment.Holster = 100
		reshala.inventory.equipment.Holster = { "5b3b713c5acfc4330140bd8d": 1 }
	}

	doBiggerAmmoStacks(stackMultiplier: number, botAmmoStackFix: boolean) {
		for (const item of Object.values(this.items ?? {})) {
			if (item._parent === BaseClasses.AMMO && item._props.StackMaxSize) {
				item._props.StackMaxSize *= stackMultiplier;
				if (botAmmoStackFix) {
					this.botConfig.secureContainerAmmoStackCount = Math.round(this.botConfig.secureContainerAmmoStackCount / stackMultiplier);
				}
			}
		}
	}

	doQuestChanges() {
		const quests = this.tables.templates?.quests;
		if (!quests) return;
		const crisis = quests["60e71c48c1bfa3050473b8e5"];
		if (crisis?.conditions?.AvailableForStart?.[1]) {
			crisis.conditions.AvailableForStart[1].value = 30;
		}
		for (const quest of Object.values(quests)) {
			if (quest.QuestName?.includes("Drip-Out")) {
				const handover = quest.conditions?.AvailableForFinish?.find((x) => x.conditionType === "HandoverItem");
				if (handover) handover.value = 10;
				const counter = quest.conditions?.AvailableForFinish?.find((x) => x.conditionType === "CounterCreator");
				if (counter) counter.value = 20;
			}
		}
		const circulate = quests["6663149f1d3ec95634095e75"];
		if (circulate?.conditions?.AvailableForFinish?.[0]) {
			circulate.conditions.AvailableForFinish[0].value = 50;
		}
		const colleagues3 = quests["5edac34d0bb72a50635c2bfa"];
		if (colleagues3?.conditions?.AvailableForFinish) {
			const c1 = colleagues3.conditions.AvailableForFinish.find((x) => x.id === "5f07025e27cec53d5d24fe25");
			if (c1) c1.onlyFoundInRaid = false;
			const c2 = colleagues3.conditions.AvailableForFinish.find((x) => x.id === "5f04935cde3b9e0ecf03d864");
			if (c2) c2.onlyFoundInRaid = false;
		}
	}

	doRemoveRaidItemLimits() {
		const globals = this.tables.globals
		// globals.config.RestrictionsInRaid.forEach((x) => console.log(`${x.TemplateId}, // ${this.tables.locales?.global.en[`${x.TemplateId} Name`]}`))
		globals!.config.RestrictionsInRaid = []
	}

   doCurrencyStack(currencyStackConfig?: {
	   euros?: number;
	   dollars?: number;
	   gpcoin?: number;
	   roubles?: number;
   }) {
	   const euros = currencyStackConfig?.euros ?? 100000;
	   const dollars = currencyStackConfig?.dollars ?? 100000;
	   const gpcoin = currencyStackConfig?.gpcoin ?? 100;
	   const roubles = currencyStackConfig?.roubles ?? 1000000;
	   this.items![ItemTpl.MONEY_EUROS]._props.StackMaxSize = euros;
	   this.items![ItemTpl.MONEY_DOLLARS]._props.StackMaxSize = dollars;
	   this.items![ItemTpl.MONEY_GP_COIN]._props.StackMaxSize = gpcoin;
	   this.items![ItemTpl.MONEY_ROUBLES]._props.StackMaxSize = roubles;
   }

	doSmallContainersInSpecialSlots() {
		const tools = [
			ItemTpl.CONTAINER_DOGTAG_CASE,
			ItemTpl.CONTAINER_INJECTOR_CASE,
			ItemTpl.CONTAINER_KEY_TOOL,
			ItemTpl.CONTAINER_KEYCARD_HOLDER_CASE,
			ItemTpl.CONTAINER_SIMPLE_WALLET,
			ItemTpl.CONTAINER_WZ_WALLET,
		]

		for (const tool of tools) {
			this.pushToSpecialSlots(tool)
		}
	}

	pushToSpecialSlots(itemID: string) {
		const pockets = [ItemTpl.POCKETS_1X4_SPECIAL, ItemTpl.POCKETS_1X4_TUE]

	   for (const pocket of pockets) {
		   const pocketItem = this.items?.[pocket];
		   if (!pocketItem?._props?.Slots) {
			   continue;
		   }
		   for (const slot of pocketItem._props.Slots) {
			   const allowedItems = slot?._props?.filters?.[0]?.Filter;
			   if (!allowedItems) {
				   continue;
			   }
			   if (!allowedItems.includes(itemID)) {
				   allowedItems.push(itemID);
			   }
		   }
	   }
	}
}
