/**
 * Utilities for parsing and validating Steam identifiers.
 *
 * A SteamID64 is always a 17-digit number starting with `7656119`.
 */
const STEAM_ID64_REGEX = /^7656119\d{10}$/;
const PROFILES_URL_REGEX = /steamcommunity\.com\/profiles\/(\d+)/i;
const VANITY_URL_REGEX = /steamcommunity\.com\/id\/([^/?#]+)/i;

export type ParsedSteamInput =
  | { kind: 'steamId64'; value: string }
  | { kind: 'vanity'; value: string };

/** Returns true if the given string is a syntactically valid SteamID64. */
export function isSteamId64(value: string): boolean {
  return STEAM_ID64_REGEX.test(value);
}

/**
 * Parses user-supplied input (a SteamID64, a profile URL, or a vanity name)
 * into either an already-resolved SteamID64 or a vanity name that still
 * needs to be resolved via the Steam Web API.
 */
export function parseSteamInput(rawInput: string): ParsedSteamInput {
  const input = rawInput.trim();

  if (isSteamId64(input)) {
    return { kind: 'steamId64', value: input };
  }

  const profileMatch = input.match(PROFILES_URL_REGEX);
  if (profileMatch) {
    return { kind: 'steamId64', value: profileMatch[1] };
  }

  const vanityMatch = input.match(VANITY_URL_REGEX);
  if (vanityMatch) {
    return { kind: 'vanity', value: vanityMatch[1] };
  }

  // Fall back to treating the raw input as a vanity name.
  return { kind: 'vanity', value: input };
}
