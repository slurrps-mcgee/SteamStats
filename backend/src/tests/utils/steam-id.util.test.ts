import { describe, expect, it } from 'vitest';
import { isSteamId64, parseSteamInput } from '../../utils/steam-id.util';

const VALID_STEAM_ID64 = '76561198000000000';

describe('isSteamId64', () => {
  it('accepts a valid SteamID64', () => {
    expect(isSteamId64(VALID_STEAM_ID64)).toBe(true);
  });

  it('rejects invalid values', () => {
    expect(isSteamId64('123')).toBe(false);
    expect(isSteamId64('7656119abcdefghij')).toBe(false);
    expect(isSteamId64('')).toBe(false);
  });
});

describe('parseSteamInput', () => {
  it('parses a SteamID64', () => {
    expect(parseSteamInput(`  ${VALID_STEAM_ID64}  `)).toEqual({
      kind: 'steamId64',
      value: VALID_STEAM_ID64,
    });
  });

  it('parses a profiles URL', () => {
    expect(parseSteamInput(`https://steamcommunity.com/profiles/${VALID_STEAM_ID64}`)).toEqual({
      kind: 'steamId64',
      value: VALID_STEAM_ID64,
    });
  });

  it('parses a vanity URL', () => {
    expect(parseSteamInput('https://steamcommunity.com/id/gabelogannewell')).toEqual({
      kind: 'vanity',
      value: 'gabelogannewell',
    });
  });

  it('treats raw input as a vanity name', () => {
    expect(parseSteamInput('someVanity')).toEqual({
      kind: 'vanity',
      value: 'someVanity',
    });
  });
});
