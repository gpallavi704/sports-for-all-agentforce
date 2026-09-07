import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const base = 'force-app/main/default/';
const page = read(base + 'pages/SportCompassJudgeDemo.page');
const script = page.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
function harness(fail = false) {
  const elements = new Map(); const listeners = new Map();
  const calls = { init: [], scripts: [], launch: 0 };
  const context = vm.createContext({
    document: { getElementById(id) { if (!elements.has(id)) elements.set(id, {disabled: true, textContent: ''}); return elements.get(id); }, createElement: () => ({}), body: {appendChild: s => calls.scripts.push(s)} },
    window: {addEventListener: (name, fn) => listeners.set(name, fn), setTimeout: () => {}},
    embeddedservice_bootstrap: {settings: {}, init: (...args) => calls.init.push(args), utilAPI: {launchChat: async () => {calls.launch++; if (fail) throw Error('Unavailable');}}}
  });
  vm.runInContext(script, context);
  return {context, elements, calls, ready: () => listeners.get('onEmbeddedMessagingButtonCreated')()};
}
test('judge operator permission does not grant general CRM edits or public administration', () => {
  const ps = read(base + 'permissionsets/SportCompass_Judge_Operator.permissionset-meta.xml');
  assert.match(ps, /<name>EmbeddedMessagingAgent<\/name>/);
  assert.doesNotMatch(ps, /<(?:allowCreate|allowEdit|allowDelete|viewAllRecords|modifyAllRecords)>true/);
  assert.doesNotMatch(ps, /LMEndMessagingSessionUserPerm|ModifyAllData|ViewAllData|CustomizeApplication/);
});
test('judge route and presence are separate from public support', () => {
  const queue = read(base + 'queues/SportCompass_Judge_Queue.queue-meta.xml');
  const presence = read(base + 'presenceUserConfigs/SportCompass_Judge_Operator.presenceUserConfig-meta.xml');
  const channel = read(base + 'messagingChannels/SportCompass_JudgeDemo.messagingChannel-meta.xml');
  assert.match(queue, /sportcompass\.judge\.2026@/);
  assert.match(presence, /sportcompass\.judge\.2026@/);
  assert.doesNotMatch(queue + presence, /gpallavi421afg|SportCompass_Web_Fallback|<allInternalUsers>true/);
  assert.match(channel, /<sessionHandlerQueue>SportCompass_Judge_Queue<\/sessionHandlerQueue>/);
  assert.match(channel, /<sessionHandlerType>Queue<\/sessionHandlerType>/);
  assert.match(channel, /<isAgentAvlCheckEnabled>true<\/isAgentAvlCheckEnabled>/);
  assert.match(channel, /<isAttachmentUploadEnabled>false<\/isAttachmentUploadEnabled>/);
});
test('assignment has an explicit expiry and checks its scope before changes', () => {
  const setup = read('scripts/setup-judge-chat.apex');
  assert.match(setup, /Datetime\.newInstanceGMT\(2026, 9, 23, 6, 59, 59\)/);
  assert.match(setup, /ExpirationDate = expiresAt/);
  assert.match(setup, /System\.assertEquals\(0, \[SELECT count\(\) FROM GroupMember WHERE GroupId = :publicQueue.Id/);
  assert.match(setup, /PermissionsEdit = true/);
});
test('judge page is controller-free, clearly labeled and has no credential collection', () => {
  assert.match(page, /fictional information only/);
  assert.match(page, /visitor link is not authenticated/);
  assert.match(page, /aria-live="polite"/);
  assert.match(page, /noindex,nofollow/);
  assert.doesNotMatch(page, /\u2014|controller=|standardController=|client_secret|<input|fetch\(/);
});
test('one bootstrap selects only the judge channel and does not launch automatically', () => {
  const h = harness(); h.context.initJudgeMessaging();
  assert.equal(h.calls.scripts.length, 1);
  assert.match(h.calls.scripts[0].src, /ESWSportCompassJudgeDemo1788819864571\/assets\/js\/bootstrap.min.js$/);
  assert.equal(h.calls.init[0][1], 'SportCompass_JudgeDemo');
  assert.equal(h.context.embeddedservice_bootstrap.settings.restrictSessionOnMessagingChannel, true);
  h.context.openJudgeChat(); assert.equal(h.calls.launch, 0);
});
test('launch requires readiness and does not claim operator acceptance', async () => {
  const h = harness(); h.ready(); h.context.openJudgeChat();
  await new Promise(setImmediate);
  assert.equal(h.calls.launch, 1);
  assert.equal(h.elements.get('start-chat').disabled, false);
  assert.match(h.elements.get('chat-status').textContent, /does not mean a representative has accepted/);
});
test('unavailable and failed chat show an actionable fallback', async () => {
  const h = harness(true); h.context.judgeChatUnavailable();
  assert.match(h.elements.get('chat-status').textContent, /Available - Judge Demo Chat/);
  h.ready(); h.context.openJudgeChat(); await new Promise(setImmediate);
  assert.match(h.elements.get('chat-status').textContent, /could not open/);
});
