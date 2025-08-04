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
		console.log(chalk.blue("ℹ") + " " + message);
	}

	success(message: string) {
		this.stopSpinner();
		console.log(chalk.green("✅") + " " + message);
	}

	error(message: string) {
		this.stopSpinner();
		console.log(chalk.red("❌") + " " + message);
	}

	warn(message: string) {
		this.stopSpinner();
		console.log(chalk.yellow("⚠️") + "  " + message);
	}

	creating(message: string) {
		this.stopSpinner();
		console.log(chalk.cyan("🚀") + " " + message);
	}

	folder(message: string) {
		this.stopSpinner();
		console.log(chalk.blue("📁") + " " + message);
	}

	file(message: string) {
		this.stopSpinner();
		console.log(chalk.green("📝") + " " + message);
	}

	package(message: string) {
		this.stopSpinner();
		console.log(chalk.magenta("📦") + " " + message);
	}

	celebration(message: string) {
		this.stopSpinner();
		console.log(chalk.green("🎉") + " " + message);
	}

	steps(title: string, steps: string[]) {
		this.stopSpinner();
		console.log(chalk.bold("\n" + title));
		steps.forEach((step) => {
			console.log(chalk.gray("  " + step));
		});
	}

	startSpinner(message: string): Ora {
		this.stopSpinner();
		this.spinner = ora({
			text: message,
			color: "cyan",
		}).start();
		return this.spinner;
	}

	updateSpinner(message: string) {
		if (this.spinner) {
			this.spinner.text = message;
		}
	}

	succeedSpinner(message?: string) {
		if (this.spinner) {
			this.spinner.succeed(message);
			this.spinner = null;
		}
	}

	failSpinner(message?: string) {
		if (this.spinner) {
			this.spinner.fail(message);
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