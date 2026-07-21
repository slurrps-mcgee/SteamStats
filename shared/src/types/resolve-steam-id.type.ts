/** Request body for `POST /api/v1/resolve`. */
export interface ResolveSteamIdRequest {
  /** A SteamID64, a full profile URL, or a vanity URL/name. */
  input: string;
}

/** Response payload for `POST /api/v1/resolve`. */
export interface ResolveSteamIdResponse {
  steamId: string;
}
