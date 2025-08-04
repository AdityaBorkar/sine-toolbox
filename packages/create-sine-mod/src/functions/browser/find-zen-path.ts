import { exists, readdir } from "node:fs/promises";
import { join } from "node:path";
import { $, file } from "bun";

import { logger } from "../../utils/logger.js";
import type { PlatformInfo } from "../platform.js";

export async function findZenPath({
	os,
	isWsl,
}: PlatformInfo): Promise<{ basePath: string; profiles: string[] } | null> {
	if (os === "windows") {
		return await findZenPathWindows(isWsl);
	}
	if (os === "linux") {
		logger.error("Linux is not supported yet");
		return null;
	}
	if (os === "darwin") {
		logger.error("MacOS is not supported yet");
		return null;
	}
	return null;
}

async function findZenPathWindows(
	isWsl: boolean,
): Promise<{ basePath: string; profiles: string[] } | null> {
	// Try common Program Files locations
	// const systemDrive = isWsl ? "/mnt/c" : "C:";
	const userProfile = await getWindowsUserProfile(isWsl);
	if (!userProfile) {
		return null;
	}

	const PossibleInstallationPaths = [
		"AppData\\Roaming\\zen",
		"AppData\\Local\\zen",
		".zen",
		"Program Files\\Zen Browser\\zen",
		"Program Files (x86)\\Zen Browser\\zen",
		"Program Files\\zen\\zen",
		"Program Files (x86)\\zen\\zen",
	];
	for (const path of PossibleInstallationPaths) {
		const basePath = join(userProfile, isWsl ? toWslPath(path) : path);
		if (await exists(basePath)) {
			const profilesIni = file(join(basePath, "profiles.ini"));
			if (await profilesIni.exists()) {
				const profilesDir = join(basePath, "Profiles");
				if (await exists(profilesDir)) {
					const profileFiles = await readdir(profilesDir);
					const profiles = profileFiles.map((name) => name);
					return { basePath, profiles };
				}
			}
		}
	}

	// Try registry lookup for Zen browser (only when not in WSL)
	// if (!isWsl) {
	// 	const Registry = (await import("winreg")).default;
	// 	const registryPath = await getFromRegistry(
	// 		Registry.HKLM,
	// 		"\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\zen.exe",
	// 		"",
	// 	);
	// 	if (registryPath) {
	// 		// Extract directory from executable path and look for config
	// 		const zenDir = join(registryPath, "..");
	// 		const configPath = join(zenDir, "zen");
	// 		try {
	// 			const testFile = file(configPath);
	// 			if (await testFile.exists()) {
	// 				const profilesIni = file(join(configPath, "profiles.ini"));
	// 				if (await profilesIni.exists()) {
	// 					return configPath;
	// 				}
	// 			}
	// 		} catch {}
	// 	}
	// }

	return null;
}

function toWslPath(path: string): string {
	return path.replace(/\\/g, "/");
}

const WINDOWS_PATH_REGEX = /^[A-Z]:\\/;

async function getWindowsUserProfile(isWsl: boolean): Promise<string | null> {
	if (isWsl) {
		try {
			// Get Windows user profile path from WSL
			const result = await $`cmd.exe /c "echo %USERPROFILE%"`.text();
			const windowsPath = result.trim();

			// Convert Windows path to WSL path
			if (windowsPath.match(WINDOWS_PATH_REGEX)) {
				const drive = windowsPath[0].toLowerCase();
				const rest = windowsPath.slice(3).replace(/\\/g, "/");
				return join("/mnt", drive, rest);
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
	} else {
		// Running on native Windows
		const userProfile = process.env.USERPROFILE;
		if (userProfile) {
			return userProfile;
		}
	}

	return null;
}

// async function getFromRegistry(
// 	hive: any,
// 	key: string,
// 	name: string,
// ): Promise<string | null> {
// 	const Registry = (await import("winreg")).default;
// 	return new Promise((resolve) => {
// 		const reg = new Registry({
// 			hive,
// 			key,
// 		});

// 		reg.get(name, (err: any, item: any) => {
// 			if (err || !item) {
// 				resolve(null);
// 				return;
// 			}
// 			resolve(item.value);
// 		});
// 	});
// }
