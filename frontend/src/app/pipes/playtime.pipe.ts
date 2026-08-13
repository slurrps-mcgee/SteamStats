import { Pipe, type PipeTransform } from '@angular/core';

/**
 * Formats a duration in minutes as a human-readable playtime string, e.g.
 * `125` -> `"2h 5m"`, `45` -> `"45m"`.
 */
@Pipe({ name: 'playtime' })
export class PlaytimePipe implements PipeTransform {
  transform(minutes: number | null | undefined): string {
    if (!minutes || minutes <= 0) {
      return '0h';
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
      return `${remainingMinutes}m`;
    }

    return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`;
  }
}
