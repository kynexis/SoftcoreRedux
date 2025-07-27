import * as fs from "node:fs"
import * as json5 from "json5"
import { join } from "node:path"
import type { Configuration } from "../types"

/**
 * ConfigServer Class
 *
 * The ConfigServer class is responsible for managing the application's configuration settings.
 * It provides functionality to load a configuration file, which is specified in JSON5 format.
 */
export class ConfigServer {
	private configPath: string
	private config: Configuration | null = null
	private isLoaded = false

	/**
	 * Constructs a new ConfigServer instance.
	 * Automatically loads the configuration file specified by the relative path.
	 *
	 * @param {string} relativeConfigPath - The relative path to the configuration file.
	 */
  constructor() {
	// Always resolve config path relative to the mod root, not src
	// Find the mod root by going up from __dirname until we find 'user/mods/Kynexis-SoftcoreRedux'
	// This works for both dev and user environments
	let modRoot = __dirname;
	const pathParts = modRoot.split(/[\\/]/);
	const modIndex = pathParts.lastIndexOf("Kynexis-SoftcoreRedux");
	if (modIndex !== -1) {
	  modRoot = pathParts.slice(0, modIndex + 1).join(require("path").sep);
	}
	this.configPath = join(modRoot, "config", "config.json5");
  }

	/**
	 * Constructs the absolute path to the configuration file based on its relative path.
	 *
	 * @returns {string} - The absolute path to the configuration file.
	 */
  // buildConfigPath() no longer needed

	/**
	 * Loads the configuration from a file. Sets the `isLoaded` flag to true if successful, false otherwise.
	 * Throws an error if the file cannot be loaded.
	 *
	 * @returns {this} - Returns the ConfigServer instance.
	 */
  public loadConfig(): this {
  try {
	const configFileContent = fs.readFileSync(this.configPath, "utf-8")
	this.config = json5.parse(configFileContent) as Configuration
	this.isLoaded = true
  } catch (error) {
	this.config = null
	this.isLoaded = false
	throw new Error("CONFIG_LOAD_ERROR - Could not load configuration")
  }
	return this
  }

	/**
	 * Retrieves the loaded configuration.
	 *
	 * @returns {Configuration | null} - The loaded configuration, or null if the configuration is not loaded.
	 */
	public getConfig(): Configuration | null {
		if (!this.isLoaded) {
			throw new Error("CONFIG_NOT_LOADED - Configuration not loaded")
		}

		return this.config
	}
}
