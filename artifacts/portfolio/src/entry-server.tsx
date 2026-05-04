import { renderToString } from "react-dom/server";
import App from "./App";
import {
  ABOUT,
  ECOSYSTEM_PROJECTS,
  ESCO_PROJECT,
  EXPERIENCE,
  PERSONAL,
  SKILLS,
} from "@/data/resume";

const siteUrl = "https://mjshuff23.github.io/";

function getSkillNames() {
  return SKILLS.flatMap((category) =>
    category.skills.map((skill) => (typeof skill === "string" ? skill : skill.name)),
  );
}

function getJsonLd() {
  const projects = [
    {
      name: ESCO_PROJECT.title,
      description: ESCO_PROJECT.description,
      url: siteUrl,
      keywords: ESCO_PROJECT.tags,
    },
    ...ECOSYSTEM_PROJECTS.map((project) => ({
      name: project.title,
      description: project.description,
      url: project.link ?? siteUrl,
      keywords: project.tags,
    })),
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}#person`,
        name: PERSONAL.name,
        jobTitle: PERSONAL.title,
        url: siteUrl,
        email: PERSONAL.email,
        telephone: PERSONAL.phone,
        sameAs: [PERSONAL.github, PERSONAL.linkedin],
        description: ABOUT.bio[0],
        knowsAbout: getSkillNames(),
        hasOccupation: EXPERIENCE.map((experience) => ({
          "@type": "Occupation",
          name: experience.title,
          description: experience.bullets.join(" "),
          occupationLocation: {
            "@type": "Country",
            name: "United States",
          },
        })),
        workExample: projects.map((project) => ({
          "@type": "CreativeWork",
          name: project.name,
          description: project.description,
          url: project.url,
          keywords: project.keywords,
        })),
      },
      {
        "@type": "ProfilePage",
        "@id": `${siteUrl}#profile-page`,
        url: siteUrl,
        name: `${PERSONAL.name} Portfolio`,
        about: { "@id": `${siteUrl}#person` },
        mainEntity: { "@id": `${siteUrl}#person` },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}#website`,
        url: siteUrl,
        name: `${PERSONAL.name} Portfolio`,
        author: { "@id": `${siteUrl}#person` },
      },
    ],
  };
}

export function render(url: string): { html: string; jsonLd: object } {
  return {
    html: renderToString(<App ssrPath={url} />),
    jsonLd: getJsonLd(),
  };
}
