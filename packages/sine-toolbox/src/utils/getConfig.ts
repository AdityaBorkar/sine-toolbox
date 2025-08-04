import { join } from "node:path";
import process from "node:process";
import { file } from "bun";

export async function getConfig(): Promise<{
	preferences: null;
	theme: null;
}> {
	const theme: null = null;
	const preferences: null = null;

	// If the file exists, read it
	const themeFile = file(join(process.cwd(), "theme.json"));
	if (await themeFile.exists()) {
		const theme = await themeFile.json();
		// TODO: Validate `theme`
		console.log(theme);
		// return theme
	}

	// If the file exists, read it
	const preferencesFile = file(join(process.cwd(), "preferences.json"));
	if (await preferencesFile.exists()) {
		const preferences = await preferencesFile.json();
		// TODO: Validate `theme`
		console.log(preferences);
		// return preferences
	}

	const packageJsonFile = file(join(process.cwd(), "package.json"));
	if (await packageJsonFile.exists()) {
		const packageJson = await packageJsonFile.json();
		const theme = packageJson["theme.json"];
		const preferences = packageJson["preferences.json"];
		// return packageJson
	}

	return { preferences, theme };
}
