import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BannerProps {
  title: string;
  subtitle: string;
  detail?: string;
  buttonText?: string;
  onPress?: () => void;
  activeDotIndex?: number;
  totalDots?: number;
}

const Banner: React.FC<BannerProps> = ({
  title,
  subtitle,
  detail,
  buttonText = "Shop Now",
  onPress,
  activeDotIndex = 0,
  totalDots = 3
}) => {
  return (
    <View style={styles.bannerContainer}>
      <View style={styles.banner}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>{title}</Text>
          <Text style={styles.bannerSubtitle}>{subtitle}</Text>
          {detail && <Text style={styles.bannerDetail}>{detail}</Text>}
          <TouchableOpacity style={styles.shopNowButton} onPress={onPress}>
            <Text style={styles.shopNowText}>{buttonText}</Text>
            <Ionicons name="arrow-forward" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.pagination}>
        {Array.from({ length: totalDots }).map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.dot, 
              activeDotIndex === index && styles.activeDot
            ]} 
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  banner: {
    width: '100%',
    height: 192,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerContent: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
  bannerSubtitle: {
    fontSize: 12,
    marginTop: 8,
    fontFamily: 'Montserrat_400Regular',
  },
  bannerDetail: {
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
  },
  shopNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'black',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 16,
    gap: 4,
  },
  shopNowText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  pagination: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D9D9D9',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#FFA3B3',
  },
});

export default Banner;
