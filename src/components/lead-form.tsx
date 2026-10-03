'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { categories, industries } from '@/lib/content';
const intents = [['audit', 'Robotics Audit'], ['demo', 'Book a Demo'], ['quote', 'Request a Quote'], ['partner', 'Become a Technology Partner'], ['general', 'General enquiry']];
export function LeadForm() { const query = useSearchParams(); const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle'); const [message, setMessage] = useState(''); async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; setStatus('sending'); setMessage(''); try {
    const data = Object.fromEntries(new FormData(form));
    const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, consent: data.consent === 'on' }) });
    const result = await res.json();
    if (!res.ok)
        throw new Error(result.error || 'Submission could not be completed. Please try again.');
    setStatus('success');
    setMessage('Your enquiry has been received. Thank you for sharing your project.');
    form.reset();
}
catch (error) {
    setStatus('error');
    setMessage(error instanceof Error ? error.message : 'Please try again.');
} } return <form className="lead-form" onSubmit={submit}><div className="form-grid"><label>How can we help?<select name="intent" defaultValue={intents.some(([v]) => v === query.get('intent')) ? query.get('intent')! : 'general'}>{intents.map(([v, label]) => <option value={v} key={v}>{label}</option>)}</select></label><label>Commercial model<select name="model" defaultValue={['Buy', 'Lease', 'Rent', 'RaaS'].includes(query.get('model') || '') ? query.get('model')! : 'Undecided'}>{['Undecided', 'Buy', 'Lease', 'Rent', 'RaaS'].map(v => <option key={v}>{v}</option>)}</select></label><label>Your name<input name="name" autoComplete="name" required maxLength={100}/></label><label>Work email<input name="email" type="email" autoComplete="email" required maxLength={254}/></label><label>Company<input name="company" autoComplete="organization" required maxLength={150}/></label><label>Country / region<input name="region" autoComplete="country-name" required maxLength={100}/></label><label>Industry<select name="industry" defaultValue={industries.some(([name]) => name === query.get('industry')) ? query.get('industry')! : 'Other'}>{industries.map(([name]) => <option key={name}>{name}</option>)}<option>Other</option></select></label><label>Area of interest<select name="category" defaultValue={categories.some(c => c.slug === query.get('category')) ? query.get('category')! : 'ai-infrastructure'}><option value="ai-infrastructure">AI Infrastructure & Liquid Cooling</option>{categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}<option value="autonomous-operations">Autonomous Data Center Operations</option><option value="other">Other / multiple areas</option></select></label></div><label>Tell us about your project<textarea name="message" required minLength={20} maxLength={5000} rows={5} placeholder="Describe the task, facility, timeline and what success would look like."/></label><div className="honey" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div><label className="consent"><input type="checkbox" name="consent" required/><span>I agree to the processing of my enquiry as described in the <Link href="/privacy">privacy notice</Link>.</span></label><p className="form-note">Please avoid sharing confidential, sensitive or personal health information.</p><button type="submit" className="button" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send enquiry'}<span aria-hidden="true">↗</span></button><p role="status" aria-live="polite" className={`form-status ${status}`}>{message}</p></form>; }
