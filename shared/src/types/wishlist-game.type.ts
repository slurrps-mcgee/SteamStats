export interface WishlistResponse {
  games: WishlistGame[];
}

export interface WishlistGame {
  appId: number;
  name: string;
  priority: number;
  date_added: number;
}