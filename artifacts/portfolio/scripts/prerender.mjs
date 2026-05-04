import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const portfolioRoot = path.resolve(__dirname, "..");
const indexPath = path.join(portfolioRoot, "dist/public/index.html");
const serverEntryPath = path.join(portfolioRoot, "dist/server/entry-server.js");

function serializeJsonLd(value) {
  return JSON.stringify(value, null, 2).replace(/</g, "\\u003c");
}

function injectRootHtml(template, html) {
  const rootPattern = /<div id="root">[\s\S]*?<\/div>/;

  if (!rootPattern.test(template)) {
    throw new Error("Unable to find the #root element in dist/public/index.html");
  }

  return template.replace(rootPattern, `<div id="root">${html}</div>`);
}

function injectStructuredData(template, jsonLd) {
  const structuredDataPattern =
    /<script type="application\/ld\+json" id="portfolio-structured-data">[\s\S]*?<\/script>/;

  if (!structuredDataPattern.test(template)) {
    throw new Error("Unable to find #portfolio-structured-data in dist/public/index.html");
  }

  return template.replace(
    structuredDataPattern,
    `<script type="application/ld+json" id="portfolio-structured-data">${serializeJsonLd(jsonLd)}</script>`,
  );
}

const serverEntryUrl = pathToFileURL(serverEntryPath).href;
const { render } = await import(`${serverEntryUrl}?t=${Date.now()}`);
const rendered = render("/");

let html = await readFile(indexPath, "utf8");
html = injectRootHtml(html, rendered.html);
html = injectStructuredData(html, rendered.jsonLd);

await writeFile(indexPath, html);

console.log(`Pre-rendered portfolio homepage into ${path.relative(portfolioRoot, indexPath)}`);
