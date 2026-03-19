import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { subscribeToWishlists, addItemToWishlist, createWishlist } from '@/lib/firestore';
import { Product, Wishlist } from '@/types';

interface AddToWishlistModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onAdded: () => void;
}

export default function AddToWishlistModal({
  visible,
  product,
  onClose,
  onAdded,
}: AddToWishlistModalProps) {
  const { user } = useAuth();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !visible) return;
    const unsub = subscribeToWishlists(user.uid, setWishlists);
    return unsub;
  }, [user, visible]);

  const handleAdd = async (wishlistId: string) => {
    if (!user || !product) return;
    setAdding(wishlistId);
    try {
      await addItemToWishlist(user.uid, wishlistId, product);
      onAdded();
    } catch (error) {
      console.error('Failed to add item:', error);
    }
    setAdding(null);
  };

  const handleQuickCreate = async () => {
    if (!user) return;
    try {
      const id = await createWishlist(user.uid, 'My Wishlist', '🎁');
      if (product) {
        await addItemToWishlist(user.uid, id, product);
        onAdded();
      }
    } catch (error) {
      console.error('Failed to create wishlist:', error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Add to Wishlist</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Done</Text>
            </TouchableOpacity>
          </View>

          {product && (
            <Text style={styles.productName} numberOfLines={1}>
              {product.title}
            </Text>
          )}

          {wishlists.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No wishlists yet</Text>
              <TouchableOpacity style={styles.quickCreateButton} onPress={handleQuickCreate}>
                <Text style={styles.quickCreateText}>Create & Add</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={wishlists}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.wishlistRow}
                  onPress={() => handleAdd(item.id)}
                  disabled={adding !== null}
                >
                  <Text style={styles.emoji}>{item.emoji}</Text>
                  <Text style={styles.wishlistName}>{item.name}</Text>
                  {adding === item.id ? (
                    <ActivityIndicator size="small" color="#6c5ce7" />
                  ) : (
                    <Text style={styles.addIcon}>+</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  closeText: {
    fontSize: 16,
    color: '#6c5ce7',
    fontWeight: '600',
  },
  productName: {
    fontSize: 13,
    color: '#999',
    marginBottom: 16,
  },
  wishlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  emoji: {
    fontSize: 24,
  },
  wishlistName: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  addIcon: {
    fontSize: 20,
    color: '#6c5ce7',
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    marginBottom: 16,
  },
  quickCreateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#6c5ce7',
    borderRadius: 10,
  },
  quickCreateText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
