import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { SellerDashboardStats } from '../../../../lib/sellerApi';

interface BusinessInsightsProps {
  stats: SellerDashboardStats | null;
  loading?: boolean;
}

const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
  const points = useMemo(() => {
    if (data.length === 0) {
      return '0,16 100,16';
    }
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = Math.max(max - min, 1);
    return data
      .map((value, index) => {
        const x = (index / Math.max(data.length - 1, 1)) * 100;
        const y = 32 - ((value - min) / range) * 28;
        return `${x},${y}`;
      })
      .join(' ');
  }, [data]);

  return (
    <Svg width="100%" height={32} viewBox="0 0 100 32" preserveAspectRatio="none">
      <Polyline points={points} fill="none" stroke="#10b981" strokeWidth={2.2} />
    </Svg>
  );
};

const BusinessInsights: React.FC<BusinessInsightsProps> = ({ stats, loading = false }) => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.03, duration: 850, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 850, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  if (loading) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIndicator} />
          <Text style={styles.sectionTitle}>Thông tin kinh doanh</Text>
        </View>
        <View style={styles.grid}>
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonCard} />
        </View>
      </View>
    );
  }

  const cards = [
    {
      id: 'revenue',
      title: 'Doanh thu hôm nay',
      value: `đ${(stats?.todayRevenue ?? 0).toLocaleString('vi-VN')}`,
      description: 'Xu hướng 7 ngày',
      emphasize: true,
    },
    {
      id: 'orders',
      title: 'Đơn hàng mới',
      value: (stats?.todayOrders ?? 0).toString(),
      description: 'Đơn phát sinh trong ngày',
    },
    {
      id: 'conversion',
      title: 'Tỷ lệ chuyển đổi',
      value: `${stats?.conversionRate ?? 0}%`,
      description: 'Theo lượt truy cập',
    },
    {
      id: 'avg',
      title: 'Giá trị đơn TB',
      value: `đ${Math.round((stats?.averageOrderValue ?? 0)).toLocaleString('vi-VN')}`,
      description: 'Doanh thu / đơn đã thanh toán',
    },
  ];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIndicator} />
        <Text style={styles.sectionTitle}>Thông tin kinh doanh</Text>
      </View>

      <View style={styles.grid}>
        {cards.map((card) => (
          <Animated.View
            key={card.id}
            style={[styles.card, card.emphasize ? { transform: [{ scale: pulse }] } : null]}
          >
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardValue}>{card.value}</Text>
            <Text style={styles.cardDescription}>{card.description}</Text>
            {card.id === 'revenue' ? <Sparkline data={stats?.revenueHistory ?? []} /> : null}
          </Animated.View>
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
    backgroundColor: '#e74c3c',
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  card: {
    width: '48.5%',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#eef0f2',
    padding: 12,
    minHeight: 116,
  },
  cardTitle: {
    fontSize: 11,
    color: '#7f8c8d',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardValue: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
  },
  cardDescription: {
    marginTop: 4,
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 6,
  },
  skeletonCard: {
    width: '48.5%',
    height: 116,
    borderRadius: 14,
    backgroundColor: '#eceff1',
  },
});

export default BusinessInsights;
