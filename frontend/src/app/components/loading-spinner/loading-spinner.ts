import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/** Centered loading indicator used while data is being fetched. */
@Component({
  selector: 'app-loading-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loading-spinner.html',
  imports: [MatProgressSpinnerModule],
})
export class LoadingSpinner {
  readonly diameter = input(40);
  readonly label = input<string>();
}
