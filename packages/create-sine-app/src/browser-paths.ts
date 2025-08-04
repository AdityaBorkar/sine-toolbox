import { join } from "node:path";
import { $ } from "bun";

import type { SupportedBrowser } from "./browser-selection.js";
import type { PlatformInfo } from "./platform-utils.js";

export interface BrowserPaths {
	configPath: string;
	profilesPath: string;
}

export async function findBrowserPaths(
	browser: SupportedBrowser,
	platformInfo: PlatformInfo,
): Promise<BrowserPaths | null> {
	switch (browser) {
		case "zen":
			return await findZenBrowserPaths(platformInfo);
		default:
			throw new Error(`Unsupported browser: ${browser}`);
	}
}

async function findZenBrowserPaths(
	platformInfo: PlatformInfo,
): Promise<BrowserPaths | null> {
	const possiblePaths: string[] = [];

	if (platformInfo.isWSL && platformInfo.browserInstallLocation === "windows") {
		// Windows paths accessible from WSL
		const windowsUserProfile = await getWindowsUserProfile();
		if (windowsUserProfile) {
			possiblePaths.push(
				join(windowsUserProfile, "AppData", "Roaming", "zen"),
				join(windowsUserProfile, "AppData", "Local", "zen"),
				join(windowsUserProfile, ".zen"),
			);
		}
	} else if (platformInfo.os === "linux") {
		// Native Linux paths
		const homeDir = process.env.HOME || "/home/" + process.env.USER;
		possiblePaths.push(
			join(homeDir, ".zen"),
			join(homeDir, ".config", "zen"),
			join(homeDir, ".local", "share", "zen"),
		);
	} else if (platformInfo.os === "windows") {
		// Native Windows paths
		const userProfile = process.env.USERPROFILE || process.env.HOME;
		if (userProfile) {
			possiblePaths.push(
				join(userProfile, "AppData", "Roaming", "zen"),
				join(userProfile, "AppData", "Local", "zen"),
				join(userProfile, ".zen"),
			);
		}
	} else if (platformInfo.os === "darwin") {
		// macOS paths
		const homeDir = process.env.HOME;
		if (homeDir) {
			possiblePaths.push(
				join(homeDir, "Library", "Application Support", "zen"),
				join(homeDir, ".zen"),
			);
		}
	}

	// Check each possible path
	for (const basePath of possiblePaths) {
		try {
			const configFile = Bun.file(join(basePath, "profiles.ini"));
			if (await configFile.exists()) {
				return {
					configPath: basePath,
					profilesPath: basePath,
				};
			}
		} catch {}
	}

	return null;
}

async function getWindowsUserProfile(): Promise<string | null> {
	try {
		// Try to get Windows user profile path from WSL
		const result = await $`cmd.exe /c "echo %USERPROFILE%"`.text();
		const windowsPath = result.trim();

		// Convert Windows path to WSL path
		if (windowsPath.match(/^[A-Z]:\\/)) {
			const drive = windowsPath[0].toLowerCase();
			const path = windowsPath.slice(3).replace(/\\/g, "/");
			return `/mnt/${drive}/${path}`;
		}
	} catch {
		// Fallback: try common patterns
		const commonUsers = ["User", process.env.USER || ""];
		for (const user of commonUsers) {
			if (user) {
				const testPath = `/mnt/c/Users/${user}`;
				try {
					const testFile = Bun.file(testPath);
					if (await testFile.exists()) {
						return testPath;
					}
				} catch {}
			}
		}
	}

	return null;
}

export async function validateBrowserInstallation(
	paths: BrowserPaths,
): Promise<boolean> {
	try {
		const profilesIni = Bun.file(join(paths.configPath, "profiles.ini"));
		return await profilesIni.exists();
	} catch {
		return false;
	}
}
