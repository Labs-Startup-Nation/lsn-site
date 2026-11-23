import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { issueSchema } from './lib/issue-schema';

// Tests add their fixture issues (ISSUES_EXTRA) next to the real ones.
const extra = process.env.ISSUES_EXTRA;

const issues = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/issues' }),
  schema: issueSchema,
});

const testIssues = extra
  ? { testIssues: defineCollection({ loader: glob({ pattern: '*.json', base: extra }), schema: issueSchema }) }
  : {};

// One file per project (empty in V1). Rendered on /projects when it has entries.
const projects = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/projects' }),
  schema: z.object({
    name: z.string().min(1),
    kind: z.enum(['hackathon', 'proposed', 'side']),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    pitch: z.string().min(1),
    team: z.array(z.string().min(1)),
    tools: z.array(z.string().min(1)),
    url: z.url({ protocol: /^https$/ }).optional(),
  }),
});

export const collections = { issues, projects, ...testIssues };
