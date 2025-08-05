#!/usr/bin/env bun

import { Command } from "commander";

import { build } from "./build.js";
import { dev } from "./dev.js";

const program = new Command();

program
	.name("sine-toolbox")
	.description("A collection of tools for Sine")
	.version("0.0.1");

program
	.command("dev")
	.description("Start development server")
	.option("-p, --port <port>", "Port to run on", "3000")
	.option("--host <host>", "Host to bind to", "localhost")
	.option("-w, --watch", "Watch for file changes", true)
	.option("--no-watch", "Disable file watching")
	.action(async (options) => {
		await dev({
			host: options.host,
			port: Number.parseInt(options.port, 10),
			watch: options.watch,
		});
	});

program
	.command("build")
	.description("Build the project for production")
	.option("-o, --outdir <dir>", "Output directory", "dist")
	.option("-m, --minify", "Minify output", true)
	.option("--no-minify", "Disable minification")
	.option("-c, --clean", "Clean output directory", true)
	.option("--no-clean", "Don't clean output directory")
	.action(async (options) => {
		await build({
			clean: options.clean,
			minify: options.minify,
			outdir: options.outdir,
		});
	});

program.parse();
