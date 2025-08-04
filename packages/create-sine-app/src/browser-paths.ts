import { join } from "node:path";
import { $, file } from "bun";

import Registry from "winreg";

import type { BrowserId } from "./functions/browser/get-browser-id.js";
import type { PlatformInfo } from "./functions/platform.js";
import { logger } from "./utils/logger.js";

export async function findBrowserPath({
	browser,
	platform,
}: {
	browser: BrowserId;
	platform: PlatformInfo;
}): Promise<string | null> {
	if (browser === "zen") {
		return await findZenPath(platform);
	}
	if (browser === "firefox") {
		return await findFirefoxPath(platform);
	}
	throw new Error(`Unsupported browser: ${browser}`);
}

async function findZenPath({
	os,
	isWsl,
}: PlatformInfo): Promise<string | null> {
	if (os === "windows") {
		const userProfile = await getWindowsUserProfile(isWsl);
		if (userProfile) {
			const possiblePaths = [
				join(userProfile, "AppData", "Roaming", "zen"),
				join(userProfile, "AppData", "Local", "zen"),
				join(userProfile, ".zen"),
			];

			for (const path of possiblePaths) {
				try {
					const testFile = file(path);
					if (await testFile.exists()) {
						return path;
					}
				} catch {}
			}
		}

		// Try registry lookup for Zen browser
		if (!isWsl) {
			const registryPath = await getFromRegistry(
				Registry.HKLM,
				"\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\zen.exe",
				"",
			);
			if (registryPath) {
				const configPath = join(registryPath, "..", "zen");
				try {
					const testFile = file(configPath);
					if (await testFile.exists()) {
						return configPath;
					}
				} catch {}
			}
		}
	}
	if (os === "linux") {
		const possiblePaths = [
			join(process.env.HOME || "", ".zen"),
			join(process.env.HOME || "", ".config", "zen"),
		];

		for (const path of possiblePaths) {
			try {
				const testFile = file(path);
				if (await testFile.exists()) {
					return path;
				}
			} catch {}
		}
	}
	if (os === "darwin") {
		const possiblePaths = [
			join(process.env.HOME || "", "Library", "Application Support", "zen"),
		];

		for (const path of possiblePaths) {
			try {
				const testFile = file(path);
				if (await testFile.exists()) {
					return path;
				}
			} catch {}
		}
	}
	return null;
}

async function findFirefoxPath({
	os,
	isWsl,
}: PlatformInfo): Promise<string | null> {
	if (os === "windows") {
		const userProfile = await getWindowsUserProfile(isWsl);
		if (userProfile) {
			const possiblePaths = [
				join(userProfile, "AppData", "Roaming", "Mozilla", "Firefox"),
				join(userProfile, "AppData", "Local", "Mozilla", "Firefox"),
			];

			for (const path of possiblePaths) {
				try {
					const testFile = file(path);
					if (await testFile.exists()) {
						return path;
					}
				} catch {}
			}
		}

		// Try registry lookup for Firefox
		if (!isWsl) {
			const registryPath = await getFromRegistry(
				Registry.HKLM,
				"\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\firefox.exe",
				"",
			);
			if (registryPath) {
				const configPath = join(registryPath, "..", "..", "Mozilla", "Firefox");
				try {
					const testFile = file(configPath);
					if (await testFile.exists()) {
						return configPath;
					}
				} catch {}
			}
		}
	}
	if (os === "linux") {
		const possiblePaths = [join(process.env.HOME || "", ".mozilla", "firefox")];

		for (const path of possiblePaths) {
			try {
				const testFile = file(path);
				if (await testFile.exists()) {
					return path;
				}
			} catch {}
		}
	}
	if (os === "darwin") {
		const possiblePaths = [
			join(process.env.HOME || "", "Library", "Application Support", "Firefox"),
		];

		for (const path of possiblePaths) {
			try {
				const testFile = file(path);
				if (await testFile.exists()) {
					return path;
				}
			} catch {}
		}
	}
	return null;
}

async function getWindowsUserProfile(isWsl: boolean): Promise<string | null> {
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
					const testFile = file(testPath);
					if (await testFile.exists()) {
						return testPath;
					}
				} catch {}
			}
		}
	}

	return null;
}

async function getFromRegistry(
	hive: Registry.Registry,
	key: string,
	name: string,
): Promise<string | null> {
	return new Promise((resolve) => {
		const reg = new Registry({
			hive,
			key,
		});

		reg.get(name, (err, item) => {
			if (err || !item) {
				resolve(null);
				return;
			}
			resolve(item.value);
		});
	});
}

export async function validateBrowserInstallation(paths: {
	configPath: string;
}): Promise<boolean> {
	try {
		const profilesIni = file(join(paths.configPath, "profiles.ini"));
		return await profilesIni.exists();
	} catch {
		return false;
	}
}
