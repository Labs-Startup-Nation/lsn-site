import { getCollection } from 'astro:content';
import { sortIssues, type IssueEntry } from './issue-utils';

export { sortIssues, formatIssueDate, type IssueEntry } from './issue-utils';

export async function getIssues(): Promise<IssueEntry[]> {
  const real = await getCollection('issues');
  // `testIssues` only exists when ISSUES_EXTRA is set (e2e builds).
  const extra = process.env.ISSUES_EXTRA ? await getCollection('testIssues' as 'issues') : [];
  return sortIssues([...real, ...extra].map(({ id, data }) => ({ id, data })));
}

export async function getLatestIssue(): Promise<IssueEntry | undefined> {
  return (await getIssues())[0];
}
