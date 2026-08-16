/** Ordered Steam CDN artwork URLs sized for library cards (never community icons). */
export function steamHeaderCandidates(appId: number, storeHeader?: string | null): string[] {
  const urls = [
    storeHeader?.trim() || '',
    `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
    `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/library_hero.jpg`,
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`,
  ].filter((url) => url.length > 0);

  return [...new Set(urls)];
}
