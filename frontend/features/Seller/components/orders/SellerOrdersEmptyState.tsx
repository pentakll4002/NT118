import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SellerOrdersEmptyState: React.FC = () => {
  return (
    <View style={styles.emptyCard}>
      <Ionicons name="file-tray-outline" size={40} color="#95a5a6" />
      <Text style={styles.emptyTitle}>Không có đơn phù hợp</Text>
      <Text style={styles.emptyDesc}>Thử đổi tab lọc hoặc quay lại sau khi có giao dịch mới.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eceef3',
    borderRadius: 14,
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
  },
  emptyDesc: {
    marginTop: 4,
    fontSize: 13,
    color: '#7f8c8d',
  },
});

export default SellerOrdersEmptyState;
