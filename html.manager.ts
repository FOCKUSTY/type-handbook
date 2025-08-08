import { writeFileSync } from "node:fs";
import { parse } from "node:path";
import { Highlighter } from "shiki";
import { JSDOM } from "jsdom";

import {
	resolvePath as resolve,
	EXAMPLE_HTML_FILE,
	HTML_CONSTANTS,
	URL_PREFIX
} from "./constants.js";

import { FileManager } from "./file.manager.js";

export class HtmlManager {
	private readonly fileManager: FileManager;
	private readonly document: JSDOM;
	private readonly html: string;

	public constructor(
		public readonly rawHtml: string,
		public readonly mdPath: string,
		public readonly highlighter: Highlighter
	) {
		this.fileManager = new FileManager();
		this.document = new JSDOM(this.ParseHtml());
		this.html = this.stylizeHtmlCodeBlocks();
	}

	public generateHtml(parseFunc: (html: string) => string = (html) => html) {
		const resolvedPath = resolve(this.mdPath.replace(".md", ".html"));
		writeFileSync(resolvedPath, parseFunc(this.html), "utf-8");
	}

	private stylizeHtmlCodeBlocks() {
		this.document.window.document
			.querySelectorAll("pre")
			.forEach((element: HTMLElement) => {
				const div = element.ownerDocument.createElement("div")
				const copyDiv = element.ownerDocument.getElementById("copy-div") as HTMLElement;
				const language = element.children[0].className.split(" ")[0];
				const copy = element.ownerDocument.getElementById("copy-element");

				div.className = "copy";
				div.innerHTML = copy?.innerHTML || "";

				if (!element.textContent) return;

				div.onclick = () => {
					copyDiv.style.display = "block";
					copyDiv.style.transition = "0.5s";

					copyDiv.style.opacity = "1";

					setTimeout(() => {
						copyDiv.style.opacity = "0";

						setTimeout(() => {
							copyDiv.style.display = "none";
							copyDiv.style.transition = "0s";
						}, 300);
					}, 300)
				};

				const code = this.highlighter.codeToHtml(element.textContent, language);
				
				element.innerHTML = code;
				element.appendChild(div);
			});

		return this, this.document.window.document.documentElement.innerHTML;
	}

	private ParseHtml() {
		return `${EXAMPLE_HTML_FILE}`
      .replaceAll('href="/', `href="${URL_PREFIX}/`)
			.replace(HTML_CONSTANTS.title, parse(this.mdPath).name)
			.replace(
				HTML_CONSTANTS.body,
				`${this.rawHtml}`.replaceAll('href="/', `href="${URL_PREFIX}/`)
			)
			.replace(HTML_CONSTANTS.allFiles, this.fileManager.getAllHtmlFilesInLinks())
			.replaceAll(".md", ".html")
			.trim();
	}
}
