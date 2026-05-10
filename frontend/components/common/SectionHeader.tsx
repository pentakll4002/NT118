import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onViewAllPress?: () => void;
  backgroundColor?: string;
  viewAllText?: string;
  timerText?: string;
  icon?: string;
  isBlueVariant?: boolean;
  showFilters?: boolean;
  onSortPress?: () => void;
  onFilterPress?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  onViewAllPress,
  backgroundColor = '#4392F1',
  viewAllText = "Xem tất cả",
  timerText,
  icon = "time-outline",
  isBlueVariant = false,
  showFilters = false,
  onSortPress,
  onFilterPress,
}) => {
  if (isBlueVariant) {
    return (
      <View style={[styles.blueContainer, backgroundColor ? { backgroundColor } : {}]}>
        <View style={styles.blueLeftSection}>
          <Text style={styles.blueTitle}>{title}</Text>
          {timerText && (
            <View style={styles.timerRow}>
              <Feather name="clock" size={14} color="white" />
              <Text style={styles.timerText}>{timerText}</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.dealHeader, { backgroundColor }]}>
      <View style={styles.dealTitleContainer}>
        <Text style={styles.dealTitle}>{title}</Text>
        {timerText && (
          <View style={styles.dealTimer}>
            <Ionicons name={icon as any} size={16} color="white" />
            <Text style={styles.timerText}>{timerText}</Text>
          </View>
        )}
        {subtitle && !timerText && (
          <Text style={styles.subtitleText}>{subtitle}</Text>
        )}
      </View>
      {showFilters && (
        <View style={styles.filterButtons}>
          <TouchableOpacity style={styles.filterButton} onPress={onSortPress}>
            <Text style={styles.filterText}>Sắp xếp</Text>
            <Ionicons name="swap-vertical" size={14} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
            <Text style={styles.filterText}>Lọc</Text>
            <Feather name="filter" size={14} color="black" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Blue Variant Styles
  blueContainer: {
    backgroundColor: '#4392F9',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blueLeftSection: {
    flex: 1,
  },
  blueTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  timerText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
  },
  blueViewAllText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  // Default Styles
  dealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 12,
    borderRadius: 8,
  },
  dealTitleContainer: {
    flex: 1,
  },
  dealTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  dealTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  subtitleText: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'Montserrat_400Regular',
  },
  viewAllText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterText: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    color: '#000',
  },
});

export default SectionHeader;
