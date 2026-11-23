import { expect, test } from 'vitest';
import { missingForLaunch } from '../../scripts/check-launch.mjs';

test('lists every unset value the team must fill before launch', () => {
  expect(missingForLaunch({ LINKEDIN_URL: null, CONTACT_EMAIL: 'a@b.c', PUBLISHER: null, PUBLICATION_DIRECTOR: 'X' }))
    .toEqual(['LINKEDIN_URL', 'PUBLISHER']);
  expect(missingForLaunch({ LINKEDIN_URL: 'https://x', CONTACT_EMAIL: 'a', PUBLISHER: 'b', PUBLICATION_DIRECTOR: 'c' })).toEqual([]);
});
