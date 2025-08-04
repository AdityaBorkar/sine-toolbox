import { join } from "node:path";

import inquirer from "inquirer";

import { logger } from "../../utils/logger.js";
import { detectPlatform } from "../platform.js";
import { findProfiles } from "./find-profiles.js";
import { getBrowserId } from "./get-browser-id.js";

export async function getProfilePath(): Promise<string | null> {
	const spinner = logger.start(
		"🔧 Detecting Browser Profile (for development)...",
	);

	const browser = await getBrowserId();
	let platform = await detectPlatform();
	if (platform.isWsl) {
		const { os } = await inquirer.prompt([
			{
				choices: ["windows", "linux"],
				default: "windows",
				message:
					"(Since you're running on WSL) Where is your browser installed?",
				name: "os",
				type: "list",
			},
		]);
		platform = { isWsl: true, os };
	}

	spinner.text = "🔍 Searching for browser installation...";
	const profiles = await findProfiles({ browser, platform });
	if (!profiles) {
		logger.error("Browser installation not found");
		return null;
	}

	if (profiles.profiles.length === 1) {
		logger.info(`Using profile: ${profiles.profiles[0]}`);
		return profiles.profiles[0];
	}

	const { selectedProfile } = await inquirer.prompt([
		{
			choices: profiles.profiles.map((profile) => ({
				name: profile,
				value: profile,
			})),
			default: profiles.profiles[0],
			message: "Select a browser profile:",
			name: "selectedProfile",
			type: "list",
		},
	]);

	return join(profiles.basePath, selectedProfile);
}
