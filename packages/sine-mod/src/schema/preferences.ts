import { type } from "arktype";

const PropertyValueField = type({
	property: "string",
	value: "string",
});
const ConditionType = type({ if: PropertyValueField })
	.or({ not: PropertyValueField })
	.or({ operator: "'AND' | 'OR'" });
// .or(ConditionType); // TODO: Implement Circular Reference

export const PreferencesSchema = type({
	conditions: type(ConditionType, "[]"),
	disabledOn: "('macos' | 'windows' | 'linux')[]",
	label: "string",
	margin: "string",
	property: "string",
	restart: "boolean",
	size: "string",
})
	.and({
		defaultValue: "boolean",
		type: "'checkbox'",
	})
	.and({
		defaultValue: "string",
		options: {
			label: "string",
			value: "string",
		},
		placeholder: "string",
		type: "'dropdown'",
	})
	.and({
		border: "string",
		defaultValue: "string",
		placeholder: "string",
		type: "'string'",
	})
	.and({
		type: "'separator'",
	});
