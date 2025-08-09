import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const INPUT_DIR = join(__dirname, "../");
export const URL_PREFIX = process.env.URL_PREFIX ||  "https://fockusty.github.io/type-handbook/";

export const resolvePath = (path: string, ...paths: string[]) => join(path, ...paths);
export const parseUrl = (url: string) => (
	url.startsWith("./")
		? url.replace("./", URL_PREFIX)
		: url.startsWith("\\")
			? url.replace("\\", URL_PREFIX)
			: URL_PREFIX + url
).replaceAll(" ", "%20").replaceAll("\\", "/");

export const EXAMPLE_HTML_FILE = readFileSync(resolvePath(__dirname, "../", "utils", "example.html"), "utf-8");
export const HTML_CONSTANTS = {
	title: "{{ HTML TITLE }}",
	allFiles: "{{ HTML ALL FILES }}",
	body: "{{ HTML BODY }}",
	style: "{{ CSS STYLE }}"
};

export const EXCLUDE = ["node_modules", ".git", ".obsidian", ".github", "dist"];
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
			data.push(...mapObject<T, K>(<K>object[key], func, `${key}/`.replaceAll("\\", "/")));
		}
	});

	return data;
};

export const ulMapObject = <T, K extends { [key: string]: unknown }>(
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
): string => {
	let output = "";

	Object.keys(object).map((key, index, array) => {
		if (typeof object[key] === "string") {
			output += `
			<span>
				<a style="padding: 0 0.5em" href="${parseUrl(""+func({ value: key, index, array: <T[]>array, object, prefix }))}">\>${key}</a>
			</span>\n
			`;
		} else {
			output += `
				<div
					class="dropdown"
				>
					<span class="dropdown_summary" onclick="dropdownOnClick('${key.replaceAll("\\", "/")}')">${key.replaceAll("\\", "/").split("/").reverse()[0]}
					</span>
					
					<div class="dropdown_content" style="display: none; margin: 0 0 0 0.5em;" id="${key.replaceAll("\\", "/")}">
						${ulMapObject<T, K>(<K>object[key], func, `${key}`.replaceAll("\\", "/"))}\n
					</div>
				</div>
			`;
		}
	});

	return output;
};