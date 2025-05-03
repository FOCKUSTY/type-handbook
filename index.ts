import { HtmlManager } from "./html.manager.js";
import { FileManager } from "./file.manager.js";

import { getHighlighter } from "shiki";

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
		development: () => FileManager.deleteFiles(new FileManager("./", ".js").paths)
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
