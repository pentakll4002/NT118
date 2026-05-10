import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilterTag {
  id: string;
  label: string;
}

interface ActiveFiltersProps {
  tags: FilterTag[];
  onRemoveTag: (id: string) => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({ tags, onRemoveTag }) => {
  if (tags.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tags.map((tag) => (
          <View key={tag.id} style={styles.tagWrapper}>
            <Text style={styles.tagText}>{tag.label}</Text>
            <TouchableOpacity 
              onPress={() => onRemoveTag(tag.id)}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={14} color="#555" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tagWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 8,
  },
  tagText: {
    fontSize: 11,
    color: '#4392F9',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  closeButton: {
    padding: 2,
  },
});

export default ActiveFilters;
