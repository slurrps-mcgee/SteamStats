/** Thrown when a SteamID64/profile cannot be resolved or found. */
export class SteamNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SteamNotFoundError';
  }
}

/** Thrown when the Steam Web API returns an unexpected or failed response. */
export class SteamApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 502,
  ) {
    super(message);
    this.name = 'SteamApiError';
  }
}

/**
 * Thrown when Steam Store API fails.
 */
export class SteamStoreApiError extends Error {

  constructor(
    message: string,
    public readonly statusCode = 502,
  ) {

    super(message);

    this.name =
      'SteamStoreApiError';
  }
}