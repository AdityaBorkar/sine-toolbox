#!/usr/bin/env bun

import { parseArgs } from "node:util";
import { dev } from "./dev.js";
import { build } from "./build.js";

const args = parseArgs({
	args: Bun.argv.slice(2),
	options: {
		help: { type: "boolean", short: "h" },
		version: { type: "boolean", short: "v" },
		port: { type: "string", short: "p" },
		host: { type: "string" },
		watch: { type: "boolean", short: "w" },
		outdir: { type: "string", short: "o" },
		minify: { type: "boolean", short: "m" },
		clean: { type: "boolean", short: "c" },
	},
	allowPositionals: true,
});

const command = args.positionals[0];

if (args.values.help || !command) {
	console.log(`
sine-toolbox v0.0.1
A collection of tools for Sine

Usage:
  sine-toolbox <command> [options]

Commands:
  dev     Start development server
  build   Build the project for production

Options:
  -h, --help     Show help
  -v, --version  Show version

Dev Options:
  -p, --port     Port to run on (default: 3000)
  --host         Host to bind to (default: localhost)
  -w, --watch    Watch for file changes (default: true)

Build Options:
  -o, --outdir   Output directory (default: dist)
  -m, --minify   Minify output (default: true)
  -c, --clean    Clean output directory (default: true)
`);
	process.exit(0);
}

if (args.values.version) {
	console.log("0.0.1");
	process.exit(0);
}

switch (command) {
	case "dev": {
		const options = {
			port: parseInt(args.values.port || "3000"),
			host: args.values.host || "localhost",
			watch: args.values.watch !== false,
		};
		await dev(options);
		break;
	}
	case "build": {
		const options = {
			outdir: args.values.outdir || "dist",
			minify: args.values.minify !== false,
			clean: args.values.clean !== false,
		};
		await build(options);
		break;
	}
	default:
		console.error(`❌ Unknown command: ${command}`);
		console.log("Run 'sine-toolbox --help' for usage information.");
		process.exit(1);
}
