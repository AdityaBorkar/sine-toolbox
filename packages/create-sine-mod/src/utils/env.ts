/** biome-ignore-all lint/style/noProcessEnv: Allow Environment Variables */

export const NPM_CONFIG_USER_AGENT = process.env.npm_config_user_agent ?? "";

export const USERPROFILE = process.env.USERPROFILE ?? "";

export const USER = process.env.USER ?? "";
