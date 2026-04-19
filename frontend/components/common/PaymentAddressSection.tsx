import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentAddressSection() {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.addressContainer}>
        <Ionicons name="location" size={20} color="#F83758" style={styles.locationIcon} />
        <View style={styles.addressTextContainer}>
          <Text style={styles.addressName}>Thiên Ân <Text style={styles.addressPhone}>(+84) 982 685 374</Text></Text>
          <Text style={styles.addressDetail}>47/5/6, Đường 120, Kp 2</Text>
          <Text style={styles.addressDetail}>Phường Tân Phú, Thành Phố Thủ Đức, TP. Hồ Chí Minh</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#BBBBBB" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionBlock: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressPhone: {
    fontWeight: '400',
    color: '#666',
  },
  addressDetail: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
});
