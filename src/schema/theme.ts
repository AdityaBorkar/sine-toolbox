import { type } from "arktype";

export const ThemeSchema = type({
	id: "string",
	name: "string",
	description: "string",
	homepage: "string",
	readme: "string",
	image: "string",
	style: "string",
	js: "boolean",
	preferences: "string",
	author: "string",
	version: "string",
	tags: "string[]",
	createdAt: "string",
	updatedAt: "string",
	fork: "string[]",
	"editable-files": "string[]",
	"no-updates": "boolean",
	enabled: "boolean",
});
