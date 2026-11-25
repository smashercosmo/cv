import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/** Year and month, e.g. `2024-03`. */
const yearMonth = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use the YYYY-MM format, e.g. 2024-03");

/**
 * The person: name, headline and contacts in frontmatter,
 * the summary ("About me") as the Markdown body.
 */
const profile = defineCollection({
  loader: glob({ base: "./src/content", pattern: "profile.md" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      headline: z.string(),
      location: z.string().optional(),
      email: z.email(),
      phone: z.string().optional(),
      links: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
      photo: image().optional(),
      photoAlt: z.string().default(""),
      /** File name for the generated PDF, served from the site root. */
      pdfFileName: z
        .string()
        .regex(/\.pdf$/)
        .default("cv.pdf"),
    }),
});

/** One Markdown file per job. The body holds the bullet list of achievements. */
const experience = defineCollection({
  loader: glob({ base: "./src/content/experience", pattern: "**/*.md" }),
  schema: z
    .object({
      role: z.string(),
      company: z.string(),
      location: z.string().optional(),
      /** e.g. "Contract", "Part-time". Leave out for regular full-time jobs. */
      employmentType: z.string().optional(),
      start: yearMonth,
      /** Leave out for the current job; it is shown as "Present". */
      end: yearMonth.optional(),
    })
    .refine((job) => !job.end || job.end >= job.start, {
      message: "`end` must not be before `start`",
      path: ["end"],
    }),
});

/** One Markdown file per skill group. The body holds the list of skills. */
const skills = defineCollection({
  loader: glob({ base: "./src/content/skills", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    order: z.number().int(),
  }),
});

export const collections = { profile, experience, skills };
