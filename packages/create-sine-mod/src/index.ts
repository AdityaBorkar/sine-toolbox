#!/usr/bin/env bun

import { program } from "commander";

import { createSineMod } from "./create-sine-mod.js";

program
	.name("create-sine-mod")
	.description("Create a new Sine Mod project")
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
	.action(createSineMod);

program.parse();
