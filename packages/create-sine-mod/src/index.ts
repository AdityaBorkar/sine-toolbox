#!/usr/bin/env bun

import { program } from "commander";

import { createSineApp } from "./create-sine-app.ts";

program
	.name("create-sine-app")
	.description("Create a new Sine Toolbox project")
	.argument(
		"[project-name]",
		"Name of the project to create (optional - will prompt if not provided)",
	)
	.option("-t, --template <template>", "Template to use (basic)")
	.option(
		"--package-manager <pm>",
		"Package manager to use (npm, yarn, pnpm, bun)",
	)
	.option("--skip-install", "Skip dependency installation")
	.action(createSineApp);

program.parse();
