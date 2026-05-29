import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getSellerReturns, ReturnRequestDTO, getReturnStatusColor, formatReturnStatus } from '../../../lib/returnApi';

export default function SellerReturnsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [returns, setReturns] = useState<ReturnRequestDTO[]>([]);

  const fetchReturns = async () => {
    try {
      const data = await getSellerReturns();
      setReturns(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReturns();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReturns();
  };

  const renderItem = ({ item }: { item: ReturnRequestDTO }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/seller/returns/${item.id}` as any)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.orderNumberBox}>
          <Ionicons name="receipt-outline" size={16} color="#666" />
          <Text style={styles.orderNumber}>Đơn: #{item.orderNumber?.split('-')[0]}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getReturnStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getReturnStatusColor(item.status) }]}>
            {formatReturnStatus(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.row}>
          <Text style={styles.label}>Lý do:</Text>
          <Text style={styles.value} numberOfLines={1}>{item.reason}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Người mua:</Text>
          <Text style={styles.value}>{item.buyerName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Số tiền hoàn:</Text>
          <Text style={styles.amount}>₫{item.refundAmount.toLocaleString('vi-VN')}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.date}>Tạo lúc: {new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
        <Ionicons name="chevron-forward" size={18} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yêu cầu hoàn trả</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#F73658" />
        </View>
      ) : (
        <FlatList
          data={returns}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-circle-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Không có yêu cầu hoàn trả nào</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Montserrat_600SemiBold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 12, gap: 12 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 12, marginBottom: 12 },
  orderNumberBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderNumber: { fontSize: 14, fontFamily: 'Montserrat_600SemiBold', color: '#333' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 12, fontFamily: 'Montserrat_600SemiBold' },
  cardBody: { gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 13, color: '#666', fontFamily: 'Montserrat_400Regular' },
  value: { fontSize: 14, color: '#333', fontFamily: 'Montserrat_500Medium', flex: 1, textAlign: 'right', marginLeft: 16 },
  amount: { fontSize: 15, color: '#F73658', fontFamily: 'Montserrat_700Bold' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  date: { fontSize: 12, color: '#999', fontFamily: 'Montserrat_400Regular' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 12, fontSize: 14, color: '#999', fontFamily: 'Montserrat_400Regular' }
});
