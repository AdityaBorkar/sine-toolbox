import { join } from "node:path";

import type { BrowserPaths } from "./browser-paths.js";

export interface BrowserProfile {
	name: string;
	displayName: string;
	path: string;
	isDefault: boolean;
}

export async function listBrowserProfiles(
	browserPaths: BrowserPaths,
): Promise<BrowserProfile[]> {
	try {
		const profilesIniPath = join(browserPaths.configPath, "profiles.ini");
		const profilesFile = Bun.file(profilesIniPath);

		if (!(await profilesFile.exists())) {
			throw new Error("profiles.ini not found");
		}

		const profilesContent = await profilesFile.text();
		return parseFirefoxProfiles(profilesContent, browserPaths.profilesPath);
	} catch (error) {
		console.error("❌ Failed to read browser profiles:", error);
		return [];
	}
}

function parseFirefoxProfiles(
	profilesIni: string,
	basePath: string,
): BrowserProfile[] {
	const profiles: BrowserProfile[] = [];
	const lines = profilesIni.split("\n").map((line) => line.trim());

	let currentSection: string | null = null;
	let currentProfile: Partial<BrowserProfile> = {};

	for (const line of lines) {
		if (line.startsWith("[") && line.endsWith("]")) {
			// Save previous profile if it was a profile section
			if (currentSection?.startsWith("Profile") && currentProfile.name) {
				profiles.push({
					displayName: currentProfile.displayName || currentProfile.name,
					isDefault: currentProfile.isDefault || false,
					name: currentProfile.name,
					path: currentProfile.path || "",
				});
			}

			// Start new section
			currentSection = line.slice(1, -1);
			currentProfile = {};
		} else if (line.includes("=") && currentSection?.startsWith("Profile")) {
			const [key, value] = line.split("=", 2);

			switch (key.toLowerCase()) {
				case "name":
					currentProfile.displayName = value;
					break;
				case "path":
					// Handle both relative and absolute paths
					if (value.startsWith("/") || value.match(/^[A-Z]:/)) {
						currentProfile.path = value;
					} else {
						currentProfile.path = join(basePath, value);
					}
					currentProfile.name = value.split(/[/\\]/).pop() || value;
					break;
				case "default":
					currentProfile.isDefault = value === "1";
					break;
			}
		}
	}

	// Don't forget the last profile
	if (currentSection?.startsWith("Profile") && currentProfile.name) {
		profiles.push({
			displayName: currentProfile.displayName || currentProfile.name,
			isDefault: currentProfile.isDefault || false,
			name: currentProfile.name,
			path: currentProfile.path || "",
		});
	}

	return profiles;
}

export async function selectBrowserProfile(
	profiles: BrowserProfile[],
): Promise<BrowserProfile | null> {
	if (profiles.length === 0) {
		console.log("❌ No browser profiles found");
		return null;
	}

	console.log("\n📁 Available Browser Profiles:");

	// Sort profiles to show default first
	const sortedProfiles = [...profiles].sort((a, b) => {
		if (a.isDefault && !b.isDefault) return -1;
		if (!a.isDefault && b.isDefault) return 1;
		return a.displayName.localeCompare(b.displayName);
	});

	for (let i = 0; i < sortedProfiles.length; i++) {
		const profile = sortedProfiles[i];
		const defaultLabel = profile.isDefault ? " (default)" : "";
		console.log(`${i + 1}. ${profile.displayName}${defaultLabel}`);
		console.log(`   Path: ${profile.path}`);
	}

	const response = prompt(`\nSelect a profile (1-${sortedProfiles.length}): `);
	const choice = Number.parseInt(response || "1") - 1;

	if (choice >= 0 && choice < sortedProfiles.length) {
		const selectedProfile = sortedProfiles[choice];
		console.log(`✅ Selected profile: ${selectedProfile.displayName}`);

		// Validate the profile directory exists
		if (await validateProfilePath(selectedProfile.path)) {
			return selectedProfile;
		}
		console.log("⚠️  Warning: Selected profile directory does not exist");
		console.log("   This may cause issues during development");
		return selectedProfile; // Return anyway, user might fix it later
	}

	console.log("❌ Invalid selection");
	return null;
}

async function validateProfilePath(profilePath: string): Promise<boolean> {
	try {
		const profileDir = Bun.file(profilePath);
		return await profileDir.exists();
	} catch {
		return false;
	}
}

export function formatProfileForPackageJson(profile: BrowserProfile): string {
	return profile.path;
}
