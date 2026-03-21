/**
 * Fetch and parse Michael Shuff's AI-Focused Resume from Google Docs.
 * Extracts structured data (skills, experience, contact, bio) and writes
 * artifacts/portfolio/src/data/resume.json which resume.ts imports at build time.
 *
 * Google Docs ID: 1B2KtRocWTPhkZwgTxw69VK_FLKXmvhOeXGxCmQ_V76Y
 *
 * Run with:
 *   pnpm --filter @workspace/scripts run fetch:resume
 *
 * After running, rebuild:
 *   pnpm --filter @workspace/portfolio run build
 */

import { ReplitConnectors } from "@replit/connectors-sdk";
import fs from "fs";
import path from "path";

const DOC_ID = "1B2KtRocWTPhkZwgTxw69VK_FLKXmvhOeXGxCmQ_V76Y";
const OUTPUT_JSON = path.resolve(
  process.cwd(),
  "artifacts/portfolio/src/data/resume.json",
);

const connectors = new ReplitConnectors();

interface GDocsElement {
  textRun?: { content?: string; textStyle?: { bold?: boolean } };
}

interface GDocsParagraph {
  paragraphStyle?: { namedStyleType?: string };
  bullet?: { nestingLevel?: number };
  elements?: GDocsElement[];
}

interface GDocsStructuralElement {
  paragraph?: GDocsParagraph;
}

interface GDocsDocument {
  title?: string;
  body?: { content?: GDocsStructuralElement[] };
}

function extractText(para: GDocsParagraph): string {
  return (para.elements ?? [])
    .map((el) => el.textRun?.content ?? "")
    .join("")
    .replace(/\n$/, "")
    .trim();
}

function isHeading(para: GDocsParagraph, level: 1 | 2 | 3 = 1): boolean {
  const style = para.paragraphStyle?.namedStyleType ?? "";
  return style === `HEADING_${level}`;
}

function isBullet(para: GDocsParagraph): boolean {
  return para.bullet !== undefined;
}

function isBold(para: GDocsParagraph): boolean {
  return (para.elements ?? []).some((el) => el.textRun?.textStyle?.bold);
}

interface ResumeData {
  lastSynced: string;
  docId: string;
  docUrl: string;
  personal: {
    name: string;
    title: string;
    email: string;
    phone: string;
    github: string;
  };
  about: {
    bio: string[];
    stats: Array<{ label: string; value: string }>;
  };
  skills: Array<{ title: string; skills: string[] }>;
  experience: Array<{
    title: string;
    company: string;
    date: string;
    bullets: string[];
  }>;
}

