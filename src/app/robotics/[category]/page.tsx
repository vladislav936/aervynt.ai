import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { categories, models } from '@/lib/content';
import { Button, SectionHeading } from '@/components/ui';
export function generateStaticParams() { return categories.map(c => ({ category: c.slug })); }
export async function generateMetadata({ params }: {
    params: Promise<{
        category: string;
    }>;
}): Promise<Metadata> { const { category } = await params; const c = categories.find(c => c.slug === category); return c ? { title: c.name, description: c.description, alternates: { canonical: `/robotics/${c.slug}` }, openGraph: { title: c.name, description: c.description, url: `/robotics/${c.slug}` } } : {}; }
export default async function Category({ params }: {
    params: Promise<{
        category: string;
    }>;
}) { const { category } = await params; const c = categories.find(c => c.slug === category); if (!c)
    notFound(); return <><section className="page-hero container"><Link className="breadcrumb" href="/robotics">← Robotics portfolio</Link><p className="eyebrow">{c.tag}</p><h1>{c.name}</h1><p className="hero-description">{c.description}</p><div className="actions"><Button href={`/contact?intent=quote&category=${c.slug}`}>Request a Quote</Button><Button secondary href={`/contact?intent=demo&category=${c.slug}`}>Book a Demo</Button></div></section><section className="section container"><SectionHeading label="APPLICATIONS TO EXPLORE" title="Start with a defined workflow."/><div className="detail-grid">{c.uses.map((u, i) => <article className="detail-card" key={u}><p className="eyebrow">USE CASE / 0{i + 1}</p><h2>{u}</h2><p>Scope the environment, task frequency and acceptance criteria with your team.</p></article>)}</div></section><section className="section container"><SectionHeading label="DEPLOYMENT REQUIREMENTS" title="Validate before you scale." text={c.requirements}/><p className="disclaimer">This is a capability category, not a live inventory listing. Model selection, payload, runtime, certifications, availability and territory eligibility are confirmed in the proposal.</p></section><section className="section container"><SectionHeading label="AVAILABLE STRUCTURES TO DISCUSS" title="Choose how to deploy."/><div className="industry-links">{models.map(([model]) => <Link href={`/contact?intent=quote&category=${c.slug}&model=${model}`} key={model}>{model}<span>↗</span></Link>)}</div></section></>; }
