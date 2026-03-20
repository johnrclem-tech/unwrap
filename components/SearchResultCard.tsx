import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchResult } from '@/types';

interface SearchResultCardProps {
  result: SearchResult;
  onPress: (result: SearchResult) => void;
  onAdd: (result: SearchResult) => void;
}

export default function SearchResultCard({ result, onPress, onAdd }: SearchResultCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(result)} activeOpacity={0.7}>
      {result.imageUrl && (
        <Image source={{ uri: result.imageUrl }} style={styles.image} />
      )}
      <View style={styles.info}>
        <Text style={styles.displayUrl}>{result.displayUrl}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {result.title}
        </Text>
        <Text style={styles.snippet} numberOfLines={2}>
          {result.snippet}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={(e) => {
          e.stopPropagation();
          onAdd(result);
        }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="add-circle" size={28} color="#6c5ce7" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },
  displayUrl: {
    fontSize: 12,
    color: '#6c5ce7',
    fontWeight: '600',
    marginBottom: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  snippet: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
});