async function fetchDocument(): Promise<GDocsDocument> {
  console.log("Fetching Google Docs document...");
  const response = await connectors.proxy(
    "google-docs",
    `/v1/documents/${DOC_ID}`,
    { method: "GET" },
  );
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Google Docs API ${response.status}: ${body.substring(0, 400)}`,
    );
  }
  return response.json() as Promise<GDocsDocument>;
}

function parseDocument(doc: GDocsDocument): ResumeData {
  const paragraphs = (doc.body?.content ?? [])
    .map((block) => block.paragraph)
    .filter((p): p is GDocsParagraph => p !== undefined);

  const data: ResumeData = {
    lastSynced: new Date().toISOString().split("T")[0],
    docId: DOC_ID,
    docUrl: `https://docs.google.com/document/d/${DOC_ID}`,
    personal: {
      name: "Michael Shuff",
      title: "",
      email: "",
      phone: "",
      github: "https://github.com/mjshuff23",
    },
    about: {
      bio: [],
      stats: [
        { label: "Technical Experience", value: "23+ Years" },
        { label: "ARR Impact", value: "$30M+" },
        { label: "Engineers Mentored", value: "75+" },
        { label: "Specialization", value: "AI Safeguards" },
      ],
    },
    skills: [],
    experience: [],
  };

  let currentSection = "";
  let currentSkillCategory: { title: string; skills: string[] } | null = null;
  let currentJob: {
    title: string;
    company: string;
    date: string;
    bullets: string[];
  } | null = null;

  const EMAIL_RE = /[\w.]+@[\w.]+\.\w+/;
  const PHONE_RE = /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/;

  for (const para of paragraphs) {
    const text = extractText(para);
    if (!text) continue;

    if (isHeading(para, 1)) {
      const upper = text.toUpperCase();
      if (upper.includes("EXPERIENCE")) {
        currentSection = "experience";
        if (currentSkillCategory) {
          data.skills.push(currentSkillCategory);
          currentSkillCategory = null;
        }
        if (currentJob) {
          data.experience.push(currentJob);
          currentJob = null;
        }
      } else if (upper.includes("SKILL") || upper.includes("TECHNICAL")) {
        currentSection = "skills";
        if (currentJob) {
          data.experience.push(currentJob);
          currentJob = null;
        }
      } else if (upper.includes("ABOUT") || upper.includes("PROFILE") || upper.includes("SUMMARY")) {
        currentSection = "about";
      } else {
        currentSection = "other";
        if (data.personal.name === "Michael Shuff" && text.includes("Shuff")) {
          data.personal.name = text;
        }
      }
      continue;
    }

    if (isHeading(para, 2)) {
      if (currentSection === "skills") {
        if (currentSkillCategory) data.skills.push(currentSkillCategory);
        currentSkillCategory = { title: text, skills: [] };
      } else if (currentSection === "experience") {
        if (currentJob) data.experience.push(currentJob);
        const parts = text.split(/[|–—-]/);
        currentJob = {
          title: parts[0]?.trim() ?? text,
          company: parts[1]?.trim() ?? "",
          date: parts[2]?.trim() ?? "",
          bullets: [],
        };
      }
      continue;
    }

    if (isBullet(para)) {
      if (currentSection === "skills" && currentSkillCategory) {
        currentSkillCategory.skills.push(text);
      } else if (currentSection === "experience" && currentJob) {
        currentJob.bullets.push(text);
      }
      continue;
    }

    if (EMAIL_RE.test(text)) {
      const match = text.match(EMAIL_RE);
      if (match) data.personal.email = match[0];
    }
    if (PHONE_RE.test(text)) {
      const match = text.match(PHONE_RE);
      if (match) data.personal.phone = match[0];
    }

    if (currentSection === "about" && text.length > 60) {
      data.about.bio.push(text);
    }

    if (!data.personal.title && (text.includes("Architect") || text.includes("Engineer") || text.includes("Researcher"))) {
      if (text.length < 120) data.personal.title = text;
    }
  }

  if (currentSkillCategory) data.skills.push(currentSkillCategory);
  if (currentJob) data.experience.push(currentJob);

  return data;
}

async function run() {
  let doc: GDocsDocument;
  try {
    doc = await fetchDocument();
  } catch (err) {
    console.error("Google Docs fetch failed:", (err as Error).message);
    console.error(
      "Ensure the Google Docs integration is connected (Replit integrations panel).",
    );
    process.exit(1);
  }

  const data = parseDocument(doc);

  console.log(`\nParsed resume:`);
  console.log(`  Name: ${data.personal.name}`);
  console.log(`  Title: ${data.personal.title || "(not parsed — check doc headings)"}`);
  console.log(`  Email: ${data.personal.email || "(not found)"}`);
  console.log(`  Phone: ${data.personal.phone || "(not found)"}`);
  console.log(`  Skills sections: ${data.skills.length}`);
  console.log(`  Experience entries: ${data.experience.length}`);
  console.log(`  Bio paragraphs: ${data.about.bio.length}`);

  if (data.skills.length === 0 || data.experience.length === 0) {
    console.warn(
      "\n⚠ Warning: parser found 0 skills categories or 0 experience entries.",
    );
    console.warn(
      "The Google Doc's heading styles may not match HEADING_1/HEADING_2.",
    );
    console.warn(
      "Falling back to existing resume.json to avoid wiping valid data.",
    );
    if (fs.existsSync(OUTPUT_JSON)) {
      console.warn("Existing resume.json preserved.");
      process.exit(0);
    }
  }

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(data, null, 2), "utf8");
  console.log(`\n✓ Written: ${OUTPUT_JSON}`);
  console.log(
    "\nRebuild to apply: pnpm --filter @workspace/portfolio run build",
  );
}

run().catch((err) => {
  console.error("fetch-resume-data failed:", err.message);
  process.exit(1);
});
