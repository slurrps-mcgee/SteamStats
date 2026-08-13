import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** A single statistic tile used on the dashboard (e.g. Total Games, Total Hours). */
@Component({
  selector: 'app-stat-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="rounded-2xl bg-steam-card/80 backdrop-blur-sm border border-white/5 shadow-lg p-5 flex flex-col gap-2"
    >
      <div class="flex items-center gap-2 text-slate-400 text-sm">
        @if (icon()) {
          <mat-icon class="!text-base !w-4 !h-4">{{ icon() }}</mat-icon>
        }
        <span>{{ label() }}</span>
      </div>
      <div class="text-2xl font-semibold text-white">{{ value() }}</div>
      @if (subtitle()) {
        <div class="text-xs text-slate-500">{{ subtitle() }}</div>
      }
    </div>
  `,
  imports: [MatIconModule],
})
export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input<string>();
  readonly subtitle = input<string>();
}
