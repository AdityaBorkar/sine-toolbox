#!/usr/bin/env bun

import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const CHANGELOG_PATH = resolve("CHANGELOG.md");

function main(): void {
	try {
		// Check if CHANGELOG.md exists
		if (!existsSync(CHANGELOG_PATH)) {
			console.log("ℹ️  No CHANGELOG.md found, skipping validation");
			process.exit(0);
		}

		// Check if it's a symlink change - skip validation for symlinks
		try {
			const typeChange = execSync(
				"git diff --cached --name-status CHANGELOG.md",
				{ encoding: "utf-8" }
			).trim();
			
			if (typeChange.startsWith("T\t")) {
				console.log("ℹ️  CHANGELOG.md is a type change (symlink), skipping validation");
				process.exit(0);
			}
		} catch (error) {
			// Ignore errors for type change detection
		}

		// Check if CHANGELOG.md is being modified
		let modifiedFiles: string;
		try {
			modifiedFiles = execSync("git diff --cached --name-only", {
				encoding: "utf-8",
			}).trim();
		} catch (error) {
			// If git diff fails, we're not in a git context, skip validation
			console.log("ℹ️  Not in git context, skipping changelog validation");
			process.exit(0);
		}

		if (!modifiedFiles.includes("CHANGELOG.md")) {
			console.log("ℹ️  CHANGELOG.md not modified, skipping validation");
			process.exit(0);
		}

		console.log("📋 Validating CHANGELOG.md changes...");

		// Get the diff for CHANGELOG.md
		const changelogDiff = execSync(
			"git diff --cached --unified=0 CHANGELOG.md",
			{ encoding: "utf-8" },
		);

		// Parse the diff to find modified line numbers
		const modifiedLines = parseModifiedLines(changelogDiff);
		if (modifiedLines.length === 0) {
			console.log("ℹ️  No content changes in CHANGELOG.md");
			process.exit(0);
		}

		// Read current CHANGELOG.md to find section boundaries
		const changelogContent = readFileSync(CHANGELOG_PATH, "utf-8");
		const unreleasedBoundaries = findUnreleasedBoundaries(changelogContent);

		// Validate that all changes are within UNRELEASED section
		const invalidLines = modifiedLines.filter(
			(lineNum) =>
				lineNum < unreleasedBoundaries.start ||
				lineNum > unreleasedBoundaries.end,
		);

		if (invalidLines.length > 0) {
			console.error("❌ CHANGELOG.md validation failed!");
			console.error("");
			console.error("🚫 Changes detected outside the UNRELEASED section:");
			console.error(`   Modified lines: ${invalidLines.join(", ")}`);
			console.error(`   UNRELEASED section: lines ${unreleasedBoundaries.start}-${unreleasedBoundaries.end}`);
			console.error("");
			console.error("✅ Please only modify content within the UNRELEASED section.");
			console.error("   Future releases will be managed automatically.");
			process.exit(1);
		}

		console.log("✅ CHANGELOG.md validation passed");
		console.log(
			`   All changes are within UNRELEASED section (lines ${unreleasedBoundaries.start}-${unreleasedBoundaries.end})`,
		);
	} catch (error) {
		console.error("❌ Error validating CHANGELOG.md:");
		console.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}

interface UnreleasedBoundaries {
	start: number;
	end: number;
}

function findUnreleasedBoundaries(content: string): UnreleasedBoundaries {
	const lines = content.split("\n");
	let unreleasedStart = -1;
	let unreleasedEnd = lines.length;

	// Find UNRELEASED section
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (line.match(/^##\s+UNRELEASED/i)) {
			unreleasedStart = i + 1; // Start after the heading
			break;
		}
	}

	if (unreleasedStart === -1) {
		throw new Error(
			"UNRELEASED section not found in CHANGELOG.md. Expected '## UNRELEASED' heading.",
		);
	}

	// Find the end of UNRELEASED section (next ## heading or end of file)
	for (let i = unreleasedStart; i < lines.length; i++) {
		const line = lines[i].trim();
		if (line.startsWith("## ") && !line.match(/^##\s+UNRELEASED/i)) {
			unreleasedEnd = i - 1; // End before the next section
			break;
		}
	}

	return {
		start: unreleasedStart + 1, // Convert to 1-indexed for git diff
		end: unreleasedEnd + 1, // Convert to 1-indexed for git diff
	};
}

function parseModifiedLines(diff: string): number[] {
	const modifiedLines: number[] = [];
	const lines = diff.split("\n");

	for (const line of lines) {
		// Look for hunk headers like @@ -5,7 +5,6 @@
		const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
		if (hunkMatch) {
			const startLine = parseInt(hunkMatch[1], 10);
			const lineCount = hunkMatch[2] ? parseInt(hunkMatch[2], 10) : 1;

			// Add all lines in this hunk that are additions or modifications
			for (let i = 0; i < lineCount; i++) {
				modifiedLines.push(startLine + i);
			}
		}
	}

	return [...new Set(modifiedLines)]; // Remove duplicates
}

if (import.meta.main) {
	main();
}