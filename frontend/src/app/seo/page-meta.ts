import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

export const SITE_NAME = 'SteamStats';

const DEFAULT_DESCRIPTION =
  'Steam companion dashboard for public Steam profiles, game libraries, and playtime stats.';

@Injectable({ providedIn: 'root' })
export class PageMeta {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  set(options: { title?: string | null; description?: string | null; path?: string }): void {
    const pageTitle = options.title?.trim();
    const fullTitle = pageTitle ? `${SITE_NAME} — ${pageTitle}` : SITE_NAME;
    const description = options.description?.trim() || DEFAULT_DESCRIPTION;
    const path = options.path ?? this.document.location.pathname;
    const canonical = `${this.document.location.origin}${path.split('?')[0]}`;

    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: canonical });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.setCanonical(canonical);
  }

  private setCanonical(href: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }
}

@Injectable()
export class SteamStatsTitleStrategy extends TitleStrategy {
  private readonly pageMeta = inject(PageMeta);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    let route = snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }

    const description = route.data['description'] as string | undefined;
    this.pageMeta.set({
      title: this.buildTitle(snapshot),
      description,
      path: snapshot.url,
    });
  }
}
