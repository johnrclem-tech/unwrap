import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '@/components/ProductCard';
import AddToWishlistModal from '@/components/AddToWishlistModal';
import { searchProducts } from '@/lib/search';
import { Product } from '@/types';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const products = await searchProducts(query);
      setResults(products);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const handleAdd = (product: Product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const handleAdded = () => {
    setModalVisible(false);
    setSelectedProduct(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Search Products</Text>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Search for anything..."
          placeholderTextColor="#aaa"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6c5ce7" style={styles.loader} />
      ) : results.length === 0 && query.trim() ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No results found</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>
            Search for products you'd love to have
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, index) => `${item.sourceUrl}-${index}`}
          renderItem={({ item }) => (
            <ProductCard product={item} onAdd={handleAdd} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <AddToWishlistModal
        visible={modalVisible}
        product={selectedProduct}
        onClose={() => setModalVisible(false)}
        onAdded={handleAdded}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  searchBar: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  loader: {
    marginTop: 40,
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
    fontSize: 16,
    color: '#999',
  },
});
