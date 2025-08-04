import inquirer from "inquirer";

import { logger } from "../utils/logger.js";

const TEMPLATES = {
	basic: {
		description:
			"Basic Sine App - Simple starter template with essential files",
		name: "basic",
	},
} as const;

const DEFAULT_TEMPLATE = "basic" as const;

export async function getTemplateId(name?: string): Promise<string> {
	if (name) {
		if (Object.keys(TEMPLATES).includes(name)) {
			logger.info(`Using template: ${name}`);
			return name;
		}
		logger.error(`Invalid template: ${name}`);
		logger.info(`Available templates: ${Object.keys(TEMPLATES).join(", ")}`);
	}

	const { template } = await inquirer.prompt([
		{
			choices: Object.keys(TEMPLATES).map((value) => {
				const { description, name } =
					TEMPLATES[value as keyof typeof TEMPLATES];
				return { description, name, value };
			}),
			default: DEFAULT_TEMPLATE,
			message: "Which template would you like to use?",
			name: "template",
			type: "list",
		},
	]);

	return template;
}
