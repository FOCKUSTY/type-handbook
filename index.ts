import { config } from "dotenv";

config();

import { HtmlManager } from "./html.manager.js";
import { FileManager } from "./file.manager.js";

import path, { dirname } from "path";
import fs from "fs";

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { getHighlighter } from "shiki";

const css = fs.readFileSync("./style.css", "utf8");

(async () => {
	const highlighter = await getHighlighter({ themes: ["github-dark", "github-light"] });

	const METHODS: {
		[key: string]: ({
			paths,
			convertedFiles
		}: {
			paths: string[];
			convertedFiles: string[];
		}) => any;
	} = {
		production: ({
			paths,
			convertedFiles
		}: {
			paths: string[];
			convertedFiles: string[];
		}) =>
			convertedFiles.map((file, index) =>
				new HtmlManager(file, paths[index], highlighter).generateHtml()
			),
		destroy: ({ paths }: { paths: string[] }) =>
			FileManager.deleteFiles(paths.map((p) => p.replace(".md", ".html"))),
		development: ({
			paths,
			convertedFiles
		}: {
			paths: string[];
			convertedFiles: string[];
		}) => {
			return convertedFiles.map((file, index) =>
				new HtmlManager(file, paths[index], highlighter).generateHtml((html) => {
					return html
						.replaceAll(new RegExp('(?:\\<link rel\\=\\"stylesheet\\" href\\=\\".*\\"\\>)', "g"), `<style>\n${css}\n</style>`)
						.replaceAll("<a href=\"/", "<a href=\"/" + __dirname.replaceAll("\\", "/") + "/")
				})
			)
		}
	};

	const errorFunction = () => {
		throw new Error(`env ${process.env.NODE_ENV} is not defined in METHODS`);
	};

	(() => {
		const fileManager = new FileManager("./").readDir();
		const { paths } = fileManager;

		const mdFiles = fileManager.readFiles();
		const convertedFiles = fileManager.convertFilesToHtml(mdFiles);

		(METHODS[process.env.NODE_ENV || "undefined"] || errorFunction)({
			paths,
			convertedFiles
		});
	})();
})();
