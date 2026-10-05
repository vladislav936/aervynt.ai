import { z } from 'zod';

export interface Enquiry {
  name: string; email: string; company: string; region: string;
  intent: string; model: string; industry: string; category: string;
  message: string; consent: true;
}

const fieldName = z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/);
const configSchema = z.object({
  portalId: z.string().regex(/^\d+$/),
  formId: z.uuid(),
  siteUrl: z.url(),
  // Internal property names must be verified against the published form.
  fields: z.object({ email: fieldName, name: fieldName.optional(), company: fieldName.optional(), enquiry: fieldName }),
}).superRefine((config, context) => {
  const configured = Object.values(config.fields).filter(Boolean);
  if (new Set(configured).size !== configured.length) {
    context.addIssue({ code: 'custom', message: 'HubSpot field mappings must be distinct.' });
  }
});
export type HubSpotConfig = z.infer<typeof configSchema>;

export function readHubSpotConfig(env: Record<string, string | undefined>): HubSpotConfig {
  return configSchema.parse({
    portalId: env.HUBSPOT_PORTAL_ID,
    formId: env.HUBSPOT_FORM_ID,
    siteUrl: env.NEXT_PUBLIC_SITE_URL || 'https://aervynt.ai',
    fields: JSON.parse(env.HUBSPOT_FIELD_MAP || '{}'),
  });
}

export function buildHubSpotSubmission(lead: Enquiry, config: HubSpotConfig) {
  const enquiry = [
    `Name: ${lead.name}`, `Company: ${lead.company}`,
    `Enquiry: ${lead.intent}`, `Commercial model: ${lead.model}`,
    `Country / region: ${lead.region}`, `Industry: ${lead.industry}`,
    `Area of interest: ${lead.category}`, '', lead.message,
  ].join('\n');
  return {
    fields: [
      { objectTypeId: '0-1', name: config.fields.email, value: lead.email },
      ...(config.fields.name ? [{ objectTypeId: '0-1', name: config.fields.name, value: lead.name }] : []),
      ...(config.fields.company ? [{ objectTypeId: '0-1', name: config.fields.company, value: lead.company }] : []),
      { objectTypeId: '0-1', name: config.fields.enquiry, value: enquiry },
    ],
    context: { pageUri: new URL('/contact', config.siteUrl).href, pageName: 'AERVYNT AI enquiry' },
    legalConsentOptions: { consent: {
      consentToProcess: lead.consent,
      text: 'I agree to the processing of my enquiry as described in the privacy notice.',
      // Enquiry consent must not become a marketing subscription.
      communications: [],
    } },
  };
}

export async function deliverToHubSpot(lead: Enquiry, config: HubSpotConfig, transport: typeof fetch = fetch) {
  const verified = configSchema.parse(config);
  const response = await transport(
    `https://api.hsforms.com/submissions/v3/integration/submit/${verified.portalId}/${verified.formId}`,
    {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildHubSpotSubmission(lead, verified)),
      signal: AbortSignal.timeout(10000), redirect: 'error',
    },
  );
  if (!response.ok) throw new Error('HubSpot did not accept the enquiry.');
}
