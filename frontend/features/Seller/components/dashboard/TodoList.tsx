import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TodoItem from '../TodoItem';
import { SellerTodoStats } from '../../../../lib/sellerApi';

type TodoRouteTarget = 'to-ship' | 'cancelled' | 'returns' | 'out-of-stock';

interface TodoListProps {
  todoStats: SellerTodoStats | undefined;
  onItemPress?: (target: TodoRouteTarget) => void;
}

const TodoList: React.FC<TodoListProps> = ({ todoStats, onItemPress }) => {
  const todoData = todoStats ? [
    {
      id: '1',
      title: 'Đơn cần giao',
      description: 'Xử lý trong 24h',
      count: todoStats.ordersToShip,
      routeTarget: 'to-ship' as const,
      icon: 'cube-outline' as const,
      iconBgColor: '#3498db',
      countColor: '#3498db',
    },
    {
      id: '2',
      title: 'Đơn bị huỷ',
      description: 'Cần xem xét',
      count: todoStats.cancelledOrders,
      routeTarget: 'cancelled' as const,
      icon: 'close-circle-outline' as const,
      iconBgColor: '#e74c3c',
      countColor: '#e74c3c',
    },
    {
      id: '3',
      title: 'Yêu cầu trả hàng',
      description: 'Cần xác minh',
      count: todoStats.returnRequests,
      routeTarget: 'returns' as const,
      icon: 'return-up-back-outline' as const,
      iconBgColor: '#f39c12',
      countColor: '#2c3e50',
    },
    {
      id: '4',
      title: 'Hết hàng',
      description: 'Nhập thêm ngay',
      count: todoStats.outOfStockProducts,
      routeTarget: 'out-of-stock' as const,
      icon: 'alert-circle-outline' as const,
      iconBgColor: '#95a5a6',
      countColor: '#2c3e50',
    },
  ] : [];
  const hasPendingTasks = todoData.some((item) => item.count > 0);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIndicator, { backgroundColor: '#3498db' }]} />
        <Text style={styles.sectionTitle}>Danh sách việc cần làm</Text>
      </View>
      
      <View style={styles.todoContainer}>
        {!hasPendingTasks ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Tuyet voi! Khong co viec can xu ly</Text>
            <Text style={styles.emptyText}>Khi co don moi hoac can canh bao, muc nay se cap nhat ngay.</Text>
          </View>
        ) : null}
        {todoData
          .filter((item) => item.count > 0)
          .map((item) => (
          <TodoItem 
            key={item.id}
            title={item.title}
            description={item.description}
            count={item.count}
            icon={item.icon}
            iconBgColor={item.iconBgColor}
            countColor={item.countColor}
            onPress={() => onItemPress?.(item.routeTarget)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIndicator: {
    width: 4,
    height: 18,
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
  },
  todoContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  emptyState: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: '#f7fbff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8eef5',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2c3e50',
  },
  emptyText: {
    marginTop: 6,
    fontSize: 12,
    color: '#7f8c8d',
  },
});

export default TodoList;
