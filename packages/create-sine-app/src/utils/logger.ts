import chalk from "chalk";

export const logger = {
	error: (message: string) => {
		console.log(chalk.red("✖"), message);
	},
	info: (message: string) => {
		console.log(chalk.blue("ℹ"), message);
	},
	newline: () => {
		console.log();
	},
	success: (message: string) => {
		console.log(chalk.green("✓"), message);
	},
	warn: (message: string) => {
		console.log(chalk.yellow("⚠"), message);
	},
};
