import { $ } from "bun";
import inquirer from "inquirer";

import { logger } from "../utils/logger.js";

const INSTALL_LOCATIONS = {
	windows: {
		description: "Windows (recommended for GUI access)",
		name: "windows",
	},
	linux: {
		description: "Linux (WSL environment)",
		name: "linux",
	},
} as const;

const DEFAULT_LOCATION = "windows" as const;

export interface PlatformInfo {
	os: "linux" | "windows" | "darwin";
	isWSL: boolean;
	browserInstallLocation?: "windows" | "linux";
}

export async function detectPlatform(): Promise<PlatformInfo> {
	const platform = process.platform;

	if (platform === "win32") {
		return {
			isWSL: false,
			os: "windows",
		};
	}

	if (platform === "darwin") {
		return {
			isWSL: false,
			os: "darwin",
		};
	}

	// Linux or WSL
	const isWsl = await detectWsl();

	return {
		isWSL: isWsl,
		os: "linux",
	};
}

async function detectWsl(): Promise<boolean> {
	try {
		const result = await $`uname -r`.text();
		return (
			result.toLowerCase().includes("microsoft") ||
			result.toLowerCase().includes("wsl")
		);
	} catch {
		return false;
	}
}

export async function getBrowserInstallLocation(location?: string): Promise<string> {
	if (location) {
		if (Object.keys(INSTALL_LOCATIONS).includes(location)) {
			logger.info(`Using install location: ${location}`);
			return location;
		}
		logger.error(`Invalid install location: ${location}`);
		logger.info(`Available locations: ${Object.keys(INSTALL_LOCATIONS).join(", ")}`);
	}

	logger.newline();
	logger.info("Detecting browser installation location...");
	logger.info("Since you're running on WSL, where is your browser installed?");
	logger.newline();

	const { installLocation } = await inquirer.prompt([
		{
			type: "list",
			name: "installLocation",
			message: "Where is your browser installed?",
			choices: Object.keys(INSTALL_LOCATIONS).map((value) => {
				const { description, name } = INSTALL_LOCATIONS[value as keyof typeof INSTALL_LOCATIONS];
				return { name: description, value };
			}),
			default: DEFAULT_LOCATION,
		},
	]);

	return installLocation;
}
