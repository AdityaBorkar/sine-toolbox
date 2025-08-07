import { join } from "node:path";
import Cerebras from "@cerebras/cerebras_cloud_sdk";
import { $, file, write } from "bun";
import chalk from "chalk";
import ora from "ora";
import prompts from "prompts";

const PACKAGE_PATHS = ["packages/create-sine-mod", "packages/sine-mod"];
const cerebras = new Cerebras({ apiKey: process.env.CEREBRAS_API_KEY });

// @ts-expect-error import.meta is not supported.
if (import.meta.main) {
	main();
}

async function main(): Promise<void> {
	try {
		// Add all files to git
		await $`git add .`;
		await $`git hook run pre-commit`;

		// Store commit messages for each package
		const commits: {
			message: string;
			description: string;
			path: string;
		}[] = [];

		// Generate commit messages for each package
		for await (const path of PACKAGE_PATHS) {
			const spinner = ora({
				prefixText: `${chalk.bold("- Package")} (${path})`,
				text: `Checking git status...`,
			}).start();

			// Check git status
			const status = await $`git status --porcelain ${path}`.text();
			const diff = await $`git diff --cached ${path}`.text();
			if (!status.trim()) {
				spinner.warn(chalk.yellow("No changes to commit"));
				continue;
			}

			// Generate commit message with AI
			spinner.start("Generating changelog entry...");
			const commit = await generateChangelog(status, diff);
			commits.push({ ...commit, path });
			spinner.succeed("Changelog entry generated!");
			console.log(chalk.bold("  Summary:"), commit.message);
			console.log(chalk.bold("  Description:"), commit.description);
			console.log();

			// Write to CHANGELOG.md
			const changelog = file(join(process.cwd(), path, "CHANGELOG.md"));
			const lines = (await changelog.text()).split("\n");
			const entry = `- **${commit.message}**\n  ${commit.description}`;
			lines.splice(6, 0, entry);
			await changelog.write(lines.join("\n"));
			await $`git add ${path}/CHANGELOG.md`;
		}

		// Check git status
		const monorepoPaths = `!(${PACKAGE_PATHS.join("|")})/**`;
		const status = await $`git status --porcelain ${monorepoPaths}`.text();
		const diff = await $`git diff --cached ${monorepoPaths}`.text();

		// Generate commit message with AI
		const spinner = ora("Generating Commit Message...").start();
		let commit_msg = await generateCommitMessage({
			monorepo: { status, diff },
			packages: commits,
		});
		spinner.succeed("Commit message generated!");
		console.log(chalk.bold("Message:"), commit_msg);

		// Confirm with user
		const { proceed } = await prompts({
			type: "confirm",
			name: "proceed",
			message: "Use this commit message?",
			initial: true,
		});

		if (!proceed) {
			// Get custom message and description
			const customInputs = await prompts([
				{
					type: "text",
					name: "message",
					message: "Enter commit message:",
					initial: commit_msg,
					validate: (value) =>
						value.trim() ? true : "Message cannot be empty",
				},
			]);

			if (!customInputs.message) {
				throw new Error("No user input provided.");
			}

			commit_msg = customInputs.message.trim();
		}

		// Commit with message and optional description first
		const commitSpinner = ora("Committing changes...").start();
		await $`git commit -m "${commit_msg}"`;
		commitSpinner.succeed(chalk.green("Commit successful!"));
	} catch (error: unknown) {
		write("./report.pre-commit-error.json", JSON.stringify(error, null, 2));
		ora().fail(chalk.red("Failed to commit"));
		process.exit(1);
	}
}

