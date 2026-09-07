import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const page = readFileSync(new URL('../force-app/main/default/pages/SportCompassPublic.page', import.meta.url), 'utf8');
const script = page.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
const flush = () => new Promise(resolve => setImmediate(resolve));

function harness({ failLaunch = false, failCopy = false, clipboard = true, search = '' } = {}) {
  const elements = new Map();
  const listeners = new Map();
  const calls = { init: [], launch: 0, copied: [], scripts: [] };
  const document = { body: { appendChild: script => calls.scripts.push(script) }, createElement: tag => ({ tagName: tag }), getElementById(id) {
    if (!elements.has(id)) elements.set(id, { textContent: '', disabled: true, classList: { add() {} } });
    return elements.get(id);
  } };
  let timeout;
  const context = vm.createContext({ document, URLSearchParams,
    window: { location: { search, pathname: '/sportcompass' }, addEventListener: (name, fn) => listeners.set(name, fn), setTimeout: fn => { timeout = fn; } },
    navigator: clipboard ? { clipboard: { writeText: async text => { if (failCopy) throw Error('Denied'); calls.copied.push(text); } } } : {},
    embeddedservice_bootstrap: { settings: {}, init: (...args) => calls.init.push(args), utilAPI: { launchChat: async () => { calls.launch++; if (failLaunch) throw Error('Unavailable'); } } }
  });
  vm.runInContext(script, context);
  return { context, elements, calls, ready: () => listeners.get('onEmbeddedMessagingButtonCreated')(), timeout: () => timeout() };
}

test('page has team branding, accessible navigation and no credential fields', () => {
  assert.match(page, /SportCompassTeamAvatar/);
  assert.match(page, /Sports4AllLogo/);
  assert.match(page, /Skip to main content/);
  assert.match(page, /aria-live="polite"/);
  assert.match(page, /prefers-reduced-motion/);
  assert.doesNotMatch(page, /\u2014|client_secret|Authorization:|<input[^>]*password/);
});

