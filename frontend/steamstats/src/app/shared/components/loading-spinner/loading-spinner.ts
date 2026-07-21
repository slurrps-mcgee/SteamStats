import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/** Centered loading indicator used while data is being fetched. */
@Component({
  selector: 'app-loading-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center gap-3 py-12 text-slate-400">
      <mat-spinner [diameter]="diameter()" color="primary" />
      @if (label()) {
        <span class="text-sm">{{ label() }}</span>
      }
    </div>
  `,
  imports: [MatProgressSpinnerModule],
})
export class LoadingSpinner {
  readonly diameter = input(40);
  readonly label = input<string>();
}
