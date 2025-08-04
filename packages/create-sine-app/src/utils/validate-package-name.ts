const VALID_PACKAGE_NAME_REGEX = /^[a-z0-9]([a-z0-9._-]*[a-z0-9])?$/;

export function validatePackageName(name: string): boolean {
	return VALID_PACKAGE_NAME_REGEX.test(name) && name.length <= 214;
}
