# CV

Personal CV site built with [Astro](https://astro.build). All content lives in Markdown.

## Editing content

| What | Where |
| --- | --- |
| Name, headline, contacts, photo, PDF file name, summary | `src/content/profile.md` (frontmatter + body) |
| Jobs (one file per job, sorted by `start` automatically) | `src/content/experience/*.md` |
| Skill groups (ordered by `order`) | `src/content/skills/*.md` |

Experience frontmatter:

```yaml
role: Senior Frontend Developer
company: Verda (ex. DataCrunch)
employmentType: Contract   # optional
location: Helsinki, Finland # optional
start: "2024-03"            # YYYY-MM
end: "2025-11"              # YYYY-MM; omit for "Present"
```

The body is a Markdown bullet list. Frontmatter is validated by `src/content.config.ts`, so a typo or an `end` before `start` fails the build.

## Commands

| Command | Action |
| --- | --- |
| `pnpm dev` | Dev server at `localhost:4321` |
| `pnpm build` | Build to `dist/` |
| `pnpm preview` | Serve the build |
| `pnpm check` | Type-check |
| `pnpm pdf` | Build, render the PDF with headless Chrome into `public/<pdfFileName>`, rebuild |

`pnpm pdf` renders A4 by default (`pnpm pdf --format=Letter` for US Letter). It uses your installed Google Chrome, falling back to Playwright's Chromium (`pnpm exec playwright install chromium`). Commit the generated PDF so the "Download PDF" button works on the deployed site.

You can also just press Ctrl/Cmd + P in the browser — the print stylesheet produces the same layout.

## PDF / ATS notes

- The HTML is a single column in reading order (name → contacts → summary → skills → experience); the two-column screen layout is CSS-only, so the PDF text layer reads top to bottom.
- Separators (`|`, `·`, `–`) are real characters, contacts don't wrap mid-token, ligatures are off, and there is no running header/footer text that would be read before the name.
- `pnpm pdf` produces a tagged PDF with a heading outline.
- Each job is kept on one page; headings never end a page.
