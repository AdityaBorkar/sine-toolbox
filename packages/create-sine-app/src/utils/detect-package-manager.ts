import inquirer from "inquirer";
import { logger } from "./logger.js";

type PackageManager = "bun" | "yarn" | "pnpm" | "npm";

const PACKAGE_MANAGERS = [
	{
		name: "bun",
		description: "Bun - Fast all-in-one JavaScript runtime & package manager",
		value: "bun" as const,
	},
	{
		name: "npm",
		description: "npm - Node.js package manager (default)",
		value: "npm" as const,
	},
	{
		name: "yarn",
		description: "Yarn - Fast, reliable, and secure dependency management",
		value: "yarn" as const,
	},
	{
		name: "pnpm",
		description: "pnpm - Fast, disk space efficient package manager",
		value: "pnpm" as const,
	},
];

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
	logger.newline();

	const { packageManager } = await inquirer.prompt([
		{
			type: "list",
			name: "packageManager",
			message: "Which package manager would you like to use?",
			choices: PACKAGE_MANAGERS.map((pm) => ({
				name: pm.description,
				value: pm.value,
			})),
			default: "npm",
		},
	]);

	return packageManager;
}
