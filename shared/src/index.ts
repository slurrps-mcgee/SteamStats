/**
 * Public entry point for the `@steamstats/shared` package.
 *
 * This package only contains TypeScript type definitions that are shared
 * between the frontend and backend. It has no runtime code, so it never
 * needs to be built or shipped - types are erased at compile time.
 */
export * from './types/steam-profile.type';
export * from './types/owned-game.type';
export * from './types/recently-played-game.type';
export * from './types/library-stats.type';
export * from './types/random-game.type';
export * from './types/resolve-steam-id.type';
export * from './types/api-error.type';
export * from './types/wishlist-game.type';