import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

/**
 * Top search input accepting either a SteamID64 or a Steam profile URL.
 * Emits the raw, trimmed input on submit - resolution happens server-side.
 *
 * Uses a native `(submit)` listener (instead of `(ngSubmit)`) since this
 * form only uses a standalone `ReactiveFormsModule` `FormControl` - the
 * `ngSubmit` output/auto-preventDefault behavior is provided by
 * `FormsModule`'s `NgForm` directive, which isn't imported here.
 */
@Component({
  selector: 'app-search-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './search-bar.html',
})
export class SearchBar {
  readonly lookup = output<string>();

  readonly control = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(2)],
  });

  onSubmit(event: Event): void {
    event.preventDefault();
    const value = this.control.value.trim();
    if (value.length === 0) {
      return;
    }
    this.lookup.emit(value);
  }
}
