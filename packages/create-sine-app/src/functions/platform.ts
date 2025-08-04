import { $ } from "bun";

export interface PlatformInfo {
	os: "linux" | "windows" | "darwin";
	isWsl: boolean;
}

export async function detectPlatform(): Promise<PlatformInfo> {
	const platform = process.platform;

	if (platform === "win32") {
		return { isWsl: false, os: "windows" };
	}
	if (platform === "darwin") {
		return { isWsl: false, os: "darwin" };
	}
	const isWsl = await detectWsl();
	return { isWsl, os: "linux" };
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
