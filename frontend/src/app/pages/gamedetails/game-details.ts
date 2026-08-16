import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GameDetailsStore } from '../../stores/game-details.store';
import { LoadingSpinner } from '../../components/loading-spinner/loading-spinner';
import { PageMeta } from '../../seo/page-meta';

const ABOUT_READ_MORE_THRESHOLD = 600;

@Component({
  selector: 'app-game-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoadingSpinner, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './game-details.html',
  styleUrl: './game-details.scss',
})
export class GameDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly pageMeta = inject(PageMeta);
  protected readonly store = inject(GameDetailsStore);

  private readonly appId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id'))), {
    initialValue: this.route.snapshot.paramMap.get('id'),
  });

  protected readonly selectedScreenshot = signal<string | null>(null);
  protected readonly aboutExpanded = signal(false);

  protected readonly safeDescription = computed((): SafeHtml | null => {
    const html = this.store.active()?.description;
    return html ? this.sanitizer.bypassSecurityTrustHtml(html) : null;
  });

  protected readonly needsAboutReadMore = computed(() => {
    const html = this.store.active()?.description ?? '';
    return html.length > ABOUT_READ_MORE_THRESHOLD;
  });

  protected readonly safeMinimumReqs = computed((): SafeHtml | null => {
    const html = this.store.active()?.requirements?.minimum;
    return html ? this.sanitizer.bypassSecurityTrustHtml(html) : null;
  });

  protected readonly safeRecommendedReqs = computed((): SafeHtml | null => {
    const html = this.store.active()?.requirements?.recommended;
    return html ? this.sanitizer.bypassSecurityTrustHtml(html) : null;
  });

  protected readonly platformLabels = computed(() => {
    const platforms = this.store.active()?.platforms;
    if (!platforms) {
      return [];
    }
    const labels: { icon: string; label: string }[] = [];
    if (platforms.windows) labels.push({ icon: 'desktop_windows', label: 'Windows' });
    if (platforms.mac) labels.push({ icon: 'laptop_mac', label: 'Mac' });
    if (platforms.linux) labels.push({ icon: 'terminal', label: 'Linux' });
    return labels;
  });

  constructor() {
    effect(() => {
      const id = this.appId();
      if (!id) {
        return;
      }
      this.selectedScreenshot.set(null);
      this.aboutExpanded.set(false);
      this.store.ensureGameDetails(id);
    });

    effect(() => {
      const screenshots = this.store.active()?.screenshots ?? [];
      if (screenshots.length > 0 && !this.selectedScreenshot()) {
        this.selectedScreenshot.set(screenshots[0].full);
      }
    });

    effect(() => {
      const details = this.store.active();
      if (details) {
        this.pageMeta.set({
          title: details.name,
          description: `${details.name} on Steam Stats — store details, screenshots, and playtime context.`,
        });
      }
    });
  }

  selectScreenshot(url: string): void {
    this.selectedScreenshot.set(url);
  }

  toggleAbout(): void {
    this.aboutExpanded.update((open) => !open);
  }

  steamStoreUrl(appId: number): string {
    return `https://store.steampowered.com/app/${appId}`;
  }
}
