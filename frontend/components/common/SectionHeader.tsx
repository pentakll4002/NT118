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
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  onViewAllPress,
  backgroundColor = '#4392F1',
  viewAllText = "View all",
  timerText,
  icon = "time-outline",
  isBlueVariant = false,
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
        <TouchableOpacity style={styles.blueViewAllButton} onPress={onViewAllPress}>
          <Text style={styles.blueViewAllText}>{viewAllText}</Text>
          <Feather name="arrow-right" size={14} color="white" />
        </TouchableOpacity>
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
      <TouchableOpacity style={styles.viewAllButton} onPress={onViewAllPress}>
        <Text style={styles.viewAllText}>{viewAllText}</Text>
        <Ionicons name="arrow-forward" size={16} color="white" />
      </TouchableOpacity>
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
  blueViewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
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
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 4,
  },
  viewAllText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
});

export default SectionHeader;
