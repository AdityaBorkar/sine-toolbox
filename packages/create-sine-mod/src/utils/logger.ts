/** biome-ignore-all lint/suspicious/noConsole: Logging Function */
import chalk from "chalk";
import ora, { type Ora } from "ora";

export class Logger {
	private static instance: Logger;
	private spinner: Ora | null = null;

	private constructor() {}

	static getInstance(): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger();
		}
		return Logger.instance;
	}

	info(message: string) {
		this.stopSpinner();
		console.log(`${chalk.blue("i")} ${chalk.bold(message)}`);
	}

	success(message: string) {
		this.stopSpinner();
		console.log(`${chalk.green("✅")} ${message}`);
	}

	error(message: string) {
		this.stopSpinner();
		console.log(`${chalk.red("❌")} ${message}`);
	}

	warn(message: string) {
		this.stopSpinner();
		console.log(`${chalk.yellow("⚠️")} ${message}`);
	}

	log(message: string) {
		this.stopSpinner();
		console.log(message);
	}

	silentLog(message: string) {
		console.log();
		console.log(chalk.gray(message));
	}

	start(message: string): Ora {
		this.stopSpinner();
		this.spinner = ora({
			color: "cyan",
			text: message,
		}).start();
		return this.spinner;
	}

	update(message: string) {
		if (this.spinner) {
			this.spinner.text = message;
		}
	}

	succeed(message?: string) {
		if (this.spinner) {
			this.spinner.succeed(message);
			this.spinner = null;
		}
	}

	fail(message?: string) {
		if (this.spinner) {
			this.spinner.fail(chalk.red(message));
			this.spinner = null;
		}
	}

	private stopSpinner() {
		if (this.spinner) {
			this.spinner.stop();
			this.spinner = null;
		}
	}

	newline() {
		console.log();
	}
}

export const logger = Logger.getInstance();
