import { readFileSync } from "node:fs";
import { join } from "node:path";

export const URL_PREFIX = process.env.URL_PREFIX || "";

export const resolvePath = (path: string, ...paths: string[]) => join(path, ...paths);
export const parseUrl = (url: string) =>
	url.startsWith("./")
		? url.replace("./", URL_PREFIX + "/")
		: url.startsWith("\\")
			? url.replace("\\", URL_PREFIX + "\\")
			: URL_PREFIX + "\\" + url;

export const EXAMPLE_HTML_FILE = readFileSync(resolvePath("./example.html"), "utf-8");
export const HTML_CONSTANTS = {
	title: "{{ HTML TITLE }}",
	allFiles: "{{ HTML ALL FILES }}",
	body: "{{ HTML BODY }}",
	style: "{{ CSS STYLE }}"
};

export const EXCLUDE = ["node_modules", ".git", ".obsidian", ".github"];
export const FILE_FORMAT = ".md";

export const mapObject = <T, K extends { [key: string]: unknown }>(
	object: K,
	func: ({
		value,
		index,
		array,
		object,
		prefix
	}: {
		value: string;
		index: number;
		array: T[];
		object: K;
		prefix: string;
	}) => T,
	prefix = ""
): T[] => {
	const data: T[] = [];

	Object.keys(object).map((key, index, array) => {
		if (typeof object[key] === "string") {
			data.push(func({ value: key, index, array: <T[]>array, object, prefix }));
		} else {
			data.push(...mapObject<T, K>(<K>object[key], func, `${key}/`));
		}
	});

	return data;
};
