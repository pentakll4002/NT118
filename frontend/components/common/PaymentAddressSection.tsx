import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Map from '../screen/Map';

export interface UserAddressType {
  id: number;
  recipientName: string;
  recipientPhone: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  isDefault: boolean;
  latitude?: number | null;
  longitude?: number | null;
  poiName?: string | null;
  formattedAddress?: string | null;
}

interface PaymentAddressSectionProps {
  address?: UserAddressType | null;
  onPress?: () => void;
}

export default function PaymentAddressSection({ address, onPress }: PaymentAddressSectionProps) {
  if (!address) {
    return (
      <View style={styles.sectionBlock}>
        <TouchableOpacity style={styles.addressContainer} onPress={onPress}>
          <Ionicons name="location" size={20} color="#F83758" style={styles.locationIcon} />
          <View style={styles.addressTextContainer}>
            <Text style={styles.addressName}>Chưa có địa chỉ giao hàng</Text>
            <Text style={styles.addressDetail}>Vui lòng thêm địa chỉ giao hàng để tiếp tục</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#BBBBBB" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.sectionBlock}>
      <TouchableOpacity style={styles.addressContainer} onPress={onPress}>
        <Ionicons name="location" size={20} color="#F83758" style={styles.locationIcon} />
        <View style={styles.addressTextContainer}>
          <Text style={styles.addressName}>{address.recipientName} <Text style={styles.addressPhone}>({address.recipientPhone})</Text></Text>
          <Text style={styles.addressDetail}>{address.streetAddress}</Text>
          <Text style={styles.addressDetail}>{address.ward}, {address.district}, {address.province}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#BBBBBB" />
      </TouchableOpacity>

      {/* Show the map here */}
      {typeof address.latitude === 'number' && typeof address.longitude === 'number' ? (
        <Map
          latitude={address.latitude}
          longitude={address.longitude}
          title={address.poiName || 'Vị trí giao hàng'}
          description={
            address.formattedAddress ||
            `${address.streetAddress}${address.streetAddress ? ', ' : ''}${address.ward}, ${address.district}, ${address.province}`
          }
        />
      ) : null}
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
