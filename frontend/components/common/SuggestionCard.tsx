import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import { Product } from './ProductCard';

const { width } = Dimensions.get('window');

interface SuggestionCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ product, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(product)} activeOpacity={0.9}>
      <Image source={product.image} style={styles.image} resizeMode="cover" />
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {product.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: (width - 48) / 2,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  image: {
    width: '100%',
    height: (width - 48) / 2,
  },
  textContainer: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333333',
    lineHeight: 18,
    fontFamily: 'Montserrat_500Medium',
  },
});

export default SuggestionCard;