async function generateChangelog(status: string, diff: string) {
	const PROMPT = `You are a senior developer tasked to generate only commit message. Your task is to generate a conventional commit message based on the git changes provided.

Follow these rules when generating the commit message:
1. Use the conventional commits format: type(scope): description
2. Choose from these types: feat, fix, docs, style, refactor, perf, test, build, ci, chore
3. Keep the description under 50 characters
4. Use imperative mood (e.g., "add", "fix", "update" instead of "added", "fixed", "updated")
5. Do not include punctuation at the end of the description
6. If there are multiple types of changes, choose the most significant one
7. Avoid ambiguous messages like "update" or "fix"

Analyze the git status and diff provided. Pay attention to the files changed, lines added or removed, and the nature of the changes.

To choose the commit type:
- Use "feat" for new features
- Use "fix" for bug fixes
- Use "docs" for documentation changes
- Use "style" for formatting, missing semi colons, etc.
- Use "refactor" for code refactoring
- Use "perf" for performance improvements
- Use "test" for adding or modifying tests
- Use "build" for build system changes
- Use "ci" for CI configuration changes
- Use "chore" for other changes that don't modify src or test files

Determine the scope based on the affected area of the codebase (e.g., component name, module, or feature). If the scope applies to entire repository, skip the scope.

Write a concise and meaningful description of the change, focusing on the "why" rather than the "what".

After generating the commit message, write a more detailed, human-readable description of the changes for product teams. This description should explain the purpose and impact of the changes in plain and concise language.

Generate only the commit message and human-readable description as specified above, nothing else.
`;

	const stream = await cerebras.chat.completions.create({
		max_completion_tokens: 10000,
		messages: [
			{ content: PROMPT, role: "system" },
			{
				content: `<git_status>\n${status}\n</git_status>\n\n<git_diff>\n${diff}\n</git_diff>`,
				role: "user",
			},
		],
		model: "gpt-oss-120b",
		response_format: {
			type: "json_schema",
			json_schema: {
				name: "commit",
				schema: {
					type: "object",
					properties: {
						message: { type: "string" },
						description: { type: "string" },
					},
					required: ["message", "description"],
					additionalProperties: false,
				},
			},
		},
		reasoning_effort: "medium",
		stream: false,
		temperature: 1,
		n: 1,
		top_p: 1,
	});
	const commit = JSON.parse(stream.choices[0]?.message.content || "{}");
	if (!commit.message || !commit.description) {
		throw new Error("No response from AI");
	}
	return commit as {
		message: string;
		description: string;
	};
}

async function generateCommitMessage(props: {
	monorepo: { status: string; diff: string };
	packages: { path: string; message: string; description: string }[];
}) {
	const { monorepo, packages } = props;
	const PROMPT = `You are a senior developer tasked to generate only commit message. Your task is to generate a conventional commit message based on the git changes provided.

Follow these rules when generating the commit message:
1. Use the conventional commits format: type: description
2. Choose from these types: feat, fix, docs, style, refactor, perf, test, build, ci, chore
3. Keep the description under 50 characters
4. Use imperative mood (e.g., "add", "fix", "update" instead of "added", "fixed", "updated")
5. Do not include punctuation at the end of the description
6. If there are multiple types of changes, choose the most significant one
7. Avoid ambiguous messages like "update" or "fix"

Analyze the git commits, git status and diff provided in the monorepo and the packages. Pay attention to the files changed, lines added or removed, and the nature of the changes.

To choose the commit type:
- Use "feat" for new features
- Use "fix" for bug fixes
- Use "docs" for documentation changes
- Use "style" for formatting, missing semi colons, etc.
- Use "refactor" for code refactoring
- Use "perf" for performance improvements
- Use "test" for adding or modifying tests
- Use "build" for build system changes
- Use "ci" for CI configuration changes
- Use "chore" for other changes that don't modify src or test files

Do not include the scope in the commit message.
`;

	const PROMPT_DATA = `Monorepo:
<git_status>
${monorepo.status}
</git_status>
<git_diff>
${monorepo.diff}
</git_diff>

Packages:
${packages
	.map(
		(p) => `<changelog>
	<path>${p.path}</path>
	<message>${p.message}</message>
	<description>${p.description}</description>
</changelog>`,
	)
	.join("\n\n")}
`;

	const stream = await cerebras.chat.completions.create({
		max_completion_tokens: 1000,
		messages: [
			{ content: PROMPT, role: "system" },
			{ content: PROMPT_DATA, role: "user" },
		],
		model: "gpt-oss-120b",
		reasoning_effort: "medium",
		stream: false,
		temperature: 1,
		n: 1,
		top_p: 1,
	});
	const commit = stream.choices[0]?.message.content?.trim();
	if (!commit) {
		throw new Error("No response from AI");
	}
	return commit;
}
