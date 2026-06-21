import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
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
  const [distanceRemaining, setDistanceRemaining] = useState<number | null>(null);
  const [step, setStep] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(15);
  const [isDelivered, setIsDelivered] = useState(false);

  // Listen to SignalR coordinates
  useSignalREventListener<TrackingData>('order.tracking', (data) => {
    if (data.orderId === orderId) {
      setDistanceRemaining(data.distanceRemainingKm);
      setStep(data.step);
      setTotalSteps(data.totalSteps);
      if (data.status === 'delivered') {
        setIsDelivered(true);
      }
    }
  });

  const progressPercentage = Math.min(100, Math.max(0, (step / totalSteps) * 100));

  return (
    <View style={styles.container}>
      {/* Visual Simulation Area */}
      <View style={styles.simulationContainer}>
        {/* Animated Background Grid */}
        <View style={styles.gridOverlay} />

        <Text style={styles.webAlertText}>Đang mô phỏng giao hàng (Môi trường Web)</Text>

        {/* Route Line Container */}
        <View style={styles.routeContainer}>
          {/* Base dashed line */}
          <View style={styles.dashedLine} />
          {/* Active progress line */}
          <View style={[styles.activeLine, { width: `${progressPercentage}%` }]} />

          {/* Shop Icon */}
          <View style={[styles.nodeBadge, styles.shopBadge]}>
            <MaterialCommunityIcons name="storefront" size={20} color="#FFF" />
            <Text style={styles.badgeLabel}>Cửa hàng</Text>
          </View>

          {/* Moving Shipper */}
          {!isDelivered && (
            <View style={[styles.shipperBadge, { left: `${progressPercentage}%` }]}>
              <MaterialCommunityIcons name="moped" size={24} color="#FFF" />
              <View style={styles.shipperPulse} />
            </View>
          )}

          {/* Home Icon */}
          <View style={[styles.nodeBadge, styles.homeBadge]}>
            <Ionicons name="home" size={18} color="#FFF" />
            <Text style={styles.badgeLabel}>Khách hàng</Text>
          </View>
        </View>

        {/* Coordinates status HUD */}
        <View style={styles.coordsHud}>
          <Text style={styles.coordsText}>
            Tọa độ khách hàng: {customerLat.toFixed(5)}, {customerLng.toFixed(5)}
          </Text>
        </View>
      </View>

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
                { width: `${progressPercentage}%` }
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
              Shipper đang di chuyển. Vui lòng đợi trong giây lát...
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 340,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  simulationContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 40,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.05,
    borderWidth: 1,
    borderColor: '#FFF',
    // Simulating grid pattern using CSS styles on web
    // @ts-ignore
    backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
    backgroundSize: '16px 16px',
  },
  webAlertText: {
    position: 'absolute',
    top: 12,
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  routeContainer: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    position: 'relative',
    marginTop: 10,
  },
  dashedLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
    // @ts-ignore
    borderStyle: 'dashed',
  },
  activeLine: {
    position: 'absolute',
    left: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EE4D2D',
  },
  nodeBadge: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1E293B',
    zIndex: 2,
  },
  shopBadge: {
    left: 0,
    backgroundColor: '#3B82F6',
  },
  homeBadge: {
    right: 0,
    backgroundColor: '#10B981',
  },
  badgeLabel: {
    position: 'absolute',
    top: 45,
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    width: 80,
    textAlign: 'center',
  },
  shipperBadge: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EE4D2D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0F172A',
    transform: [{ translateX: -22 }],
    zIndex: 3,
    // Smooth transition for left property on web
    // @ts-ignore
    transition: 'left 0.8s ease-in-out',
  },
  shipperPulse: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#EE4D2D',
    opacity: 0.6,
    // @ts-ignore
    animation: 'pulse 1.5s infinite',
  },
  coordsHud: {
    position: 'absolute',
    bottom: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  coordsText: {
    color: '#94A3B8',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  hud: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
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
