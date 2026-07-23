/** Thrown when a SteamID64/profile cannot be resolved or found. */
export class SteamNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SteamNotFoundError';
  }
}