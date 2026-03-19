import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Wishlist } from '@/types';

interface WishlistCardProps {
  wishlist: Wishlist;
  onPress: (wishlist: Wishlist) => void;
  onDelete?: (wishlist: Wishlist) => void;
}

export default function WishlistCard({ wishlist, onPress, onDelete }: WishlistCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(wishlist)} onLongPress={() => onDelete?.(wishlist)}>
      <Text style={styles.emoji}>{wishlist.emoji}</Text>
      <View style={styles.info}>
        <Text style={styles.name}>{wishlist.name}</Text>
        <Text style={styles.count}>
          {wishlist.itemCount} {wishlist.itemCount === 1 ? 'item' : 'items'}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emoji: {
    fontSize: 32,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  count: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: '#ccc',
  },
});
