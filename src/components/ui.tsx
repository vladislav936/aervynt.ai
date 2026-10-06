import Link from 'next/link';
export function Button({ href, children, secondary = false }: {
    href: string;
    children: React.ReactNode;
    secondary?: boolean;
}) { return <Link className={`button ${secondary ? 'secondary' : ''}`} href={href}>{children}<span aria-hidden="true">↗</span></Link>; }
export function SectionHeading({ label, title, text }: {
    label: string;
    title: string;
    text?: string;
}) { return <div className="section-heading"><p className="eyebrow">{label}</p><h2>{title}</h2>{text && <p className="muted">{text}</p>}</div>; }
export function CTA() { return <section className="cta container"><div><p className="eyebrow">START WITH THE RIGHT QUESTIONS</p><h2>Your next operation<br />starts here.</h2><p>Identify the use case. Understand the constraints. Build the right solution.</p></div><Button href="/contact?intent=audit">Start a Robotics Audit</Button></section>; }
