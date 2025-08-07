#!/usr/bin/env bun

import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";

const exec = (cmd: string) => execSync(cmd, { encoding: "utf-8" }).trim();

function exit(code: number, msg?: string) {
	if (msg) console.log(msg);
	process.exit(code);
}

try {
	if (!existsSync("CHANGELOG.md"))
		exit(0, "ℹ️  No CHANGELOG.md found, skipping validation");

	// Skip symlink changes and non-git contexts
	try {
		if (
			exec("git diff --cached --name-status CHANGELOG.md").startsWith("T\t")
		) {
			exit(
				0,
				"ℹ️  CHANGELOG.md is a type change (symlink), skipping validation",
			);
		}
		if (!exec("git diff --cached --name-only").includes("CHANGELOG.md")) {
			exit(0, "ℹ️  CHANGELOG.md not modified, skipping validation");
		}
	} catch {
		exit(0, "ℹ️  Not in git context, skipping changelog validation");
	}

	console.log("📋 Validating CHANGELOG.md changes...");

	// Parse modified lines from diff
	const diff = exec("git diff --cached --unified=0 CHANGELOG.md");
	const modifiedLines = diff
		.split("\n")
		.map((line) => line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/))
		.filter(Boolean)
		.flatMap((match) => {
			const start = parseInt(match![1]);
			const count = match![2] ? parseInt(match![2]) : 1;
			return Array.from({ length: count }, (_, i) => start + i);
		});

	if (!modifiedLines.length) exit(0, "ℹ️  No content changes in CHANGELOG.md");

	// Find UNRELEASED section boundaries
	const lines = readFileSync("CHANGELOG.md", "utf-8").split("\n");
	const unreleasedIdx = lines.findIndex((line) =>
		/^##\s+UNRELEASED/i.test(line.trim()),
	);

	if (unreleasedIdx === -1) {
		throw new Error(
			"UNRELEASED section not found in CHANGELOG.md. Expected '## UNRELEASED' heading.",
		);
	}

	const nextSectionIdx = lines
		.slice(unreleasedIdx + 1)
		.findIndex(
			(line) =>
				line.trim().startsWith("## ") && !/^##\s+UNRELEASED/i.test(line.trim()),
		);

	const start = unreleasedIdx + 2; // +1 for section start, +1 for 1-indexed
	const end =
		nextSectionIdx === -1 ? lines.length : unreleasedIdx + nextSectionIdx + 1;

	// Validate changes are within UNRELEASED section
	const invalidLines = modifiedLines.filter(
		(line) => line < start || line > end,
	);

	if (invalidLines.length) {
		console.error("❌ CHANGELOG.md validation failed!");
		console.error(
			`🚫 Changes outside UNRELEASED section: lines ${invalidLines.join(", ")}`,
		);
		console.error(`✅ UNRELEASED section: lines ${start}-${end}`);
		exit(1);
	}

	console.log(`✅ CHANGELOG.md validation passed (lines ${start}-${end})`);
} catch (error) {
	console.error(
		"❌ Error validating CHANGELOG.md:",
		error instanceof Error ? error.message : String(error),
	);
	process.exit(1);
}
