import {
	findBrowserPaths,
	validateBrowserInstallation,
} from "./browser-paths.js";
import { selectBrowser } from "./browser-selection.js";
import { askBrowserInstallLocation, detectPlatform } from "./platform-utils.js";
import {
	formatProfileForPackageJson,
	listBrowserProfiles,
	selectBrowserProfile,
} from "./profile-manager.js";

export async function setupBrowserProfile(): Promise<string | null> {
	console.log("\n🔧 Setting up browser profile for development...");

	try {
		// Step 1: Ask user for browser selection
		const selectedBrowser = await selectBrowser();

		// Step 2: Detect platform and ask for installation location if needed
		const platformInfo = await detectPlatform();

		if (platformInfo.isWSL) {
			platformInfo.browserInstallLocation = await askBrowserInstallLocation();
		}

		// Step 3: Find browser paths
		console.log("\n🔍 Searching for browser installation...");
		const browserPaths = await findBrowserPaths(selectedBrowser, platformInfo);

		if (!browserPaths) {
			console.log("❌ Browser installation not found");
			console.log(
				"Please ensure your browser is properly installed and try again",
			);
			return null;
		}

		// Validate browser installation
		if (!(await validateBrowserInstallation(browserPaths))) {
			console.log("❌ Invalid browser installation (profiles.ini not found)");
			return null;
		}

		console.log("✅ Browser installation found");

		// Step 4: List available profiles
		console.log("\n📋 Loading browser profiles...");
		const profiles = await listBrowserProfiles(browserPaths);

		if (profiles.length === 0) {
			console.log("❌ No browser profiles found");
			console.log("Please create a profile in your browser first");
			return null;
		}

		// Step 5: Ask user to select a profile
		const selectedProfile = await selectBrowserProfile(profiles);

		if (!selectedProfile) {
			console.log("❌ No profile selected");
			return null;
		}

		// Step 6: Return the profile path for saving
		return formatProfileForPackageJson(selectedProfile);
	} catch (error) {
		console.error("❌ Error during browser profile setup:", error);
		return null;
	}
}
