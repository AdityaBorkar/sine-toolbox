declare module "regedit" {
	interface RegistryValue {
		value: string | number | Buffer;
		type: string;
	}

	interface RegistryItem {
		keys?: Record<string, RegistryItem>;
		values?: Record<string, RegistryValue>;
	}

	interface RegeditPromisified {
		list(keys: string[]): Promise<{ [key: string]: RegistryItem }>;
		createKey(keys: string[]): Promise<void>;
		putValue(
			values: Record<string, Record<string, RegistryValue>>,
		): Promise<void>;
	}

	export const promisified: RegeditPromisified;
}
