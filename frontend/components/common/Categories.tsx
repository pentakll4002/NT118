import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

export interface Category {
  id: number;
  name: string;
  image: any;
}

interface CategoriesProps {
  categories: Category[];
}

const Categories: React.FC<CategoriesProps> = ({ categories }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Featured</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Sort</Text>
            <Ionicons name="swap-vertical" size={14} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Filter</Text>
            <Feather name="filter" size={14} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((item) => (
          <TouchableOpacity key={item.id} style={styles.categoryItem}>
            <View style={styles.imageContainer}>
              <Image source={item.image} style={styles.image} resizeMode="cover" />
            </View>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
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
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    fontFamily: 'Montserrat_400Regular',
    color: '#000',
  },
  filterIcon: {
    width: 14,
    height: 14,
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
