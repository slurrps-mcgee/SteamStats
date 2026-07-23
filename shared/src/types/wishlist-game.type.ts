export interface WishlistGame {
  appId: number;
  name: string;
  priority: number;
  date_added: number;
}

export interface WishlistResponse {
  games: WishlistGame[];
}