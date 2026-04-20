import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import TodoItem from '../components/TodoItem';
import QuickActionButton from '../components/QuickActionButton';
import CampaignCard from '../components/CampaignCard';
import BottomTabBar from '../components/BottomTabBar';

const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const todoData = [
    {
      id: '1',
      title: 'Đơn cần giao',
      description: 'Xử lý trong 24h',
      count: 24,
      icon: 'cube-outline',
      iconBgColor: '#3498db',
      countColor: '#3498db',
    },
    {
      id: '2',
      title: 'Đơn bị huỷ',
      description: 'Cần xem xét',
      count: 3,
      icon: 'close-circle-outline',
      iconBgColor: '#e74c3c',
      countColor: '#e74c3c',
    },
    {
      id: '3',
      title: 'Yêu cầu trả hàng',
      description: 'Cần xác minh',
      count: 8,
      icon: 'return-up-back-outline',
      iconBgColor: '#f39c12',
      countColor: '#2c3e50',
    },
    {
      id: '4',
      title: 'Hết hàng',
      description: 'Nhập thêm ngay',
      count: 12,
      icon: 'alert-circle-outline',
      iconBgColor: '#95a5a6',
      countColor: '#2c3e50',
    },
  ];


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <Header 
        shopName="Shop Tổng Hợp" 
        onBackPress={() => router.replace('/(tabs)/settings')}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Business Insights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIndicator} />
            <Text style={styles.sectionTitle}>Thông tin kinh doanh</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <StatCard 
              title="Doanh thu hôm nay"
              value="đ12,450,000"
              description="+14.2% so với hôm qua"
              trend="up"
            />
            <StatCard 
              title="Đơn hàng"
              value="148"
              description="Đang hoạt động"
              trend="neutral"
            />
            <StatCard 
              title="Tỷ lệ chuyển đổi"
              value="3.8%"
              description="-0.5% so với trung bình"
              trend="down"
            />
          </View>
        </View>

        {/* To-do List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIndicator, { backgroundColor: '#3498db' }]} />
            <Text style={styles.sectionTitle}>Danh sách việc cần làm</Text>
          </View>
          
          <View style={styles.todoContainer}>
            {todoData.map((item) => (
              <TodoItem 
                key={item.id}
                title={item.title}
                description={item.description}
                count={item.count}
                icon={item.icon}
                iconBgColor={item.iconBgColor}
                countColor={item.countColor}
              />
            ))}
          </View>
        </View>


        {/* Campaign Banner */}
        <CampaignCard 
          title="Đăng ký Flash Sale mùa hè"
          description="Tăng hiển thị shop lên đến 40% bằng cách tham gia sự kiện flash sale lớn nhất năm."
          buttonText="Đăng ký ngay"
        />

        <View style={styles.footerSpacing} />
      </ScrollView>

      <BottomTabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 20,
  },
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
    backgroundColor: '#e74c3c',
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
  },
  statsGrid: {
    flexDirection: 'column',
  },
  todoContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  quickActionsContainer: {
    paddingVertical: 4,
  },
  footerSpacing: {
    height: 40,
  },
});

export default DashboardScreen;
