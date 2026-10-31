import { useEffect } from 'react';
import { SITE_ORIGIN, SITE_TITLE, type PageSeo } from './seo';

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}
function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Every new address: its own canonical link and the description of the page from lib/seo, or
 * the site's general one (a page with its own entry sets it again right after, usePageMeta).
 */
export function applyDefaultMeta(path: string, seo: PageSeo | undefined, fallback: PageSeo) {
  const p = seo ?? fallback;
  setMeta('name', 'description', p.description);
  setLink('canonical', SITE_ORIGIN + path);
  setMeta('property', 'og:title', p.title);
  setMeta('property', 'og:description', p.description);
  setMeta('property', 'og:url', SITE_ORIGIN + path);
}

/** Keeps <head> right for a page that has its own entry in lib/seo (title, description, canonical, preview). */
export function usePageMeta(p: PageSeo | null) {
  useEffect(() => {
    if (!p) return;
    document.title = p.path === '/' ? SITE_TITLE : `${p.title} · ${SITE_TITLE}`;
    setMeta('name', 'description', p.description);
    setLink('canonical', SITE_ORIGIN + p.path);
    setMeta('property', 'og:title', p.title);
    setMeta('property', 'og:description', p.description);
    setMeta('property', 'og:url', SITE_ORIGIN + p.path);
    if (p.image) setMeta('property', 'og:image', SITE_ORIGIN + p.image);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p?.path, p?.title, p?.description]);
}
