import { findBrowserPath } from "../../browser-paths.js";
import {
	formatProfileForPackageJson,
	listBrowserProfiles,
	selectBrowserProfile,
} from "../../profile-manager.js";
import { logger } from "../../utils/logger.js";
import { detectPlatform } from "../platform.js";
import { getBrowserId } from "./get-browser-id.js";

export async function getBrowserProfilePath(): Promise<string | null> {
	const spinner = logger.start(
		"🔧 Detecting Browser Profile (for development)...",
	);

	const browser = await getBrowserId();
	const platform = await detectPlatform();
	if (platform.isWSL) {
		// TODO: Ask for Windows / WSL
	}

	spinner.text = "🔍 Searching for browser installation...";
	const browserPath = await findBrowserPath(browser, platform);
	console.log({ browser, platform }); // TODO!!
	console.log({ browserPath }); // TODO!!
	if (!browserPath) {
		logger.error("Browser installation not found");
		return null;
	}
	spinner.succeed(`✅ Browser installation found at "${browserPath}"`);

	const profiles = await listBrowserProfiles(browserPath);
	if (profiles.length === 0) {
		spinner.fail("No browser profiles found");
		spinner.warn("Please create a profile in your browser first");
		return null;
	}

	const selectedProfile = await selectBrowserProfile(profiles);
	if (!selectedProfile) {
		spinner.fail("No profile selected");
		return null;
	}

	spinner.succeed("✅ Profile selected");
	return formatProfileForPackageJson(selectedProfile);
}
