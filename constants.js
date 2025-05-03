import { readFileSync } from "node:fs";
import { join } from "node:path";
export const URL_PREFIX = process.env.URL_PREFIX || "";
export const resolvePath = (path, ...paths) => join(path, ...paths);
export const parseUrl = (url) => url.startsWith("./")
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
export const mapObject = (object, func, prefix = "") => {
    const data = [];
    Object.keys(object).map((key, index, array) => {
        if (typeof object[key] === "string") {
            data.push(func({ value: key, index, array: array, object, prefix }));
        }
        else {
            data.push(...mapObject(object[key], func, `${key}/`));
        }
    });
    return data;
};
