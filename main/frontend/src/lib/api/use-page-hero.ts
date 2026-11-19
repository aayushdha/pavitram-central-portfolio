"use client";

import { useEffect, useState } from "react";
import { getPage } from "./cms";

export type PageHeroContent = {
  title: string;
  hindi: string;
  subtitle?: string;
};

/**
 * Fetches the "hero" section of a CMS page (see main_pages / main_page_sections)
 * and merges it over the given fallback, so About pages stay fully editable
 * from Super Admin > Pages & Sections without ever showing blank content.
 */
export function usePageHero(slug: string, fallback: PageHeroContent): PageHeroContent {
  const [content, setContent] = useState<PageHeroContent>(fallback);

  useEffect(() => {
    let active = true;
    getPage(slug).then((page) => {
      if (!active || !page) return;
      const hero = page.sections?.hero;
      if (!hero) return;
      setContent({
        title: hero.title || fallback.title,
        hindi: hero.hindi || fallback.hindi,
        subtitle: hero.subtitle || fallback.subtitle,
      });
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return content;
}
