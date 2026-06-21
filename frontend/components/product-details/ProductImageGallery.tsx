import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');

interface ProductImageGalleryProps {
  images: string[];
  activeIndex: number;
  onScroll: (index: number) => void;
  onImagePress: () => void;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images, activeIndex, onScroll, onImagePress }) => {
  const thumbnails = images.length > 0 ? images : ['PLACEHOLDER'];

  return (
    <View style={styles.imageGallery}>
      <FlashList data={thumbnails}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          onScroll(index);
        }}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.9} onPress={onImagePress}>
            <Image 
              source={item === 'PLACEHOLDER' ? require('../../assets/images/product/product-1.png') : { uri: item }} 
              style={styles.mainImage} 
              resizeMode="cover" 
            />
          </TouchableOpacity>
        )}
        keyExtractor={(_, index) => index.toString()}
      />
      {thumbnails.length > 1 && (
        <View style={styles.paginationPill}>
          <Text style={styles.paginationText}>
            {activeIndex + 1}/{thumbnails.length}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imageGallery: {
    width: width,
    height: width * 0.8,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  mainImage: {
    width: width,
    height: width * 0.8,
  },
  paginationPill: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  paginationText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ProductImageGallery;
