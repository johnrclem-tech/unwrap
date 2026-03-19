export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  displayUrl: string;
  imageUrl: string | null;
}

export interface Product {
  title: string;
  price: string | null;
  imageUrl: string | null;
  sourceUrl: string;
  sourceName: string;
}

export interface WishlistItem {
  id: string;
  product: Product;
  addedAt: number;
  note: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  name: string;
  emoji: string;
  createdAt: number;
  itemCount: number;
}
