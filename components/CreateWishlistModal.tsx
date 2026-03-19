import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const EMOJI_OPTIONS = ['🎁', '🎂', '🏠', '👗', '💻', '🎮', '📚', '✈️'];

interface CreateWishlistModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, emoji: string) => void;
}

export default function CreateWishlistModal({
  visible,
  onClose,
  onCreate,
}: CreateWishlistModalProps) {
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_OPTIONS[0]);

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), selectedEmoji);
    setName('');
    setSelectedEmoji(EMOJI_OPTIONS[0]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>New Wishlist</Text>

          <TextInput
            style={styles.input}
            placeholder="Wishlist name..."
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <Text style={styles.label}>Pick an icon</Text>
          <View style={styles.emojiRow}>
            {EMOJI_OPTIONS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.emojiButton,
                  selectedEmoji === emoji && styles.emojiSelected,
                ]}
                onPress={() => setSelectedEmoji(emoji)}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createButton, !name.trim() && styles.createButtonDisabled]}
              onPress={handleCreate}
              disabled={!name.trim()}
            >
              <Text style={styles.createText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  emojiButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiSelected: {
    backgroundColor: '#e8e4ff',
  },
  emoji: {
    fontSize: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  createButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#6c5ce7',
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
