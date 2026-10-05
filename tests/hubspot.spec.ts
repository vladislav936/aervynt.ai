import { test, expect } from '@playwright/test';
import { buildHubSpotSubmission, deliverToHubSpot, readHubSpotConfig, type HubSpotConfig } from '../src/lib/hubspot';

// Fixture property names are test-only, not assumptions about the live form.
const config: HubSpotConfig = {
  portalId: '247218560', formId: '658e0c50-acd7-42d2-b0dd-52917cd88852',
  siteUrl: 'https://aervynt.ai',
  fields: { email: 'email', name: 'test_full_name', company: 'company', enquiry: 'test_enquiry' },
};
const lead = {
  name: 'Test Operator', email: 'test@example.com', company: 'Test Company',
  region: 'UAE', intent: 'audit', model: 'RaaS', industry: 'AI Data Centers',
  category: 'quadruped-robots', message: 'Inspect a facility with defined routes.', consent: true as const,
};

test('HubSpot mapping preserves all enquiry context without marketing consent', () => {
  const payload = buildHubSpotSubmission(lead, config);
  expect(payload.fields.find(f => f.name === 'test_full_name')?.value).toBe(lead.name);
  const text = payload.fields.find(f => f.name === 'test_enquiry')?.value;
  for (const value of [lead.name, lead.company, lead.region, lead.intent, lead.model, lead.industry, lead.category, lead.message]) expect(text).toContain(value);
  expect(payload.legalConsentOptions.consent.communications).toEqual([]);
  expect(payload.legalConsentOptions.consent.consentToProcess).toBe(true);
});

test('HubSpot delivery acknowledges only an accepted submission', async () => {
  let destination = '';
  let body = '';
  const accepted: typeof fetch = async (url, options) => {
    destination = String(url); body = String(options?.body);
    expect(options?.redirect).toBe('error');
    return new Response('{}', { status: 200 });
  };
  await deliverToHubSpot(lead, config, accepted);
  expect(destination).toBe(`https://api.hsforms.com/submissions/v3/integration/submit/${config.portalId}/${config.formId}`);
  expect(JSON.parse(body).fields[0].value).toBe(lead.email);
  await expect(deliverToHubSpot(lead, config, async () => new Response('{}', { status: 400 }))).rejects.toThrow('HubSpot did not accept');
  await expect(deliverToHubSpot(lead, config, async () => { throw new Error('network failure'); })).rejects.toThrow('network failure');
});

test('HubSpot refuses unverified or duplicate field mappings', () => {
  expect(() => readHubSpotConfig({ HUBSPOT_PORTAL_ID: config.portalId, HUBSPOT_FORM_ID: config.formId })).toThrow();
  expect(() => readHubSpotConfig({ HUBSPOT_PORTAL_ID: config.portalId, HUBSPOT_FORM_ID: config.formId, HUBSPOT_FIELD_MAP: JSON.stringify({ ...config.fields, company: 'email' }) })).toThrow();
});

test('existing AERVYNT form uses only verified email and message fields', () => {
  const payload = buildHubSpotSubmission(lead, { ...config, fields: { email: 'email', enquiry: 'message' } });
  expect(payload.fields.map(f => f.name)).toEqual(['email', 'message']);
  expect(payload.fields[1].value).toContain(`Name: ${lead.name}`);
  expect(payload.fields[1].value).toContain(`Company: ${lead.company}`);
});
