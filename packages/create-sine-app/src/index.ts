#!/usr/bin/env bun

import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { $, file, write } from "bun";

import { program } from "commander";

import { setupBrowserProfile } from "./browser-setup.js";
import {
	detectPackageManager,
	selectPackageManager,
} from "./utils/detect-package-manager.js";
import { logger } from "./utils/logger.js";
import { getValidProjectName } from "./utils/project-name-input.js";
import { selectTemplate } from "./utils/template-selection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __templatesPath = join(__dirname, "../templates");

interface CreateSineAppOptions {
	template?: string;
	packageManager?: string;
	skipInstall?: boolean;
}

async function createSineApp(
	projectName?: string,
	options: CreateSineAppOptions = {},
) {
	// Get valid project name with interactive retry
	const validProjectName = await getValidProjectName(projectName);
	const projectPath = resolve(validProjectName);

	// Select template (from CLI option or interactively)
	const templateName = await selectTemplate(__templatesPath, options.template);

	logger.creating(`Creating Sine app: ${validProjectName}`);

	// Create project directory with spinner
	const createDirSpinner = logger.startSpinner("Creating project directory...");
	await $`mkdir -p ${projectPath}`;
	createDirSpinner.succeed(`Created project directory: ${projectPath}`);

	// Copy template files with spinners
	const copySpinner = logger.startSpinner("Copying template files...");

	// Copy common files
	const commonPath = join(__templatesPath, "common");
	const commonDir = file(commonPath);
	if (await commonDir.exists()) {
		logger.updateSpinner("Copying common template files...");
		await $`cp -r ${commonPath}/* ${projectPath}/`;
	}

	// Copy selected template files
	const templatePath = join(__templatesPath, templateName);
	const templateDir = file(templatePath);
	if (await templateDir.exists()) {
		logger.updateSpinner(`Copying ${templateName} template files...`);
		await $`cp -r ${templatePath}/* ${projectPath}/`;
	}

	copySpinner.succeed("Template files copied successfully");

	// Update package.json with project name
	const packageJsonPath = join(projectPath, "package.json");
	const packageJsonFile = file(packageJsonPath);
	if (await packageJsonFile.exists()) {
		const packageJson = await packageJsonFile.json();
		packageJson.name = validProjectName;
		await write(packageJsonPath, JSON.stringify(packageJson, null, 2));
		logger.file("Updated package.json with project name");
	}

	// Setup browser profile
	const browserProfilePath = await setupBrowserProfile();
	if (browserProfilePath) {
		const packageJsonFile = file(packageJsonPath);
		if (await packageJsonFile.exists()) {
			const packageJson = await packageJsonFile.json();
			packageJson.browser_profiles = [browserProfilePath];
			await write(packageJsonPath, JSON.stringify(packageJson, null, 2));
			logger.file("Updated package.json with browser profile");
		}
	} else {
		logger.warn("Skipping browser profile setup - you can configure it later");
	}

	// Skip installation if requested
	if (options.skipInstall) {
		logger.info("Skipping dependency installation as requested");
	} else {
		// Detect or select package manager
		let pm = options.packageManager || detectPackageManager();
		if (!pm) {
			pm = await selectPackageManager();
		}

		// Validate package manager option if provided
		if (
			options.packageManager &&
			!["npm", "yarn", "pnpm", "bun"].includes(options.packageManager)
		) {
			logger.error(`Invalid package manager: ${options.packageManager}`);
			logger.info("Valid options: npm, yarn, pnpm, bun");
			process.exit(1);
		}

		logger.package(`Installing dependencies using ${pm}...`);

		// Install dependencies with spinner
		const installSpinner = logger.startSpinner(
			`Installing dependencies with ${pm}...`,
		);
		try {
			installSpinner.text = `Running ${pm} install...`;
			await $`cd ${projectPath} && ${pm} install`;
			installSpinner.succeed("Dependencies installed successfully");
		} catch (error) {
			installSpinner.fail("Failed to install dependencies");
			logger.error(String(error));
			logger.warn(
				`You can run "${pm} install" manually in the project directory`,
			);
		}
	}

	// Success message
	logger.newline();
	logger.celebration("Sine app created successfully!");
	const nextSteps = [`cd ${validProjectName}`];
	if (options.skipInstall) {
		nextSteps.push("npm install (or your preferred package manager)");
	}
	nextSteps.push("npm run dev (or your package manager's equivalent)");

	logger.steps("Next steps:", nextSteps);
	logger.newline();
	logger.info("Happy coding! 🚀");
}

program
	.name("create-sine-app")
	.description("Create a new Sine Toolbox project")
	.argument(
		"[project-name]",
		"Name of the project to create (optional - will prompt if not provided)",
	)
	.option("-t, --template <template>", "Template to use (basic)")
	.option(
		"-p, --package-manager <pm>",
		"Package manager to use (npm, yarn, pnpm, bun)",
	)
	.option("--skip-install", "Skip dependency installation")
	.action(createSineApp);

program.parse();
