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
	property: "string",
	label: "string",
	restart: "boolean",
	disabledOn: "('macos' | 'windows' | 'linux')[]",
	margin: "string",
	size: "string",
	conditions: type(ConditionType, "[]"),
})
	.and({
		type: "'checkbox'",
		defaultValue: "boolean",
	})
	.and({
		type: "'dropdown'",
		options: {
			label: "string",
			value: "string",
		},
		defaultValue: "string",
		placeholder: "string",
	})
	.and({
		type: "'string'",
		border: "string",
		defaultValue: "string",
		placeholder: "string",
	})
	.and({
		type: "'separator'",
	});
