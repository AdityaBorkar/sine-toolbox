import { $ } from "bun";

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

export async function askBrowserInstallLocation(): Promise<
	"windows" | "linux"
> {
	console.log("\n🔍 Detecting browser installation location...");
	console.log(
		"Since you're running on WSL, where is your Zen browser installed?",
	);
	console.log("1. Windows (recommended for GUI access)");
	console.log("2. Linux (WSL environment)");

	const response = prompt("Enter your choice (1-2): ");

	if (response === "2") {
		return "linux";
	}

	// Default to Windows for WSL users
	return "windows";
}
