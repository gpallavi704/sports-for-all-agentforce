import { z } from 'zod';

// Presentation identities mirror the reviewed Public_Fencing_Club metadata.
// They can appear only when the latest successful Salesforce reply contains
// BOTH that identity and its allowlisted website. This is not a new search index.
export const clubIdentities = Object.freeze([
  { id: 'wasatch', name: 'Wasatch Fencing Club', city: 'Kaysville', state: 'UT', website: 'https://www.wasatchfencing.com/', sourceUrl: 'https://www.usafencingutah.com/utah-idaho-clubs', checkedOn: '2026-09-06' },
  { id: 'salt-city', name: 'Salt City Swords Fencing Club', city: 'Salt Lake City', state: 'UT', website: 'https://www.saltcityswords.com/', sourceUrl: 'https://www.usafencingutah.com/utah-idaho-clubs', checkedOn: '2026-09-06' }
]);
export const visitSchema = z.object({
  kind: z.literal('sport-compass-first-visit'), version: z.literal(1),
  guidance: z.array(z.string().max(12000)).max(10),
  clubs: z.array(z.object({
    id: z.string(), name: z.string(), city: z.string(), state: z.string(),
    website: z.string().url(), sourceUrl: z.string().url(), checkedOn: z.string(),
    wheelchairFencing: z.literal('Needs confirmation'), stepFreeAccess: z.literal('Needs confirmation'),
    loanerEquipment: z.literal('Needs confirmation')
  }).strict()).max(2),
  sources: z.array(z.string().url()).max(24),
  directoryUrl: z.literal('https://member.usafencing.org/clubs'),
  generatedAt: z.number(),
  notice: z.string()
}).strict();

export function buildVisitModel(messages, publicUrls, now = Date.now()) {
  const guidance = messages.map(m => m.text).filter(t => typeof t === 'string').slice(0, 10);
  const text = guidance.join('\n');
  const allowed = new Set(publicUrls.map(url => new URL(url).href));
  const sources = [...new Set((text.match(/https?:\/\/[^\s<>"\])]+/g) || []).flatMap(raw => {
    try { const url = new URL(raw.replace(/[.,;:!?]+$/, '')).href; return allowed.has(url) ? [url] : []; }
    catch { return []; }
  }))].slice(0, 24);
  // Fail closed for empty/negative listings and stale reviewed identities.
  const noListing = /\bno (?:current |reviewed |confirmed )?(?:club (?:entry|listing)|listing)|\bnot (?:a real|a current|an? available) club/i.test(text);
  const clubs = noListing ? [] : clubIdentities.filter(club => {
    const age = now - Date.parse(club.checkedOn);
    return age >= 0 && age <= 90 * 86400000 && text.includes(club.name)
      && sources.includes(club.website) && allowed.has(club.sourceUrl);
  }).map(club => ({ ...club, wheelchairFencing: 'Needs confirmation', stepFreeAccess: 'Needs confirmation', loanerEquipment: 'Needs confirmation' }));
  return visitSchema.parse({ kind: 'sport-compass-first-visit', version: 1, guidance, clubs, sources,
    directoryUrl: 'https://member.usafencing.org/clubs', generatedAt: now,
    notice: 'Public club identities mentioned in Salesforce guidance, not verified parafencing providers. Personal checklist marks do not verify club accessibility. Nothing is booked or sent.' });
}
