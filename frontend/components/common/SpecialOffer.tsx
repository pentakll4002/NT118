import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface SpecialOfferProps {
  title: string;
  description: string;
  emoji?: string;
  image?: any;
}

const SpecialOffer: React.FC<SpecialOfferProps> = ({ 
  title, 
  description, 
  emoji = "😱",
  image 
}) => {
  return (
    <View style={styles.specialOfferContainer}>
      <View style={styles.specialOfferCard}>
        <View style={styles.specialOfferIconContainer}>
          {image ? (
            <Image source={image} style={styles.offerImage} />
          ) : (
            <View style={styles.offerPlaceholder} />
          )}
        </View>
        <View style={styles.specialOfferTextContainer}>
          <View style={styles.offerTitleRow}>
            <Text style={styles.specialOfferTitle}>{title}</Text>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>
          <Text style={styles.specialOfferDesc}>
            {description}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  specialOfferContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  specialOfferCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  specialOfferIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: 'hidden',
  },
  offerImage: {
    width: '100%',
    height: '100%',
  },
  offerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
  },
  specialOfferTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  offerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specialOfferTitle: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  emoji: {
    fontSize: 16,
  },
  specialOfferDesc: {
    fontSize: 12,
    color: 'black',
    marginTop: 4,
    fontFamily: 'Montserrat_300Light',
    lineHeight: 16,
  },
});

export default SpecialOffer;
