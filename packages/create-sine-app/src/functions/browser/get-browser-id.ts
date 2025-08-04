import { logger } from "../../utils/logger.js";

const BROWSERS = {
	firefox: "Firefox",
	zen: "Zen Browser",
} as const;

export type BrowserId = keyof typeof BROWSERS;

const DEFAULT_BROWSER = "zen" as const;

export async function getBrowserId(name?: BrowserId): Promise<BrowserId> {
	if (name) {
		if (Object.keys(BROWSERS).includes(name as string)) {
			logger.info(`Using browser: ${name}`);
			return name;
		}
		logger.error(`Invalid browser: ${name}`);
		logger.info(`Available browsers: ${Object.keys(BROWSERS).join(", ")}`);
	}

	logger.info(`Using ${BROWSERS.zen} (Default Browser)`);
	return DEFAULT_BROWSER;
}
