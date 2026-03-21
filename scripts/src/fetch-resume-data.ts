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

/**
 * NOTE: The Google Docs connector uses OAuth directly — not the ReplitConnectors
 * proxy pattern (which returns 400 for Google Docs). This script uses the
 * @replit/connectors-sdk to get the OAuth access token and then calls the
 * Google Docs REST API directly with a Bearer token.
 *
 * The Replit Google Docs integration stores OAuth credentials in:
 *   connection.settings.oauth.credentials.access_token
 *
 * Usage:
 *   pnpm --filter @workspace/scripts run fetch:resume
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

async function getAccessToken(): Promise<string> {
  // 1. Check environment variable first (works in CI/CD)
  if (process.env.GOOGLE_DOCS_TOKEN) {
    return process.env.GOOGLE_DOCS_TOKEN;
  }

  // 2. Try ReplitConnectors SDK (works in Replit run environment)
  try {
    const connections = (connectors as unknown as {
      listConnections?: (name: string) => Promise<Array<{ settings: { oauth?: { credentials?: { access_token?: string } } } }>>;
    }).listConnections;

    if (typeof connections === "function") {
      const conns = await connections("google-docs");
      const token = conns?.[0]?.settings?.oauth?.credentials?.access_token;
      if (token) return token;
    }
  } catch {
    // Connector listConnections not available in this context
  }

  throw new Error(
    [
      "Google Docs access token not found. Set one of the following:",
      "  1. GOOGLE_DOCS_TOKEN env var: export GOOGLE_DOCS_TOKEN=<your-token>",
      "  2. Connect the Google Docs integration in Replit's integrations panel.",
      "     Then run this script again inside Replit (not CI/CD).",
      "",
      "To get your token: open the Replit integrations panel → Google Docs → copy the OAuth access token.",
    ].join("\n"),
  );
}

async function fetchDocument(): Promise<GDocsDocument> {
  console.log("Fetching Google Docs document via OAuth...");
  const accessToken = await getAccessToken();

  // Call Google Docs REST API directly with Bearer token
  const response = await fetch(
    `https://docs.googleapis.com/v1/documents/${DOC_ID}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Docs API ${response.status}: ${body.substring(0, 400)}`);
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

  // The actual Google Doc uses NORMAL_TEXT for *everything* (even section headers).
  // Only "PROJECTS & RESEARCH" is styled as HEADING_3. Everything else is detected
  // by short, all-caps or well-known keyword text (no bullet) + pipe-delimited lines.
  const EMAIL_RE = /[\w.+-]+@[\w-]+\.\w+/;
  const PHONE_RE = /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/;
  const JOB_RE = /^(.+?)\s*\|\s*(.+?)\s*\|\s*(.+)$/;
  const SKILL_CATEGORIES = [
    { title: "Languages",         keywords: ["JavaScript", "TypeScript", "Python", "SQL", "HTML", "CSS"] },
    { title: "Frontend",          keywords: ["React", "Next.js", "Redux", "Tailwind", "Material-UI", "Vue", "Angular"] },
    { title: "Backend & Data",    keywords: ["Node.js", "NestJS", "Express", "GraphQL", "PostgreSQL", "MongoDB", "REST"] },
    { title: "Infrastructure",    keywords: ["Docker", "AWS", "GitHub Actions", "CI/CD", "Lambda", "S3", "CloudFormation"] },
    { title: "Testing & Methods", keywords: ["Cypress", "Jest", "TDD", "Agile", "Scrum", "Architecture"] },
    { title: "AI & Research",     keywords: ["LLM", "Prompt", "Ethical", "Adversarial", "Neuro", "Fallacy", "AI", "NLP", "ML"] },
  ];

  let currentSection = "";
  let currentJob: {
    title: string; company: string; date: string; bullets: string[];
  } | null = null;
  let headerCount = 0;
  let skillsRawLine = "";

  for (const para of paragraphs) {
    const text = extractText(para).replace(/\s+/g, " ");
    if (!text) continue;
    const bullet = isBullet(para);
    const upper = text.toUpperCase().trim();

    // --- Parse first 3 non-bullet lines as name / title / contact ---
    if (headerCount === 0 && text.includes("Shuff")) {
      data.personal.name = text;
      headerCount++;
      continue;
    }
    if (headerCount === 1 && !bullet && (text.includes("Architect") || text.includes("Researcher"))) {
      data.personal.title = text;
      headerCount++;
      continue;
    }
    if (headerCount === 2 && !bullet && (EMAIL_RE.test(text) || PHONE_RE.test(text))) {
      const emailMatch = text.match(EMAIL_RE);
      const phoneMatch = text.match(PHONE_RE);
      if (emailMatch) data.personal.email = emailMatch[0];
      if (phoneMatch) data.personal.phone = phoneMatch[0];
      headerCount++;
      continue;
    }

    // --- Detect section headers (short, non-bullet, keyword-matched) ---
    if (!bullet && text.length < 45) {
      if (upper === "SUMMARY" || upper.includes("PROFILE")) {
        currentSection = "summary"; continue;
      }
      if (upper === "SKILLS") {
        currentSection = "skills"; continue;
      }
      if (upper.includes("PROJECT") || upper.includes("RESEARCH")) {
        if (currentJob) { data.experience.push(currentJob); currentJob = null; }
        currentSection = "projects"; continue;
      }
      if (upper.includes("EXPERIENCE")) {
        if (currentJob) { data.experience.push(currentJob); currentJob = null; }
        currentSection = "experience"; continue;
      }
    }

    // --- Section body ---
    if (currentSection === "summary" && !bullet && text.length > 50) {
      data.about.bio.push(text);
    }

    if (currentSection === "skills" && !bullet && text.includes("|")) {
      skillsRawLine = text;
    }

    if (currentSection === "experience") {
      if (!bullet) {
        const jobMatch = text.match(JOB_RE);
        if (jobMatch) {
          if (currentJob) data.experience.push(currentJob);
          currentJob = {
            title: jobMatch[1].trim(),
            company: jobMatch[2].trim(),
            date: jobMatch[3].trim(),
            bullets: [],
          };
        }
      } else if (currentJob) {
        currentJob.bullets.push(text);
      }
    }
  }
  if (currentJob) data.experience.push(currentJob);

  // --- Categorize pipe-delimited skills ---
  if (skillsRawLine) {
    const allSkills = skillsRawLine.split("|").map((s) => s.trim()).filter(Boolean);
    const used = new Set<string>();
    for (const cat of SKILL_CATEGORIES) {
      const matched = allSkills.filter(
        (s) => !used.has(s) && cat.keywords.some((kw) => s.toLowerCase().includes(kw.toLowerCase()))
      );
      matched.forEach((s) => used.add(s));
      if (matched.length > 0) data.skills.push({ title: cat.title, skills: matched });
    }
    const rest = allSkills.filter((s) => !used.has(s));
    if (rest.length > 0) data.skills.push({ title: "Other", skills: rest });
  }

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
