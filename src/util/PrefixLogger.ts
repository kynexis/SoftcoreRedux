import { DependencyContainer } from "tsyringe";
import { ILogger } from "@spt/models/spt/utils/ILogger";


export class PrefixLogger implements ILogger {
	private static instance: PrefixLogger | null = null;

	private readonly logger: ILogger;
	private readonly prefix: string;
	private debugMode: boolean;

	// Private constructor prevents direct instantiation
	private constructor(logger: ILogger, prefix: string, debug: boolean) {
		this.logger = logger;
		this.prefix = prefix;
		this.debugMode = debug;
	}

	// Singleton initializer
	public static getInstance(container?: DependencyContainer, debug = false): PrefixLogger {
		if (!PrefixLogger.instance) {
			if (!container) {
				throw new Error("PrefixLogger: Container not provided");
			}
			const logger = container.resolve<ILogger>("WinstonLogger");
			PrefixLogger.instance = new PrefixLogger(logger, "[SoftcoreRedux]", debug);
		}
		return PrefixLogger.instance;
	}

	public setDebug(debug: boolean) {
		this.debugMode = debug;
	}

	public info(message: string): void {
		this.logger.info(`${this.prefix} ${message}`);
	}

	public warning(message: string): void {
		this.logger.warning(`${this.prefix} ${message}`);
	}

	public error(message: string): void {
		this.logger.error(`${this.prefix} ${message}`);
	}

	public debugLog(message: string): void {
		if (this.debugMode) {
			this.logger.info(`${this.prefix} [DEBUG] ${message}`);
		}
	}

	// ILogger interface: debug method
	public debug(data: string | Record<string, unknown>, onlyShowInConsole?: boolean): void {
		this.logger.debug(data, onlyShowInConsole);
	}

	// --- ILogger interface methods ---
	public writeToLogFile(message: string): void {
		if (typeof this.logger.writeToLogFile === "function") {
			this.logger.writeToLogFile(`${this.prefix} ${message}`);
		}
	}

	public log(message: string, level: string = "info", color?: any): void {
		if (typeof this.logger.log === "function") {
			this.logger.log(`${this.prefix} ${message}`, level, color);
		} else {
			this.logger.info(`${this.prefix} ${message}`);
		}
	}

	public logWithColor(message: string, color: any): void {
		if (typeof this.logger.logWithColor === "function") {
			this.logger.logWithColor(`${this.prefix} ${message}`, color);
		} else {
			this.logger.info(`${this.prefix} ${message}`);
		}
	}

	public success(message: string): void {
		if (typeof this.logger.success === "function") {
			this.logger.success(`${this.prefix} ${message}`);
		} else {
			this.logger.info(`${this.prefix} ${message}`);
		}
	}
}
