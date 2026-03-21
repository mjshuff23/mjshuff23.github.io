/**
 * Deploy portfolio dist/ to mjshuff23/mjshuff23.github.io via GitHub API
 *
 * Uses the GitHub integration (Replit connectors-sdk) to authenticate.
 * Run with: pnpm --filter @workspace/scripts run deploy:gh-pages
 *
 * Prerequisites:
 *   1. Build the portfolio first: pnpm --filter @workspace/portfolio run build
 *   2. GitHub integration must be connected in this Repl
 *   3. ImageMagick (`magick` CLI) must be installed — required to compress large
 *      images (>~675KB) before upload to stay within the connector proxy's ~1MB
 *      body size limit. On NixOS/Replit this is provided by default.
 */

import { ReplitConnectors } from "@replit/connectors-sdk";
import type { ProxyOptions } from "@replit/connectors-sdk";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_ROOT = path.resolve(__dirname, "..", "..");

const OWNER = "mjshuff23";
const REPO = "mjshuff23.github.io";
const BRANCH = "master";
const DIST_DIR = path.resolve(WORKSPACE_ROOT, "artifacts/portfolio/dist/public");

const MAX_BODY_BYTES = 900 * 1024;

const connectors = new ReplitConnectors();

interface GHRef {
  object: { sha: string };
}

interface GHCommit {
  tree: { sha: string };
}

interface GHBlob {
  sha: string;
}

interface GHTree {
  sha: string;
}

interface GHNewCommit {
  sha: string;
  message: string;
}

function assertShape<T>(value: unknown, label: string): T {
  if (value == null || typeof value !== "object") {
    throw new Error(`Unexpected GitHub API response for ${label}: ${JSON.stringify(value)}`);
  }
  return value as T;
}

