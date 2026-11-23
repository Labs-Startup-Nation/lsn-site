import { defineCollection } from 'astro:content';
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

export const collections = { issues, ...testIssues };
