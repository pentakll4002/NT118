import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MapProps {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  onCoordinateChange?: (coord: { latitude: number; longitude: number }) => void;
  interactive?: boolean;
}

export default function Map({ latitude, longitude, title, description, interactive = false }: MapProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bản đồ không được hỗ trợ trên trình duyệt Web.</Text>
      <Text style={styles.subText}>Tọa độ: {latitude}, {longitude}</Text>
      <Text style={styles.subText}>Vị trí: {title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 150,
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
  },
  text: {
    color: '#333',
    fontWeight: 'bold',
  },
  subText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  }
});
