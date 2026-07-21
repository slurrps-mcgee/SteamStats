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
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  template: `
    <form class="flex items-stretch gap-3 w-full" (submit)="onSubmit($event)">
      <mat-form-field appearance="outline" class="flex-1 steam-search-field" subscriptSizing="dynamic">
        <mat-icon matPrefix class="text-slate-400 mr-1">search</mat-icon>
        <input
          matInput
          [formControl]="control"
          placeholder="Enter a SteamID64 or profile URL (e.g. https://steamcommunity.com/id/example)"
        />
      </mat-form-field>
      <button
        mat-flat-button
        color="primary"
        type="submit"
        class="!h-14 !px-6"
        [disabled]="control.invalid || control.value === ''"
      >
        Search
      </button>
    </form>
  `,
})
export class SearchBar {
  readonly search = output<string>();

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
    this.search.emit(value);
  }
}
