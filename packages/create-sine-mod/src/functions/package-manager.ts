import inquirer from "inquirer";

import { logger } from "../utils/logger.js";

type PackageManager = "bun" | "yarn" | "pnpm" | "npm";

const PACKAGE_MANAGERS = ["bun", "yarn", "pnpm", "npm"] as const;

export function detectPackageManager(): PackageManager | null {
	const userAgent = process.env.npm_config_user_agent;
	if (userAgent?.includes("bun")) {
		return "bun";
	}
	if (userAgent?.includes("yarn")) {
		return "yarn";
	}
	if (userAgent?.includes("pnpm")) {
		return "pnpm";
	}
	if (userAgent?.includes("npm")) {
		return "npm";
	}
	return null;
}

export async function selectPackageManager(): Promise<PackageManager> {
	logger.newline();
	logger.info("No package manager detected. Please select one:");
	const { packageManager } = await inquirer.prompt([
		{
			choices: PACKAGE_MANAGERS.map((name) => ({ name, value: name })),
			default: "npm",
			message: "Which package manager would you like to use?",
			name: "packageManager",
			type: "list",
		},
	]);

	return packageManager;
}
