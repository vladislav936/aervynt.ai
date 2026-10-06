import type { MetadataRoute } from 'next';
import { categories, pages } from '@/lib/content';
export default function sitemap(): MetadataRoute.Sitemap { const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://aervynt.ai'; return ['/', ...Object.keys(pages).map(p => `/${p}`), ...categories.map(c => `/robotics/${c.slug}`), '/contact', '/privacy'].map(path => ({ url: new URL(path, base).href, changeFrequency: 'monthly', priority: path === '/' ? 1 : 0.7 })); }
