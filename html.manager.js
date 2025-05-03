import { writeFileSync } from "node:fs";
import { parse } from "node:path";
import { JSDOM } from "jsdom";
import { resolvePath as resolve, EXAMPLE_HTML_FILE, HTML_CONSTANTS, URL_PREFIX } from "./constants.js";
import { FileManager } from "./file.manager.js";
export class HtmlManager {
    rawHtml;
    mdPath;
    highlighter;
    fileManager;
    document;
    html;
    constructor(rawHtml, mdPath, highlighter) {
        this.rawHtml = rawHtml;
        this.mdPath = mdPath;
        this.highlighter = highlighter;
        this.fileManager = new FileManager();
        this.document = new JSDOM(this.ParseHtml());
        this.html = this.stylizeHtmlCodeBlocks();
    }
    generateHtml() {
        const resolvedPath = resolve(this.mdPath.replace(".md", ".html"));
        writeFileSync(resolvedPath, this.html, "utf-8");
    }
    stylizeHtmlCodeBlocks() {
        this.document.window.document
            .querySelectorAll("pre")
            .forEach((element) => {
            const language = element.children[0].className.split(" ")[0];
            if (!element.textContent)
                return;
            const code = this.highlighter.codeToHtml(element.textContent, language);
            element.innerHTML = code;
        });
        return this, this.document.window.document.documentElement.innerHTML;
    }
    ParseHtml() {
        return `${EXAMPLE_HTML_FILE}`
            .replaceAll('href="/', `href="${URL_PREFIX}/`)
            .replace(HTML_CONSTANTS.title, parse(this.mdPath).name)
            .replace(HTML_CONSTANTS.body, `${this.rawHtml}`.replaceAll('href="/', `href="${URL_PREFIX}/`))
            .replace(HTML_CONSTANTS.allFiles, this.fileManager.getAllHtmlFilesInLinks())
            .replaceAll(".md", ".html");
    }
}
