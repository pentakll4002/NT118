import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface PromotionBannerProps {
  title: string;
  subtitle: string;
  buttonText: string;
  image?: any;
  onPress?: () => void;
}

const PromotionBanner: React.FC<PromotionBannerProps> = ({
  title,
  subtitle,
  buttonText,
  image,
  onPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftAccent} />
      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>{buttonText}</Text>
            <Feather name="arrow-right" size={14} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.imageSection}>
          {image ? (
            <Image source={image} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={styles.placeholderImage} />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 176,
    marginHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 16,
  },
  leftAccent: {
    width: 10,
    height: '100%',
    backgroundColor: '#FFD700', // Giả lập gradient bằng màu vàng
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  textSection: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#EB3030',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
    gap: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
  imageSection: {
    width: 140,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
  },
});

export default PromotionBanner;
