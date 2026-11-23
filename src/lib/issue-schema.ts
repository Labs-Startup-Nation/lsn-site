import { z } from 'astro/zod';

const text = z.string().trim().min(1);
const https = z.url({ protocol: /^https$/, message: 'Must be an https:// URL' });
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD');

export const ACCENTS = ['ember', 'tangerine', 'sky', 'salmon'] as const;

const article = z.object({
  label: text,
  title: text,
  text: text,
  why: text,
  figure: text,
  figureLabel: text,
  url: https,
  sources: z.array(z.object({ name: text, url: https })).min(1),
});

export const issueSchema = z.object({
  date: isoDate,
  week: z.number().int().min(1).max(53),
  title: text,
  oneLine: text,
  period: text.optional(),
  topStories: z.array(z.object({ label: text, title: text, text: text, url: https })).min(1).max(3),
  sections: z.array(
    z.object({
      id: z.string().regex(/^[a-z0-9-]+$/, 'Lowercase letters, digits and dashes only'),
      title: text,
      accent: z.enum(ACCENTS),
      articles: z.array(article),
      note: text.optional(),
    }),
  ),
  agenda: z.array(z.object({ date: text, title: text, url: https, text: text })),
  concept: z.object({ name: text, whatItIs: text, thinkOfIt: text, seenThisWeek: text, inPractice: text }),
  number: z.object({ value: text, text: text, label: text.optional(), source: z.object({ name: text, url: https }) }),
  terms: z.array(z.object({ term: text, definition: text })),
  pdf: z.string().regex(/^\/pdf\/[\w.-]+\.pdf$/, 'Must be /pdf/<file>.pdf').optional(),
});

export type Issue = z.infer<typeof issueSchema>;
export type Article = z.infer<typeof article>;
export type Accent = (typeof ACCENTS)[number];
