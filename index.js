const { readdirSync, readFileSync, writeFileSync, rmSync } = require("node:fs");
const { join, resolve: resolvePath, parse } = require("node:path");

const showdown = require('showdown'),
  converter = new showdown.Converter();

const resolve = (path = "./", ...paths) => join(path, ...paths);

const EXAMPLE_HTML_FILE = readFileSync(resolve("./example.html"), "utf-8");
const HTML_CONSTANTS = {
  title: "{{ HTML TITLE }}",
  allFiles: "{{ HTML ALL FILES }}",
  body: "{{ HTML BODY }}"
};
const EXCLUDE = ["node_modules", ".git", ".obsidian"];
const FILE_FORMAT = ".md";

const readDirWithDirectories = (path = "./", dirs = {}) => {
  const resolvedPath = resolve(path)
  const folder = readdirSync(resolvedPath);

  for (const file of folder) {
    if (EXCLUDE.includes(file)) continue;

    try {
      const folderPath = resolve(resolvedPath, file);
      readdirSync(folderPath);
      
      dirs[folderPath] = readDirWithDirectories(folderPath);
    } catch (err) {
      if (!file.endsWith(FILE_FORMAT)) continue;
      dirs[file] = file;
    }
  }
  
  return dirs;
};

const readDir = (path = "./", paths = []) => {
  const resolvedPath = resolve(path)
  const folder = readdirSync(resolvedPath);

  for (const file of folder) {
    if (EXCLUDE.includes(file)) continue;

    try {
      const folderPath = resolve(resolvedPath, file);
      readdirSync(folderPath);
      
      paths.push(...readDir(folderPath));
    } catch (err) {
      if (!file.endsWith(FILE_FORMAT)) continue;

      const filePath = resolve(resolvedPath, file);

      paths.push(filePath);
    }
  }

  return paths;
};

const readFiles = (paths = []) => {
  return paths.map(p => readFileSync(p, "utf-8"));
};

const convertFiles = (files = []) => {
  return files.map(f => converter.makeHtml(f));
};

const mapObject = (object, func = ({key, index, array, object, prefix}) => {}, prefix="") => {
  const data = [];

  Object.keys(object).map((key, index, array) => {
    if (typeof(object[key]) === "string") {
      data.push(func({value: key, index, array, object, prefix}));
    } else {
      data.push(...mapObject(object[key], func, `${key}/`));
    };
  });

  return data;
};

const getAllHtmlFilesInLinks = () => {
  const paths = readDirWithDirectories();
  const data = mapObject(paths, ({ value, prefix }) => `${prefix}${value}`.replace(".md", ".html") );

  return `<ul>${data.map(
    name => `<li><a href="/type-handbook/${name.replaceAll(" ", "%20")}">${name.replace(".html", "")}<a></li>`
  ).join("\n")}</ul>`;
}

const pasteHtml = (html = "", path = "") => {
  let file = `${EXAMPLE_HTML_FILE}`;
  
  file = file.replace(HTML_CONSTANTS.title, parse(path).name);
  file = file.replace(HTML_CONSTANTS.body, html.replaceAll("href=\"/", "href=\"/type-handbook/"));
  file = file.replace(HTML_CONSTANTS.allFiles, getAllHtmlFilesInLinks())
  file = file.replaceAll(".md", ".html");
  
  return file;
}

const generateHtml = (html = "", path = "") => {
  const resolvedPath = resolve(path.replace(".md", ".html"))
  writeFileSync(resolvedPath, pasteHtml(html, path), "utf-8");
};

const deleteHtmlFiles = (paths = []) => {
  paths.forEach(p => rmSync(p.replace(".md", ".html")));
};

const METHODS = {
  production: ({ paths, convertedFiles }) => convertedFiles.map((file, index) => generateHtml(file, paths[index])),
  destroy: ({ paths }) => deleteHtmlFiles(paths),
  development: () => {}
};

const errorFunction = () => {
  throw new Error(`env ${process.env.NODE_ENV} is not defined in METHODS`)
};

(() => {
  const paths = readDir("./");
  const mdFiles = readFiles(paths);
  const convertedFiles = convertFiles(mdFiles);

  (METHODS[process.env.NODE_ENV] || errorFunction)({paths, convertedFiles});
})();