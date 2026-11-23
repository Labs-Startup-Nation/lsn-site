import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getIssues } from '../lib/issues';

export async function GET(context: APIContext) {
  const issues = await getIssues();
  return rss({
    title: 'LSN Tech Watch',
    description: 'What moved in tech, the market and the job market, worldwide and in Paris. Short, neutral, every fact linked to its source.',
    site: context.site ?? 'http://localhost:4321',
    items: issues.map(({ id, data }) => ({
      title: data.title,
      description: data.oneLine,
      pubDate: new Date(`${data.date}T00:00:00Z`),
      link: `/en/tech-watch/${id}`,
    })),
    customData: '<language>en</language>',
  });
}