async function ghProxy(endpoint: string, options: ProxyOptions = {}): Promise<unknown> {
  const response = await connectors.proxy("github", endpoint, options);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API error ${response.status} on ${endpoint}: ${body}`);
  }
  return response.json();
}

function readAllFiles(dir: string, base = dir): Array<{ path: string; content: Buffer }> {
  const results: Array<{ path: string; content: Buffer }> = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...readAllFiles(full, base));
    } else {
      results.push({
        path: path.relative(base, full).replace(/\\/g, "/"),
        content: fs.readFileSync(full),
      });
    }
  }
  return results;
}

function checkMagickAvailable(): void {
  try {
    execFileSync("magick", ["--version"], { stdio: "ignore" });
  } catch {
    throw new Error(
      "ImageMagick (`magick`) is required for compressing large images before upload " +
      "but was not found in PATH. Install ImageMagick and retry.\n" +
      "  On NixOS/Replit it is available by default.\n" +
      "  On macOS: brew install imagemagick\n" +
      "  On Debian/Ubuntu: apt-get install imagemagick",
    );
  }
}

function compressImageBuffer(filePath: string, content: Buffer): Buffer {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
    return content;
  }

  const tmpDir = os.tmpdir();
  const tmpIn = path.join(tmpDir, `deploy-in-${Date.now()}${ext}`);
  const tmpOut = path.join(tmpDir, `deploy-out-${Date.now()}${ext}`);

  try {
    fs.writeFileSync(tmpIn, content);

    if (ext === ".png") {
      execFileSync("magick", [
        tmpIn,
        "-strip",
        "-colors", "256",
        "-define", "png:compression-level=9",
        tmpOut,
      ]);
    } else {
      execFileSync("magick", [
        tmpIn,
        "-strip",
        "-quality", "80",
        tmpOut,
      ]);
    }

    const compressed = fs.readFileSync(tmpOut);
    return compressed;
  } finally {
    if (fs.existsSync(tmpIn)) fs.unlinkSync(tmpIn);
    if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);
  }
}

async function deploy() {
  console.log(`\nDeploying to https://github.com/${OWNER}/${REPO} (branch: ${BRANCH})\n`);

  checkMagickAvailable();

  if (!fs.existsSync(DIST_DIR)) {
    console.error(`Error: dist directory not found at ${DIST_DIR}`);
    console.error("Build the portfolio first: pnpm --filter @workspace/portfolio run build");
    process.exit(1);
  }

  const files = readAllFiles(DIST_DIR);
  console.log(`Found ${files.length} files to deploy.`);

  // 1. Get current HEAD commit SHA
  const refRaw = await ghProxy(`/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
  const refData = assertShape<GHRef>(refRaw, "git/ref");
  const latestCommitSha = refData.object.sha;
  console.log(`\nCurrent HEAD: ${latestCommitSha.substring(0, 7)}`);

  // 2. Get current tree SHA
  const commitRaw = await ghProxy(`/repos/${OWNER}/${REPO}/git/commits/${latestCommitSha}`);
  const commitData = assertShape<GHCommit>(commitRaw, "git/commits");
  const baseTreeSha = commitData.tree.sha;

  // 3. Create blobs for all files
  console.log("\nUploading files...");
  const treeEntries: Array<{ path: string; mode: string; type: string; sha: string }> = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const isText = /\.(html|css|js|json|txt|xml|svg|ico|ts|map)$/.test(file.path);

    let fileContent = file.content;

    if (!isText) {
      const bodySize = Math.ceil(file.content.length * 4 / 3) + 50;
      if (bodySize > MAX_BODY_BYTES) {
        const origKB = (file.content.length / 1024).toFixed(1);
        fileContent = compressImageBuffer(file.path, file.content);
        const compKB = (fileContent.length / 1024).toFixed(1);
        console.log(`  Compressed ${file.path}: ${origKB}KB → ${compKB}KB`);

        const compBodySize = Math.ceil(fileContent.length * 4 / 3) + 50;
        if (compBodySize > MAX_BODY_BYTES) {
          throw new Error(
            `${file.path} is still too large after compression ` +
            `(${compKB}KB compressed → ~${(compBodySize / 1024).toFixed(1)}KB body, ` +
            `limit is ~${(MAX_BODY_BYTES / 1024).toFixed(0)}KB). ` +
            "Consider manually reducing the source asset dimensions or converting to a more efficient format.",
          );
        }
      }
    }

    const blobRaw = await ghProxy(`/repos/${OWNER}/${REPO}/git/blobs`, {
      method: "POST",
      body: JSON.stringify({
        content: isText ? fileContent.toString("utf8") : fileContent.toString("base64"),
        encoding: isText ? "utf-8" : "base64",
      }),
    });
    const blobData = assertShape<GHBlob>(blobRaw, "git/blobs");

    treeEntries.push({
      path: file.path,
      mode: "100644",
      type: "blob",
      sha: blobData.sha,
    });

    if ((i + 1) % 10 === 0 || i === files.length - 1) {
      console.log(`  ${i + 1}/${files.length} files uploaded`);
    }
  }

  // 4. Create new tree
  const treeRaw = await ghProxy(`/repos/${OWNER}/${REPO}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries }),
  });
  const newTree = assertShape<GHTree>(treeRaw, "git/trees");

  // 5. Create commit
  const now = new Date().toISOString();
  const commitRaw2 = await ghProxy(`/repos/${OWNER}/${REPO}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message: `Deploy portfolio build — ${now}`,
      tree: newTree.sha,
      parents: [latestCommitSha],
    }),
  });
  const newCommit = assertShape<GHNewCommit>(commitRaw2, "git/commits (new)");

  // 6. Update branch ref
  await ghProxy(`/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: newCommit.sha, force: false }),
  });

  console.log(`\n✓ Deployed successfully!`);
  console.log(`  Commit: ${newCommit.sha.substring(0, 7)} — ${newCommit.message}`);
  console.log(`  Live at: https://${OWNER}.github.io\n`);
}

deploy().catch((err: Error) => {
  console.error("\nDeploy failed:", err.message);
  process.exit(1);
});
