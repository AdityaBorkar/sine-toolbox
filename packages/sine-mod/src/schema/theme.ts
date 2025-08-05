import { type } from "arktype";

export const ThemeSchema = type({
	author: "string",
	createdAt: "string",
	description: "string",
	"editable-files": "string[]",
	enabled: "boolean",
	fork: "string[]",
	homepage: "string",
	id: "string",
	image: "string",
	js: "boolean",
	name: "string",
	"no-updates": "boolean",
	preferences: "string",
	readme: "string",
	style: "string",
	tags: "string[]",
	updatedAt: "string",
	version: "string",
});
