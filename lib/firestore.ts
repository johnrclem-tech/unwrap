import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  increment,
  updateDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, Wishlist, WishlistItem } from '@/types';

// --- Wishlists ---

export function subscribeToWishlists(
  userId: string,
  callback: (wishlists: Wishlist[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'users', userId, 'wishlists'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const wishlists = snapshot.docs.map(
      (doc) => ({ id: doc.id, userId, ...doc.data() } as Wishlist)
    );
    callback(wishlists);
  });
}

export async function createWishlist(
  userId: string,
  name: string,
  emoji: string
): Promise<string> {
  const docRef = await addDoc(collection(db, 'users', userId, 'wishlists'), {
    name,
    emoji,
    createdAt: Date.now(),
    itemCount: 0,
  });
  return docRef.id;
}

export async function deleteWishlist(
  userId: string,
  wishlistId: string
): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'wishlists', wishlistId));
}

// --- Wishlist Items ---

export function subscribeToWishlistItems(
  userId: string,
  wishlistId: string,
  callback: (items: WishlistItem[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'users', userId, 'wishlists', wishlistId, 'items'),
    orderBy('addedAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as WishlistItem)
    );
    callback(items);
  });
}

export async function addItemToWishlist(
  userId: string,
  wishlistId: string,
  product: Product
): Promise<void> {
  await addDoc(
    collection(db, 'users', userId, 'wishlists', wishlistId, 'items'),
    {
      product,
      addedAt: Date.now(),
      note: '',
    }
  );
  await updateDoc(doc(db, 'users', userId, 'wishlists', wishlistId), {
    itemCount: increment(1),
  });
}

export async function removeItemFromWishlist(
  userId: string,
  wishlistId: string,
  itemId: string
): Promise<void> {
  await deleteDoc(
    doc(db, 'users', userId, 'wishlists', wishlistId, 'items', itemId)
  );
  await updateDoc(doc(db, 'users', userId, 'wishlists', wishlistId), {
    itemCount: increment(-1),
  });
}
