import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TodoItemProps {
  icon: string;
  iconBgColor: string;
  title: string;
  description: string;
  count: number;
  countColor: string;
  onPress?: () => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ 
  icon, 
  iconBgColor, 
  title, 
  description, 
  count, 
  countColor, 
  onPress 
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        <Ionicons name={icon as any} size={20} color="#fff" />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <View style={styles.countContainer}>
        <Text style={[styles.count, { color: countColor }]}>{count.toString().padStart(2, '0')}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: '#95a5a6',
  },
  countContainer: {
    marginLeft: 8,
  },
  count: {
    fontSize: 18,
    fontWeight: '700',
  },
});

export default TodoItem;
