import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AddProductHeaderProps {
  onBackPress: () => void;
}

const AddProductHeader: React.FC<AddProductHeaderProps> = ({ onBackPress }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) }]}>
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <Ionicons name="chevron-back" size={22} color="#2c3e50" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Đăng sản phẩm mới</Text>
      <TouchableOpacity style={styles.postTextButton} activeOpacity={0.7}>
        <Text style={styles.postText}>ĐĂNG</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eceff3',
    paddingHorizontal: 8,
    paddingBottom: 8,
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    marginLeft: 2,
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  postTextButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  postText: {
    color: '#3b82f6',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default AddProductHeader;
