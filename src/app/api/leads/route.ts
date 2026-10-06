import { NextResponse } from 'next/server';
import { z } from 'zod';
import { categories, industries } from '@/lib/content';
import { deliverToHubSpot, readHubSpotConfig } from '@/lib/hubspot';
const schema = z.object({ intent: z.enum(['audit', 'demo', 'quote', 'partner', 'general']), model: z.enum(['Undecided', 'Buy', 'Lease', 'Rent', 'RaaS']), name: z.string().trim().min(1).max(100), email: z.email().max(254), company: z.string().trim().min(1).max(150), region: z.string().trim().min(1).max(100), industry: z.enum([...industries.map(([name]) => name), 'Other']), category: z.enum([...categories.map(c => c.slug), 'ai-infrastructure', 'autonomous-operations', 'other']), message: z.string().trim().min(20).max(5000), consent: z.literal(true), website: z.string().max(500).optional() });
export async function POST(request: Request) { const origin = request.headers.get('origin'); const allowed = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://aervynt.ai').origin; if (origin !== allowed)
    return NextResponse.json({ error: 'This request origin is not permitted.' }, { status: 403 }); if (!request.headers.get('content-type')?.includes('application/json'))
    return NextResponse.json({ error: 'JSON is required.' }, { status: 415 }); let raw: string; try {
    raw = await request.text();
}
catch {
    return NextResponse.json({ error: 'Unable to read request.' }, { status: 400 });
} if (Buffer.byteLength(raw) > 16000)
    return NextResponse.json({ error: 'The enquiry is too large.' }, { status: 413 }); let payload: unknown; try {
    payload = JSON.parse(raw);
}
catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
} const result = schema.safeParse(payload); if (!result.success)
    return NextResponse.json({ error: 'Please check the required fields and provide a project description of at least 20 characters.' }, { status: 400 }); if (result.data.website)
    return NextResponse.json({ ok: true });
if (process.env.LEAD_PROVIDER === 'hubspot') {
    let config;
    try { config = readHubSpotConfig(process.env); }
    catch { return NextResponse.json({ error: 'Online enquiries are not available yet. Please try again once the contact service is enabled.' }, { status: 503 }); }
    try {
        await deliverToHubSpot(result.data, config);
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('HubSpot transport failure', error instanceof Error ? error.name : 'UnknownError');
        return NextResponse.json({ error: 'Your enquiry could not be delivered. Please retry shortly.' }, { status: 502 });
    }
}
const endpoint = process.env.LEAD_WEBHOOK_URL; const token = process.env.LEAD_WEBHOOK_TOKEN; if (!endpoint || !token)
    return NextResponse.json({ error: 'Online enquiries are not available yet. Please try again once the contact service is enabled.' }, { status: 503 }); try {
    if (new URL(endpoint).protocol !== 'https:')
        throw new Error('Invalid webhook');
}
catch {
    return NextResponse.json({ error: 'The contact service is unavailable.' }, { status: 503 });
} try {
    const { website: _website, ...lead } = result.data;
    void _website;
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ source: 'aervynt.ai', submittedAt: new Date().toISOString(), ...lead }), signal: AbortSignal.timeout(10000), redirect: 'error' });
    if (!response.ok)
        throw new Error('delivery failed');
    return NextResponse.json({ ok: true });
}
catch {
    return NextResponse.json({ error: 'Your enquiry could not be delivered. Please retry shortly.' }, { status: 502 });
} }