// import inquirer from "inquirer";

import { logger } from "../../utils/logger.js";

const BROWSERS = {
	firefox: "Firefox (Not Yet Supported)",
	zen: "Zen Browser",
} as const;

const DEFAULT_BROWSER = "zen" as const;

export async function getBrowserId(name?: string): Promise<string> {
	if (name) {
		if (Object.keys(BROWSERS).includes(name)) {
			logger.info(`Using browser: ${name}`);
			return name;
		}
		logger.error(`Invalid browser: ${name}`);
		logger.info(`Available browsers: ${Object.keys(BROWSERS).join(", ")}`);
	}

	logger.info(`Using ${BROWSERS.zen} (Only Supported Browser for now)`);
	return DEFAULT_BROWSER;

	// logger.newline();
	// logger.info("Select a browser for development:");
	// const { browser } = await inquirer.prompt([
	// 	{
	// 		choices: browserKeys.map((value) => {
	// 			const name = BROWSERS[value as keyof typeof BROWSERS];
	// 			return { name, value };
	// 		}),
	// 		default: DEFAULT_BROWSER,
	// 		message: "Which browser would you like to use?",
	// 		name: "browser",
	// 		type: "list",
	// 	},
	// ]);

	// return browser;
}
