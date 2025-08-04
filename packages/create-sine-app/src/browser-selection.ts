export type SupportedBrowser = "zen";

export interface BrowserInfo {
	name: string;
	displayName: string;
	description: string;
	isFirefoxBased: boolean;
}

export const SUPPORTED_BROWSERS: Record<SupportedBrowser, BrowserInfo> = {
	zen: {
		description: "A Firefox-based browser focused on privacy and customization",
		displayName: "Zen Browser",
		isFirefoxBased: true,
		name: "zen",
	},
};

export async function selectBrowser(): Promise<SupportedBrowser> {
	console.log("\n🌐 Browser Selection");
	console.log("Select a Firefox-based browser for development:");

	const browsers = Object.entries(SUPPORTED_BROWSERS);

	for (let i = 0; i < browsers.length; i++) {
		const [key, info] = browsers[i];
		console.log(`${i + 1}. ${info.displayName} - ${info.description}`);
	}

	if (browsers.length === 1) {
		console.log(
			`\nDefaulting to ${SUPPORTED_BROWSERS.zen.displayName} (only option available)`,
		);
		return "zen";
	}

	const response = prompt(`\nEnter your choice (1-${browsers.length}): `);
	const choice = Number.parseInt(response || "1") - 1;

	if (choice >= 0 && choice < browsers.length) {
		const selectedBrowser = browsers[choice][0] as SupportedBrowser;
		console.log(
			`✅ Selected: ${SUPPORTED_BROWSERS[selectedBrowser].displayName}`,
		);
		return selectedBrowser;
	}

	// Default to zen
	console.log(
		`⚠️  Invalid choice, defaulting to ${SUPPORTED_BROWSERS.zen.displayName}`,
	);
	return "zen";
}
