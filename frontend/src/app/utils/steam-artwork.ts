/** Ordered Steam CDN artwork URLs sized for library cards (never community icons). */
export function steamHeaderCandidates(appId: number): string[] {
  return [
    `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
    `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/library_hero.jpg`,
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`,
  ];
}