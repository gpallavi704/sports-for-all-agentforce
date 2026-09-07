import { readFileSync } from 'node:fs';
export const VISIT_URI = 'ui://sport-compass/first-visit-v1.html';
export function registerVisitResource(server) {
  // Fail at startup when the reproducible UI bundle has not been built.
  const html = readFileSync(new URL('../dist/first-visit.html', import.meta.url), 'utf8');
  server.registerResource('sport-compass-first-visit', VISIT_URI, { mimeType: 'text/html;profile=mcp-app' }, async () => ({
    contents: [{ uri: VISIT_URI, mimeType: 'text/html;profile=mcp-app', text: html,
      _meta: {
        ui: { prefersBorder: true, csp: { connectDomains: [], resourceDomains: [], frameDomains: [] } },
        'openai/widgetDescription': 'Sport Compass first-visit planner. Public club information, needs-confirmation labels, preparation choices, copyable checklist and unsent contact draft. Local controls make no AI calls.',
        'openai/widgetCSP': { connect_domains: [], resource_domains: [], redirect_domains: ['https://www.wasatchfencing.com', 'https://www.saltcityswords.com', 'https://www.usafencingutah.com', 'https://www.usafencing.org', 'https://member.usafencing.org', 'https://usafencing.zendesk.com', 'https://www.askfred.net'] }
      }
    }]
  }));
}
