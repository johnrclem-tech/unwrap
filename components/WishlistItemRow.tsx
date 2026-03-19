import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { WishlistItem } from '@/types';

interface WishlistItemRowProps {
  item: WishlistItem;
  onDelete: (item: WishlistItem) => void;
}

export default function WishlistItemRow({ item, onDelete }: WishlistItemRowProps) {
  const { product } = item;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => Linking.openURL(product.sourceUrl)}
      onLongPress={() => onDelete(item)}
    >
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        {product.price && <Text style={styles.price}>{product.price}</Text>}
        <Text style={styles.source}>{product.sourceName}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 10,
    color: '#999',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2ecc71',
    marginTop: 2,
  },
  source: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});
