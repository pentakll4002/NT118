import { Image } from 'expo-image';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

export interface Category {
  id: number;
  name: string;
  image?: any;
  icon?: {
    library: 'Feather' | 'Ionicons' | 'MaterialCommunityIcons' | 'FontAwesome5' | 'MaterialIcons';
    name: string;
    color: string;
    size?: number;
  };
  bgColor?: string;
}

interface CategoriesProps {
  categories: Category[];
  onSortPress?: () => void;
  onFilterPress?: () => void;
  onCategoryPress?: (category: Category) => void;
}

const IconRenderer = ({ icon }: { icon: Category['icon'] }) => {
  if (!icon) return null;
  const size = icon.size || 28;
  const props = { name: icon.name as any, size, color: icon.color };

  switch (icon.library) {
    case 'Feather':
      return <Feather {...props} />;
    case 'Ionicons':
      return <Ionicons {...props} />;
    case 'MaterialCommunityIcons':
      return <MaterialCommunityIcons {...props} />;
    case 'FontAwesome5':
      return <FontAwesome5 {...props} />;
    case 'MaterialIcons':
      return <MaterialIcons {...props} />;
    default:
      return null;
  }
};

const Categories: React.FC<CategoriesProps> = ({ categories, onSortPress, onFilterPress, onCategoryPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tính Năng Nổi Bật</Text>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.categoryItem} 
            onPress={() => onCategoryPress?.(item)}
            activeOpacity={0.7}
          >
            <View style={[styles.imageContainer, item.bgColor ? { backgroundColor: item.bgColor } : null]}>
              {item.icon ? (
                <IconRenderer icon={item.icon} />
              ) : item.image ? (
                <Image source={item.image} style={styles.image} resizeMode="cover" />
              ) : null}
            </View>
            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
    color: '#000',
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  categoryItem: {
    alignItems: 'center',
    width: (Dimensions.get('window').width - 32) / 5,
  },
  imageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 10,
    fontFamily: 'Montserrat_400Regular',
    textAlign: 'center',
    color: '#333',
  },
});

export default Categories;
