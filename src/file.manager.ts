import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";

import {
	resolvePath as resolve,
	EXCLUDE,
	FILE_FORMAT,
	ulMapObject,
	INPUT_DIR,
} from "./constants.js";

import showdown from "showdown";

const converter = new showdown.Converter();

type Dirs = {
	[key: string]: string | Dirs;
};

export class FileManager {
	private readonly _dirs: Dirs;
	private readonly _paths: string[];

	public constructor(
		public readonly dir: string = "./docs",
		public readonly format: string = FILE_FORMAT
	) {
		this._dirs = {};
		this._paths = [];
	}

	public static deleteFiles = (paths: string[]) => {
		paths.forEach((p) => {
			if (existsSync(p)) rmSync(p);
		});
	};

	public readDirWithDirs(path: string = this.dir, dirs: Dirs = {}) {
		const resolvedPath = resolve(path);
		const folder = readdirSync(resolvedPath);

		for (const file of folder) {
			if (EXCLUDE.includes(file)) continue;

			try {
				const folderPath = resolve(resolvedPath, file);
				readdirSync(folderPath);

				dirs[folderPath] = this.readDirWithDirs(folderPath);
			} catch (err) {
				if (!file.endsWith(this.format)) continue;

				dirs[file] = file;
			}
		}

		return dirs;
	}

	public readDir(path: string = this.dir) {
		const resolvedPath = resolve(path);
		const folder = readdirSync(resolvedPath);

		for (const file of folder) {
			if (EXCLUDE.includes(file)) continue;

			try {
				const folderPath = resolve(resolvedPath, file);
				readdirSync(folderPath);

				this._paths.push(...this.readDir(folderPath).paths);
			} catch (err) {
				if (!file.endsWith(FILE_FORMAT)) continue;

				const filePath = resolve(resolvedPath, file);

				this._paths.push(filePath);
			}
		}

		return this;
	}

	public readFiles() {
		return this._paths.map((p) => readFileSync(p, "utf-8"));
	}

	public convertFilesToHtml(mdFiles: string[]) {
		return mdFiles.map((f) => converter.makeHtml(f));
	}

	public getAllHtmlFilesInLinks() {
		const dirs = this.readDirWithDirs();

		const data = ulMapObject<string, Dirs>(dirs, ({ value, prefix }) => {
			return `${prefix}/${value}`.replace(".md", ".html");
		});

		return `<div>
		${data}
    </div>`;
	}

	public get dirs() {
		return this._dirs;
	}

	public get paths() {
		return this._paths;
	}
}
