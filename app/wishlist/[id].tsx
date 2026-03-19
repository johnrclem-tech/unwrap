import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import {
  subscribeToWishlistItems,
  removeItemFromWishlist,
  subscribeToWishlists,
} from '@/lib/firestore';
import { Wishlist, WishlistItem } from '@/types';
import WishlistItemRow from '@/components/WishlistItemRow';

export default function WishlistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    const unsub = subscribeToWishlists(user.uid, (wishlists) => {
      const found = wishlists.find((w) => w.id === id);
      if (found) setWishlist(found);
    });
    return unsub;
  }, [user, id]);

  useEffect(() => {
    if (!user || !id) return;
    const unsub = subscribeToWishlistItems(user.uid, id, (items) => {
      setItems(items);
      setLoading(false);
    });
    return unsub;
  }, [user, id]);

  const handleDelete = (item: WishlistItem) => {
    Alert.alert('Remove Item', `Remove "${item.product.title}" from this wishlist?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          if (user && id) removeItemFromWishlist(user.uid, id, item.id);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: wishlist ? `${wishlist.emoji} ${wishlist.name}` : 'Wishlist',
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#6c5ce7" style={styles.loader} />
      ) : items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>No items yet</Text>
          <Text style={styles.emptySubtext}>
            Search for products and add them here!
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WishlistItemRow item={item} onDelete={handleDelete} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loader: {
    marginTop: 40,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});