test('default bootstrap preserves the existing AI messaging deployment', () => {
  const h = harness(); h.context.initEmbeddedMessaging();
  assert.equal(h.calls.init[0][0], '00DgL00000c7pj3');
  assert.equal(h.calls.init[0][1], 'SportCompass_PublicChat');
  assert.match(h.calls.init[0][2], /^https:\/\/orgfarm-4d89d5ac56\.my\.site\.com\//);
  assert.equal(h.calls.launch, 0);
  assert.equal(h.calls.scripts.length, 1);
  assert.match(h.calls.scripts[0].src, /ESWSportCompassPublicCha1788806382470\/assets\/js\/bootstrap.min.js$/);
  assert.equal(h.context.embeddedservice_bootstrap.settings.restrictSessionOnMessagingChannel, true);
});

test('human view uses only the human Web deployment and channel-scoped history', () => {
  const h = harness({ search: '?support=human' }); h.context.initEmbeddedMessaging();
  assert.equal(h.calls.init.length, 1);
  assert.equal(h.calls.init[0][1], 'SportCompass_HumanSupport');
  assert.match(h.calls.init[0][2], /ESWSportCompassHumanSupp1788815170553$/);
  assert.equal(h.context.embeddedservice_bootstrap.settings.restrictSessionOnMessagingChannel, true);
  assert.equal(h.calls.scripts.length, 1);
  assert.match(h.calls.scripts[0].src, /ESWSportCompassHumanSupp1788815170553\/assets\/js\/bootstrap.min.js$/);
  assert.equal(h.elements.get('suggested-questions').hidden, true);
  assert.equal(h.elements.get('switch-chat').href, '/sportcompass#main');
  assert.equal(h.calls.launch, 0);
});

test('unknown or malicious query values cannot select arbitrary endpoints', () => {
  for (const search of ['?support=other', '?support=https://example.com', '?support=%3Cscript%3E']) {
    const h = harness({ search }); h.context.initEmbeddedMessaging();
    assert.equal(h.calls.init[0][1], 'SportCompass_PublicChat');
    assert.match(h.calls.scripts[0].src, /^https:\/\/orgfarm-4d89d5ac56\.my\.site\.com\//);
  }
});

test('human readiness and launch do not claim operator acceptance', async () => {
  const h = harness({ search: '?support=human' });
  h.ready();
  assert.equal(h.elements.get('start-label').textContent, 'Start human chat');
  assert.equal(h.elements.get('connection-label').textContent, 'Support chat ready');
  h.context.openSportCompass(); await flush();
  assert.equal(h.calls.launch, 1);
  assert.match(h.elements.get('chat-status').textContent, /wait for a team member to accept/);
  assert.match(h.elements.get('chat-status').textContent, /does not mean you are connected/);
});

test('unavailable human chat provides an AI fallback without overriding native availability', () => {
  const h = harness({ search: '?support=human' }); h.timeout();
  assert.match(h.elements.get('chat-status').textContent, /offline/);
  assert.match(h.elements.get('chat-status').textContent, /Ask the AI guide/);
  assert.equal(h.elements.get('start-chat').disabled, true);
  assert.equal(h.calls.launch, 0);
  assert.doesNotMatch(page, /showChatButton\(/);
});

test('switching views is disclosed and requires a user-selected link', () => {
  assert.match(page, /href="\?support=human#main" aria-describedby="switch-note"/);
  assert.match(page, /Switching views resets the chat window/);
  assert.match(page, /AI messages are not automatically shared/);
  assert.doesNotMatch(script, /location\.(assign|replace)\(|location\.href\s*=/);
});

test('launch is blocked before readiness and enabled afterward', async () => {
  const h = harness(); h.context.openSportCompass(); assert.equal(h.calls.launch, 0);
  h.ready(); assert.equal(h.elements.get('start-chat').disabled, false);
  h.context.openSportCompass(); await flush(); assert.equal(h.calls.launch, 1);
  assert.match(h.elements.get('chat-status').textContent, /Chat is open/);
});

test('a loading timeout reports unavailability without starting a session', () => {
  const h = harness(); h.timeout();
  assert.match(h.elements.get('chat-status').textContent, /could not load/);
  assert.equal(h.elements.get('start-chat').disabled, true);
  assert.equal(h.calls.launch, 0);
});

test('failed launch leaves a retry path', async () => {
  const h = harness({ failLaunch: true }); h.ready(); h.context.openSportCompass(); await flush();
  assert.match(h.elements.get('chat-status').textContent, /try again/);
  assert.equal(h.elements.get('start-chat').disabled, false);
});

test('copying a suggested question does not launch or send a chat message', async () => {
  const h = harness(); h.context.copyQuestion({ querySelector: () => ({ textContent: 'A public question?' }) }); await flush();
  assert.deepEqual(h.calls.copied, ['A public question?']);
  assert.equal(h.calls.launch, 0);
  assert.match(h.elements.get('chat-status').textContent, /Nothing has been sent/);
});

test('clipboard failure is communicated, without claiming a successful copy', async () => {
  const h = harness({ failCopy: true }); h.context.copyQuestion({ querySelector: () => ({ textContent: 'A question?' }) }); await flush();
  assert.match(h.elements.get('chat-status').textContent, /blocked by your browser/);
  const missing = harness({ clipboard: false }); missing.context.copyQuestion({ querySelector: () => ({ textContent: 'A question?' }) });
  assert.match(missing.elements.get('chat-status').textContent, /Select and copy/);
});

test('public page documents scope and keeps its guest site isolated', () => {
  assert.match(page, /not an official USA Fencing service/);
  assert.match(page, /project operator can read this conversation/);
  assert.match(page, /cannot access private member records/);
  const site = readFileSync(new URL('../force-app/main/default/sites/SportCompass_Public.site-meta.xml', import.meta.url), 'utf8');
  assert.match(site, /<urlPathPrefix>sportcompass<\/urlPathPrefix>/);
  assert.match(site, /<indexPage>SportCompassPublic<\/indexPage>/);
  assert.match(site, /<allowStandardPortalPages>false<\/allowStandardPortalPages>/);
});

test('judge chat permissions allow viewing without operator or write grants', () => {
  const permissions = readFileSync(new URL('../force-app/main/default/permissionsets/SportCompass_Judge_Chat_Read.permissionset-meta.xml', import.meta.url), 'utf8');
  assert.match(permissions, /<application>SportCompass_Support<\/application>/);
  assert.match(permissions, /<name>CanAccessCE<\/name>/);
  assert.match(permissions, /<field>MessagingSession\.CaseId<\/field>/);
  for (const object of ['MessagingSession', 'MessagingEndUser']) {
    assert.ok(permissions.includes(`<object>${object}</object>`));
  }
  assert.doesNotMatch(permissions, /<(?:allowCreate|allowEdit|allowDelete|editable|modifyAllRecords|viewAllRecords)>true<\//);
  assert.doesNotMatch(permissions, /EmbeddedMessagingAgent|LMEndMessagingSessionUserPerm|CanInitiateMessagingSessions/);
  const app = readFileSync(new URL('../force-app/main/default/applications/SportCompass_Support.app-meta.xml', import.meta.url), 'utf8');
  assert.match(app, /<content>SportCompass_Messaging_Session<\/content>/);
  const recordPage = readFileSync(new URL('../force-app/main/default/flexipages/SportCompass_Messaging_Session.flexipage-meta.xml', import.meta.url), 'utf8');
  assert.match(recordPage, /<componentName>scrt:conversationBody<\/componentName>/);
});

test('human deployment metadata routes directly to the project queue', () => {
  const base = new URL('../force-app/main/default/', import.meta.url);
  const channel = readFileSync(new URL('messagingChannels/SportCompass_HumanSupport.messagingChannel-meta.xml', base), 'utf8');
  assert.match(channel, /<sessionHandlerType>Queue<\/sessionHandlerType>/);
  assert.match(channel, /<sessionHandlerQueue>SportCompass_Web_Fallback<\/sessionHandlerQueue>/);
  assert.doesNotMatch(channel, /<sessionHandlerAsa>/);
  assert.match(channel, /<isAttachmentUploadEnabled>false<\/isAttachmentUploadEnabled>/);
  for (const [name, type] of [['SportCompass_HumanSupport', 'Web'], ['SportCompass_HumanClient', 'API']]) {
    const config = readFileSync(new URL(`EmbeddedServiceConfig/${name}.EmbeddedServiceConfig-meta.xml`, base), 'utf8');
    assert.ok(config.includes(`<deploymentType>${type}</deploymentType>`));
    assert.match(config, /<messagingChannel>SportCompass_HumanSupport<\/messagingChannel>/);
    const branding = config.match(/<branding>([^<]+)<\/branding>/)?.[1];
    if (branding) assert.match(readFileSync(new URL(`brandingSets/${branding}.brandingSet-meta.xml`, base), 'utf8'), /<BrandingSet/);
  }
});
