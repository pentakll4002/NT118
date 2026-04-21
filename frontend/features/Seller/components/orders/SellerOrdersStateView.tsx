import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SellerOrdersStateViewProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const SellerOrdersStateView: React.FC<SellerOrdersStateViewProps> = ({ loading, error, onRetry }) => {
  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator color="#ef476f" />
        <Text style={styles.stateText}>Đang tải danh sách đơn hàng...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerState}>
        <Ionicons name="alert-circle-outline" size={44} color="#e74c3c" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  stateText: {
    marginTop: 10,
    color: '#6b7280',
  },
  errorText: {
    marginTop: 10,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 14,
  },
  retryButton: {
    backgroundColor: '#ef476f',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default SellerOrdersStateView;
