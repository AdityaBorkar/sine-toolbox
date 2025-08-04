import { logger } from "../../utils/logger.js";
import type { PlatformInfo } from "../platform.js";
import { findZenPath } from "./find-zen-path.js";
import type { BrowserId } from "./get-browser-id.js";

export async function findProfiles({
	browser,
	platform,
}: {
	browser: BrowserId;
	platform: PlatformInfo;
}): Promise<{ basePath: string; profiles: string[] } | null> {
	if (browser === "zen") {
		return await findZenPath(platform);
	}
	if (browser === "firefox") {
		logger.error("Firefox is not supported yet");
		return null;
	}
	throw new Error(`Unsupported browser: ${browser}`);
}
