import test from 'node:test';
import assert from 'node:assert/strict';
import { assessMatchingAnswer } from '../src/matching-acceptance.mjs';
test('stored adult fixture with disclosures passes the targeted regression checks', () => {
  assert.equal(assessMatchingAnswer('Synthetic demo: DEMO - Adult Wheelchair Fencing Intro. Mobility and equipment unknown.', { adultOnly: true }).passed, true);
});
test('the observed fabricated program response fails even when labeled demo', () => {
  assert.equal(assessMatchingAnswer('Fictional demo: Salt Lake Parafencing Starters. Accessibility unknown.').passed, false);
});
test('private and youth fixtures, or missing disclosures, fail the adult regression', () => {
  for (const extra of ['DEMO - Youth Wheelchair Fencing Intro', 'DEMO - Unpublished Security Test', 'SC-DEMO-PRIVATE']) {
    assert.equal(assessMatchingAnswer('Synthetic: DEMO - Adult Wheelchair Fencing Intro. Unknown. '+extra, { adultOnly: true }).passed, false);
  }
  assert.equal(assessMatchingAnswer('DEMO - Adult Wheelchair Fencing Intro').passed, false);
});
