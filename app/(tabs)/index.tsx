import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import SearchResultCard from '@/components/SearchResultCard';
import AddToWishlistModal from '@/components/AddToWishlistModal';
import { searchWeb } from '@/lib/search';
import { SearchResult, Product } from '@/types';

const looksLikeUrl = (text: string): boolean => {
  const trimmed = text.trim();
  if (trimmed.includes(' ')) return false;
  // Matches "example.com", "www.example.com", "https://example.com", etc.
  return /^(https?:\/\/)?[\w-]+(\.[\w-]+)+/.test(trimmed);
};

const normalizeUrl = (text: string): string => {
  const trimmed = text.trim();
  if (/^https?:\/\//.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const router = useRouter();

  const isUrl = looksLikeUrl(query);

  const handleBrowseSite = () => {
    const url = normalizeUrl(query);
    if (Platform.OS === 'web') {
      Linking.openURL(url);
    } else {
      router.push(`/browser?url=${encodeURIComponent(url)}` as any);
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const searchResults = await searchWeb(query);
        setResults(searchResults);
      } catch (err: any) {
        setError(err.message || 'Search failed');
        setResults([]);
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const handleResultPress = (result: SearchResult) => {
    if (Platform.OS === 'web') {
      Linking.openURL(result.url);
    } else {
      router.push(`/browser?url=${encodeURIComponent(result.url)}` as any);
    }
  };

  const handleAddFromSearch = (result: SearchResult) => {
    const product: Product = {
      title: result.title,
      price: null,
      imageUrl: result.imageUrl,
      sourceUrl: result.url,
      sourceName: result.displayUrl,
    };
    setSelectedProduct(product);
    setShowAddModal(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Search</Text>
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

      {isUrl && (
        <TouchableOpacity style={styles.browseBanner} onPress={handleBrowseSite}>
          <Text style={styles.browseBannerText}>Browse {query.trim()}</Text>
          <Text style={styles.browseBannerArrow}>→</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#6c5ce7" style={styles.loader} />
      ) : error ? (
        <View style={styles.emptyState}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : results.length === 0 && query.trim() ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No results found</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>
            Search for stores and products
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, index) => `${item.url}-${index}`}
          renderItem={({ item }) => (
            <SearchResultCard result={item} onPress={handleResultPress} onAdd={handleAddFromSearch} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {selectedProduct && (
        <AddToWishlistModal
          visible={showAddModal}
          product={selectedProduct}
          onClose={() => {
            setShowAddModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
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
  errorText: {
    fontSize: 14,
    color: '#e74c3c',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  browseBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#6c5ce7',
    borderRadius: 12,
  },
  browseBannerText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  browseBannerArrow: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
});
