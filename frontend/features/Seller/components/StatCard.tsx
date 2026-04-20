import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; 

const StatCard: React.FC<StatCardProps> = ({ title, value, description, trend, trendValue }) => {
  const getTrendColor = () => {
    if (trend === 'up') return '#2ecc71';
    if (trend === 'down') return '#e74c3c';
    return '#7f8c8d';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return 'trending-up';
    if (trend === 'down') return 'trending-down';
    return 'remove-outline';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      <View style={styles.trendContainer}>
        {trend && (
          <Ionicons 
            name={getTrendIcon() as any} 
            size={14} 
            color={getTrendColor()} 
            style={styles.trendIcon} 
          />
        )}
        <Text style={[styles.description, trend ? { color: getTrendColor() } : null]}>
          {description}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 16,
    marginBottom: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7f8c8d',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    marginRight: 4,
  },
  description: {
    fontSize: 12,
    color: '#95a5a6',
  },
});

export default StatCard;
