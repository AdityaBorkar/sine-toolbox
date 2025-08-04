import { join } from "node:path";
import { existsSync } from "node:fs";
import { file } from "bun";
import inquirer from "inquirer";
import { logger } from "./logger.js";

interface Template {
	name: string;
	description: string;
	value: string;
}

const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
	basic: "Basic Sine App - Simple starter template with essential files",
};

export async function getAvailableTemplates(templatesPath: string): Promise<Template[]> {
	if (!existsSync(templatesPath)) {
		logger.error("Templates directory not found");
		return [];
	}

	const templates: Template[] = [];
	
	// For now, we'll manually define available templates
	// In the future, this could scan the directory
	const availableTemplates = ["basic"];
	
	for (const templateName of availableTemplates) {
		const templatePath = join(templatesPath, templateName);
		
		if (existsSync(templatePath)) {
			templates.push({
				name: templateName,
				description: TEMPLATE_DESCRIPTIONS[templateName] || `${templateName} template`,
				value: templateName,
			});
		}
	}
	
	return templates;
}

export async function selectTemplate(templatesPath: string, providedTemplate?: string): Promise<string> {
	// If template is provided via CLI, validate and return it
	if (providedTemplate) {
		const templates = await getAvailableTemplates(templatesPath);
		const isValid = templates.some(t => t.value === providedTemplate);
		
		if (isValid) {
			logger.info(`Using template: ${providedTemplate}`);
			return providedTemplate;
		} else {
			logger.error(`Invalid template: ${providedTemplate}`);
			logger.info(`Available templates: ${templates.map(t => t.value).join(", ")}`);
			process.exit(1);
		}
	}
	const templates = await getAvailableTemplates(templatesPath);
	
	if (templates.length === 0) {
		logger.error("No templates available");
		process.exit(1);
	}
	
	if (templates.length === 1) {
		logger.info(`Using template: ${templates[0].name}`);
		return templates[0].value;
	}
	
	logger.newline();
	logger.info("Select a template for your Sine app:");
	logger.newline();

	const { template } = await inquirer.prompt([
		{
			type: "list",
			name: "template",
			message: "Which template would you like to use?",
			choices: templates.map((t) => ({
				name: t.description,
				value: t.value,
			})),
			default: templates[0].value,
		},
	]);

	return template;
}