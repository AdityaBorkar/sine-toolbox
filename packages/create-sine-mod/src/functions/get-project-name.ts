import { exists } from "node:fs/promises";
import { resolve } from "node:path";

import inquirer from "inquirer";

import { logger } from "../utils/logger.js";

const DEFAULT_PROJECT_NAME = "my-sine-app";

export async function getProjectName(initialName?: string): Promise<string> {
	logger.newline();
	if (initialName) {
		logger.info(`Please retype the initial name: ${initialName}`);
	}
	const { name } = await inquirer.prompt([
		{
			default: DEFAULT_PROJECT_NAME,
			message: "What is the name of your project?",
			name: "name",
			type: "input",
			validate: validator,
		},
	]);
	return name.trim();
}

async function validator(_name: string) {
	const name = _name.trim();
	if (!name) {
		return "Project name cannot be empty";
	}
	if (!ValidPackageNameRegex.test(name)) {
		return `Invalid project name: "${name}"\nProject name must be:\n• Lowercase alphanumeric with dashes/underscores\n• Start and end with alphanumeric characters`;
	}
	if (name.length > 214) {
		return `Invalid project name: "${name}"\nMaximum 214 characters`;
	}
	if (await exists(resolve(name))) {
		return `Directory "${name}" already exists\nPlease choose a different name`;
	}
	return true;
}

const ValidPackageNameRegex = /^[a-z0-9]([a-z0-9._-]*[a-z0-9])?$/;
