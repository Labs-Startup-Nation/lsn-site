// Contact details and facts the team fills in (spec, task 0). `null` hides the matching link or sentence.
import type { Lang } from '../i18n/lang';

/** LSN LinkedIn page, e.g. 'https://www.linkedin.com/company/…'. */
export const LINKEDIN_URL: string | null = 'https://www.linkedin.com/groups/42833468/';
/** Contact address, ideally on the site's domain. */
export const CONTACT_EMAIL: string | null = 'labsstartupnation@gmail.com';
/** One sentence on the association's status, per language, e.g. "LSN became an association in March 2027." */
export const ASSOCIATION_STATUS: Record<Lang, string> | null = null;
/** How long the team takes to answer a proposal. */
export const REPLY_DELAY: Record<Lang, string> = { en: 'two weeks', fr: 'deux semaines' };
/** Legal notice (task 9). */
// Until the association is declared, the publisher is the person in charge, on behalf of the group.
export const PUBLISHER: string | null = 'Enzo BEGUIN, pour Labs Startup Nation (association en cours de création), Paris';
export const PUBLICATION_DIRECTOR: string | null = 'Enzo BEGUIN';
