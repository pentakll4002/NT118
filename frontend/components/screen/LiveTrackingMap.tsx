import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSignalREventListener } from '../../lib/notificationApi';

interface LiveTrackingMapProps {
  orderId: number;
  customerLat: number;
  customerLng: number;
  shopLat?: number | null;
  shopLng?: number | null;
}

interface TrackingData {
  orderId: number;
  orderNumber: string;
  latitude: number;
  longitude: number;
  status: string;
  step: number;
  totalSteps: number;
  distanceRemainingKm: number;
}

export default function LiveTrackingMap({ orderId, customerLat, customerLng, shopLat, shopLng }: LiveTrackingMapProps) {
  const mapRef = useRef<MapView>(null);
  
  // Start shop location (offset 1.5km to start with if no updates have arrived yet)
  const startLat = shopLat ?? (customerLat + 0.015);
  const startLng = shopLng ?? (customerLng - 0.015);

  const [shipperCoords, setShipperCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: startLat,
    longitude: startLng,
  });
  const [distanceRemaining, setDistanceRemaining] = useState<number | null>(null);
  const [step, setStep] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(15);
  const [isDelivered, setIsDelivered] = useState(false);

  // Listen to SignalR coordinates
  useSignalREventListener<TrackingData>('order.tracking', (data) => {
    if (data.orderId === orderId) {
      setShipperCoords({ latitude: data.latitude, longitude: data.longitude });
      setDistanceRemaining(data.distanceRemainingKm);
      setStep(data.step);
      setTotalSteps(data.totalSteps);
      if (data.status === 'delivered') {
        setIsDelivered(true);
      }
      
      // Auto-center map to keep both shipper and customer in view
      mapRef.current?.fitToCoordinates(
        [
          { latitude: data.latitude, longitude: data.longitude },
          { latitude: customerLat, longitude: customerLng }
        ],
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      );
    }
  });

  useEffect(() => {
    // Initial camera fit
    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(
        [
          { latitude: shipperCoords.latitude, longitude: shipperCoords.longitude },
          { latitude: customerLat, longitude: customerLng }
        ],
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: false,
        }
      );
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: (startLat + customerLat) / 2,
          longitude: (startLng + customerLng) / 2,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {/* Route Polyline */}
        <Polyline
          coordinates={[
            { latitude: startLat, longitude: startLng },
            { latitude: customerLat, longitude: customerLng }
          ]}
          strokeColor="#94A3B8"
          strokeWidth={2}
          lineDashPattern={[6, 6]}
        />
        
        <Polyline
          coordinates={[
            { latitude: startLat, longitude: startLng },
            { latitude: shipperCoords.latitude, longitude: shipperCoords.longitude }
          ]}
          strokeColor="#3B82F6"
          strokeWidth={3}
        />

        {/* Shop Marker */}
        <Marker 
          coordinate={{ latitude: startLat, longitude: startLng }}
          title="Cửa hàng"
          description="Điểm chuẩn bị hàng"
        >
          <View style={[styles.markerBadge, { backgroundColor: '#3B82F6' }]}>
            <MaterialCommunityIcons name="storefront" size={16} color="#FFF" />
          </View>
        </Marker>

        {/* Customer Marker */}
        <Marker 
          coordinate={{ latitude: customerLat, longitude: customerLng }}
          title="Nhà bạn"
          description="Điểm nhận hàng"
        >
          <View style={[styles.markerBadge, { backgroundColor: '#10B981' }]}>
            <Ionicons name="home" size={16} color="#FFF" />
          </View>
        </Marker>

        {/* Shipper Marker (Motorcycle) */}
        {!isDelivered && (
          <Marker 
            coordinate={shipperCoords}
            title="Shipper"
            description="Đang di chuyển..."
          >
            <View style={styles.shipperBadge}>
              <MaterialCommunityIcons name="moped" size={20} color="#FFF" />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Info HUD */}
      <View style={styles.hud}>
        <View style={styles.hudHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={[styles.pulseCircle, isDelivered && { backgroundColor: '#10B981' }]} />
            <Text style={styles.hudTitle}>
              {isDelivered ? "Đã đến nơi!" : "Đang giao hàng trực tiếp"}
            </Text>
          </View>
          {distanceRemaining !== null && (
            <Text style={styles.hudDistance}>
              Còn {distanceRemaining} km
            </Text>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${(step / totalSteps) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            Hành trình: {step}/{totalSteps} bước
          </Text>
        </View>

        {!isDelivered && (
          <View style={styles.shipperInfo}>
            <ActivityIndicator size="small" color="#EE4D2D" style={{ marginRight: 8 }} />
            <Text style={styles.shipperText}>
              Shipper đang tiến về phía bạn. Vui lòng giữ máy...
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 320,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  map: {
    flex: 1,
  },
  markerBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  shipperBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EE4D2D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  hud: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  hudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hudTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  hudDistance: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EE4D2D',
  },
  pulseCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EE4D2D',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#EE4D2D',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'right',
  },
  shipperInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  shipperText: {
    fontSize: 11,
    color: '#475569',
    flex: 1,
  },
});
