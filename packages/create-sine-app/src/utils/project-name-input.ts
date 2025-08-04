import { resolve } from "node:path";
import { file } from "bun";
import inquirer from "inquirer";
import { logger } from "./logger.js";
import { validatePackageName } from "./validate-package-name.js";

export async function getValidProjectName(initialName?: string): Promise<string> {
	let projectName = initialName;

	while (true) {
		// If no initial name provided, prompt for one
		if (!projectName) {
			logger.newline();
			const { name } = await inquirer.prompt([
				{
					type: "input",
					name: "name",
					message: "What is the name of your project?",
					validate: (input: string) => {
						if (!input.trim()) {
							return "Project name cannot be empty";
						}
						return true;
					},
				},
			]);
			projectName = name.trim();
		}

		// Validate project name
		if (!projectName || !validatePackageName(projectName)) {
			logger.error(`Invalid project name: "${projectName || 'undefined'}"`);
			logger.warn("Project name must be:");
			logger.info("• Lowercase alphanumeric with dashes/underscores");
			logger.info("• Maximum 214 characters");
			logger.info("• Start and end with alphanumeric characters");
			
			projectName = undefined; // Reset to prompt again
			continue;
		}

		// Check if directory already exists
		const projectPath = resolve(projectName);
		const projectDir = file(projectPath);
		if (await projectDir.exists()) {
			logger.error(`Directory "${projectName}" already exists`);
			logger.warn("Please choose a different name");
			
			projectName = undefined; // Reset to prompt again
			continue;
		}

		// All validations passed
		return projectName;
	}
}