import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { $, file, write } from "bun";

import { getProfilePath } from "./functions/browser/get-profile-path.js";
import { getProjectName } from "./functions/get-project-name.js";
import { getTemplateId } from "./functions/get-template-id.js";
import {
	detectPackageManager,
	selectPackageManager,
} from "./functions/package-manager.js";
import { logger } from "./utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __templatesPath = join(__dirname, "../templates");

interface CreateSineModOptions {
	template?: string;
	packageManager?: string;
	skipInstall?: boolean;
}

export async function createSineMod(
	name?: string,
	options: CreateSineModOptions = {},
) {
	const projectName = await getProjectName(name);
	const projectPath = resolve(projectName);
	const templateName = await getTemplateId(options.template);

	logger.newline();
	logger.log(
		`🚀 Creating Sine Mod (${templateName}): "${projectName}" (${projectPath})`,
	);

	// Create project directory
	{
		const spinner = logger.start("Creating project directory...");
		await $`mkdir -p ${projectPath}`;
		spinner.succeed("Created project directory successfully");
	}

	// Copy template files with spinners
	{
		const spinner = logger.start("Copying template files...");

		const commonPath = join(__templatesPath, "/common");
		logger.update("Copying common template files...");
		await $`cp -r ${commonPath}/* ${projectPath}/`;

		const templatePath = join(__templatesPath, templateName);
		logger.update(`Copying "${templateName}" template files...`);
		await $`cp -r ${templatePath}/* ${projectPath}/`;

		spinner.succeed("Template files copied successfully");
	}

	// Update package.json with project name
	const packageJsonPath = join(projectPath, "package.json");
	const packageJsonFile = file(packageJsonPath);
	if (await packageJsonFile.exists()) {
		const packageJson = await packageJsonFile.json();
		packageJson.name = projectName;
		await write(packageJsonPath, JSON.stringify(packageJson, null, 2));
		logger.info("Updated package.json with project name");
	}

	// Skip installation if requested
	if (options.skipInstall) {
		logger.info("Skipping dependency installation as requested");
	} else {
		// Detect or select package manager
		const pm = await (options.packageManager ||
			detectPackageManager() ||
			selectPackageManager());
		const spinner = logger.start(`Installing dependencies with ${pm}...`);
		try {
			spinner.text = `Running ${pm} install...`;
			const output = await $`cd ${projectPath} && ${pm} install`.text();
			logger.silentLog(output);
			spinner.succeed("Dependencies installed successfully");
		} catch (error) {
			spinner.fail("Failed to install dependencies");
			logger.error(String(error));
			logger.warn(
				`You can run "${pm} install" manually in the project directory`,
			);
		}
	}

	// Setup browser profile
	logger.newline();
	const profilePath = await getProfilePath();
	if (profilePath) {
		const packageJsonFile = file(packageJsonPath);
		if (await packageJsonFile.exists()) {
			const packageJson = await packageJsonFile.json();
			packageJson.browser_profiles = [profilePath];
			await write(packageJsonPath, JSON.stringify(packageJson, null, 2));
			logger.info("Updated package.json with browser profile");
		}
	} else {
		logger.warn(
			"Skipping browser profile detection - you can set it manually as 'browser_profile_path' in package.json",
		);
	}

	// Success message
	logger.newline();
	logger.log("🎉 Sine mod created successfully!");
	logger.newline();
	logger.info("Next steps:");
	logger.log(`\t• cd "${projectName}"`);
	if (options.skipInstall) {
		logger.log("\t• npm install (or your preferred package manager)");
	}
	logger.log("\t• npm run dev (or your preferred package manager)");
	logger.log("\t• code . (or your preferred editor)");
	logger.newline();
	logger.success("🎉 Happy coding! 🚀");
}
