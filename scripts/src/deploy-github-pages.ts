/**
 * Deploy portfolio dist/ to mjshuff23/mjshuff23.github.io via GitHub API
 *
 * Uses the GitHub integration (Replit connectors-sdk) to authenticate.
 * Run with: pnpm --filter @workspace/scripts run deploy:gh-pages
 *
 * Prerequisites:
 *   1. Build the portfolio first: pnpm --filter @workspace/portfolio run build
 *   2. GitHub integration must be connected in this Repl
 */

import { ReplitConnectors } from "@replit/connectors-sdk";
import fs from "fs";
import path from "path";

const OWNER = "mjshuff23";
const REPO = "mjshuff23.github.io";
const BRANCH = "main";
const DIST_DIR = path.resolve(process.cwd(), "artifacts/portfolio/dist");

const connectors = new ReplitConnectors();

async function ghProxy(endpoint: string, options: RequestInit = {}) {
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

async function deploy() {
  console.log(`\nDeploying to https://github.com/${OWNER}/${REPO} (branch: ${BRANCH})\n`);

  if (!fs.existsSync(DIST_DIR)) {
    console.error(`Error: dist directory not found at ${DIST_DIR}`);
    console.error("Build the portfolio first: pnpm --filter @workspace/portfolio run build");
    process.exit(1);
  }

  const files = readAllFiles(DIST_DIR);
  console.log(`Found ${files.length} files to deploy.`);

  // 1. Get current HEAD commit SHA
  const refData = await ghProxy(`/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
  const latestCommitSha = refData.object.sha as string;
  console.log(`\nCurrent HEAD: ${latestCommitSha.substring(0, 7)}`);

  // 2. Get current tree SHA
  const commitData = await ghProxy(`/repos/${OWNER}/${REPO}/git/commits/${latestCommitSha}`);
  const baseTreeSha = commitData.tree.sha as string;

  // 3. Create blobs for all files
  console.log("\nUploading files...");
  const treeEntries: Array<{ path: string; mode: string; type: string; sha: string }> = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const isText = /\.(html|css|js|json|txt|xml|svg|ico|ts|map)$/.test(file.path);
    const blobData = await ghProxy(`/repos/${OWNER}/${REPO}/git/blobs`, {
      method: "POST",
      body: JSON.stringify({
        content: isText ? file.content.toString("utf8") : file.content.toString("base64"),
        encoding: isText ? "utf-8" : "base64",
      }),
    });

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
  const newTree = await ghProxy(`/repos/${OWNER}/${REPO}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries }),
  });

  // 5. Create commit
  const now = new Date().toISOString();
  const newCommit = await ghProxy(`/repos/${OWNER}/${REPO}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message: `Deploy portfolio build — ${now}`,
      tree: newTree.sha,
      parents: [latestCommitSha],
    }),
  });

  // 6. Update branch ref
  await ghProxy(`/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: newCommit.sha, force: false }),
  });

  console.log(`\n✓ Deployed successfully!`);
  console.log(`  Commit: ${newCommit.sha.substring(0, 7)} — ${newCommit.message}`);
  console.log(`  Live at: https://${OWNER}.github.io\n`);
}

deploy().catch((err) => {
  console.error("\nDeploy failed:", err.message);
  process.exit(1);
});
