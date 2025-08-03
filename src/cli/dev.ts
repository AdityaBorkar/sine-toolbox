import { $ } from "bun";
import { getConfig } from "../utils/getConfig.js";

interface DevOptions {
	port: number;
	host: string;
	watch: boolean;
}

export async function dev(options: DevOptions) {
	console.log("🚀 Starting development server...");

	// Load configuration
	await getConfig();

	console.log(`📡 Server will run on http://${options.host}:${options.port}`);
	console.log(`👀 File watching: ${options.watch ? "enabled" : "disabled"}`);

	try {
		// Start development server with hot reload
		const args = [
			"--hot",
			`--port=${options.port}`,
			`--hostname=${options.host}`,
		];

		if (options.watch) {
			args.push("--watch");
		}

		console.log("💫 Starting Bun development server...");
		await $`bun run ${args} index.ts`;
	} catch (error) {
		console.error("❌ Development server failed:", error);
		process.exit(1);
	}
}
