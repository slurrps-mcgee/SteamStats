import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'steamDate',
  standalone: true,
})
export class SteamDatePipe implements PipeTransform {

  transform(value: number | string | null | undefined): Date | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const timestamp = Number(value);

    if (isNaN(timestamp)) {
      return null;
    }

    // Steam uses seconds, JS Date uses milliseconds
    return new Date(timestamp * 1000);
  }
}