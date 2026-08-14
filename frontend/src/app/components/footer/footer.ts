import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  protected readonly licenseUrl =
    'https://github.com/slurrps-mcgee/SteamStats/blob/main/LICENSE';
  protected readonly githubUrl = 'https://github.com/slurrps-mcgee/SteamStats';
}
