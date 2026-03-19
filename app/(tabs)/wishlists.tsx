import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { subscribeToWishlists, createWishlist, deleteWishlist } from '@/lib/firestore';
import { Wishlist } from '@/types';
import WishlistCard from '@/components/WishlistCard';
import CreateWishlistModal from '@/components/CreateWishlistModal';

export default function WishlistsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToWishlists(user.uid, setWishlists);
    return unsub;
  }, [user]);

  const handleCreate = async (name: string, emoji: string) => {
    if (!user) return;
    await createWishlist(user.uid, name, emoji);
    setShowCreate(false);
  };

  const handleDelete = (wishlist: Wishlist) => {
    Alert.alert(
      'Delete Wishlist',
      `Are you sure you want to delete "${wishlist.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (user) deleteWishlist(user.uid, wishlist.id);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>My Wishlists</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowCreate(true)}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {wishlists.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎁</Text>
          <Text style={styles.emptyText}>No wishlists yet</Text>
          <Text style={styles.emptySubtext}>
            Tap + to create your first wishlist
          </Text>
        </View>
      ) : (
        <FlatList
          data={wishlists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WishlistCard
              wishlist={item}
              onPress={(w) => router.push(`/wishlist/${w.id}`)}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <CreateWishlistModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 24,
  },
  list: {
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
