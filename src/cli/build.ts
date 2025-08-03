import { $ } from "bun";
import { rmSync, existsSync } from "node:fs";
import { getConfig } from "../utils/getConfig.js";

interface BuildOptions {
	outdir: string;
	minify: boolean;
	clean: boolean;
}

export async function build(options: BuildOptions) {
	console.log("🔨 Building project for production...");

	// Load configuration
	await getConfig();

	try {
		// Clean output directory if requested
		if (options.clean && existsSync(options.outdir)) {
			console.log(`🧹 Cleaning output directory: ${options.outdir}`);
			rmSync(options.outdir, { recursive: true, force: true });
		}

		// Build with Bun
		const buildArgs = [
			"build",
			"index.ts",
			`--outdir=${options.outdir}`,
			"--target=bun",
			"--format=esm",
		];

		if (options.minify) {
			buildArgs.push("--minify");
		}

		console.log("📦 Building with Bun...");
		await $`bun ${buildArgs}`;

		console.log("✅ Build completed successfully!");
		console.log(`📁 Output directory: ${options.outdir}`);
	} catch (error) {
		console.error("❌ Build failed:", error);
		process.exit(1);
	}
}
