import { readdirSync, readFileSync, rmSync } from "node:fs";
import { resolvePath as resolve, mapObject, EXCLUDE, FILE_FORMAT, URL_PREFIX } from "./constants.js";
import showdown from "showdown";
const converter = new showdown.Converter();
export class FileManager {
    dir;
    format;
    _dirs;
    _paths;
    constructor(dir = "./", format = FILE_FORMAT) {
        this.dir = dir;
        this.format = format;
        this._dirs = {};
        this._paths = [];
    }
    static deleteFiles = (paths) => {
        paths.forEach((p) => rmSync(p));
    };
    readDirWithDirs(path = this.dir, dirs = {}) {
        const resolvedPath = resolve(path);
        const folder = readdirSync(resolvedPath);
        for (const file of folder) {
            if (EXCLUDE.includes(file))
                continue;
            try {
                const folderPath = resolve(resolvedPath, file);
                readdirSync(folderPath);
                dirs[folderPath] = this.readDirWithDirs(folderPath);
            }
            catch (err) {
                if (!file.endsWith(this.format))
                    continue;
                dirs[file] = file;
            }
        }
        return dirs;
    }
    readDir(path = this.dir) {
        const resolvedPath = resolve(path);
        const folder = readdirSync(resolvedPath);
        for (const file of folder) {
            if (EXCLUDE.includes(file))
                continue;
            try {
                const folderPath = resolve(resolvedPath, file);
                readdirSync(folderPath);
                this._paths.push(...this.readDir(folderPath).paths);
            }
            catch (err) {
                if (!file.endsWith(FILE_FORMAT))
                    continue;
                const filePath = resolve(resolvedPath, file);
                this._paths.push(filePath);
            }
        }
        return this;
    }
    readFiles() {
        return this._paths.map((p) => readFileSync(p, "utf-8"));
    }
    convertFilesToHtml(mdFiles) {
        return mdFiles.map((f) => converter.makeHtml(f));
    }
    getAllHtmlFilesInLinks() {
        const dirs = this.readDirWithDirs();
        const data = mapObject(dirs, ({ value, prefix }) => `${prefix}${value}`.replace(".md", ".html"));
        return `<ul>
      ${data
            .map((name) => `<li><a href="${URL_PREFIX}/${name.replaceAll(" ", "%20")}">${name.replace(".html", "")}<a></li>`)
            .join("\n")}
    </ul>`;
    }
    get dirs() {
        return this._dirs;
    }
    get paths() {
        return this._paths;
    }
}
