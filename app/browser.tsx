import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AddToWishlistModal from '@/components/AddToWishlistModal';
import { Product } from '@/types';

let WebView: any = null;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').default;
}

export default function BrowserScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const router = useRouter();
  const [currentUrl, setCurrentUrl] = useState(url || '');
  const [pageTitle, setPageTitle] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [pasteUrl, setPasteUrl] = useState('');

  const getProduct = (targetUrl: string, title?: string): Product => {
    let hostname = '';
    try {
      hostname = new URL(targetUrl).hostname.replace('www.', '');
    } catch {
      hostname = targetUrl;
    }
    return {
      title: title || hostname,
      price: null,
      imageUrl: null,
      sourceUrl: targetUrl,
      sourceName: hostname,
    };
  };

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleAddToWishlist = () => {
    const product = getProduct(currentUrl, pageTitle);
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const handlePasteAdd = () => {
    const trimmed = pasteUrl.trim();
    if (!trimmed) return;
    const product = getProduct(trimmed);
    setSelectedProduct(product);
    setModalVisible(true);
  };

  // Web fallback: open URL in new tab and show paste input
  if (Platform.OS === 'web') {
    // Open the URL in a new tab on mount
    if (url) {
      Linking.openURL(url);
    }

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add to Wishlist</Text>
          <View style={{ width: 50 }} />
        </View>

        <View style={styles.webFallback}>
          <Text style={styles.webFallbackText}>
            The site opened in a new tab. Browse it, copy a product URL, and paste it below to add to your wishlist.
          </Text>
          <TextInput
            style={styles.pasteInput}
            placeholder="Paste product URL here..."
            placeholderTextColor="#aaa"
            value={pasteUrl}
            onChangeText={setPasteUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.addButton, !pasteUrl.trim() && styles.addButtonDisabled]}
            onPress={handlePasteAdd}
            disabled={!pasteUrl.trim()}
          >
            <Text style={styles.addButtonText}>Add to Wishlist</Text>
          </TouchableOpacity>
        </View>

        <AddToWishlistModal
          visible={modalVisible}
          product={selectedProduct}
          onClose={() => setModalVisible(false)}
          onAdded={() => {
            setModalVisible(false);
            setSelectedProduct(null);
            setPasteUrl('');
          }}
        />
      </SafeAreaView>
    );
  }

  // Mobile: full WebView experience
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.urlText} numberOfLines={1}>
          {currentUrl}
        </Text>
        <TouchableOpacity onPress={handleAddToWishlist} style={styles.addWishlistBtn}>
          <Text style={styles.addWishlistText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {WebView && (
        <WebView
          source={{ uri: url }}
          style={styles.webview}
          onNavigationStateChange={(navState: any) => {
            setCurrentUrl(navState.url);
            if (navState.title) setPageTitle(navState.title);
          }}
          startInLoadingState
        />
      )}

      <AddToWishlistModal
        visible={modalVisible}
        product={selectedProduct}
        onClose={() => setModalVisible(false)}
        onAdded={() => {
          setModalVisible(false);
          setSelectedProduct(null);
        }}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  backText: {
    fontSize: 16,
    color: '#6c5ce7',
    fontWeight: '600',
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  urlText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    marginHorizontal: 8,
  },
  addWishlistBtn: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addWishlistText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  webview: {
    flex: 1,
  },
  webFallback: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  webFallbackText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  pasteInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#6c5ce7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
