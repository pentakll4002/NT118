import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { G, Path, Text as SvgText, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { apiClient } from '../../lib/apiClient';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WHEEL_SIZE = Math.min(SCREEN_WIDTH * 1.05, 450);
const RADIUS = WHEEL_SIZE / 2;
const CENTER = RADIUS;

interface Prize {
  id: string;
  label: string;
  xuAmount: number;
  voucherType: string | null;
  voucherValue: number | null;
}

interface WheelInfo {
  freeSpins: number;
  spinCostXu: number;
  walletBalance: number;
  prizes: Prize[];
}

const SLICE_COLORS = [
  '#FF2D55', 
  '#FF9500', 
  '#34C759', 
  '#5856D6', 
  '#007AFF', 
  '#FF9500', 
  '#34C759', 
  '#8E8E93', 
];


const PRIZE_EMOJI: Record<string, string> = {
  xu_special: '💎',
  xu_big: '🌟',
  xu_700: '⭐',
  xu_500: '⭐',
  xu_100: '⭐',
  voucher_15: '🎫',
  freeship: '📦',
  miss: '🍀',
};

function getShortLabel(prize: Prize): string {
  if (prize.id === 'xu_special') return 'XU ĐẶC BIỆT';
  if (prize.id === 'xu_big') return 'XU ĐẠI';
  if (prize.id === 'xu_700') return 'XU TIỂU';
  if (prize.id === 'xu_500') return 'XU TIỂU';
  if (prize.id === 'xu_100') return 'XU TIỂU';
  if (prize.id === 'voucher_15') return 'VOUCHER GIẢM GIÁ';
  if (prize.id === 'freeship') return 'VOUCHER FREESHIP';
  if (prize.id === 'miss') return 'THỬ LẠI';
  return prize.label;
}

export default function LuckyWheelPage() {
  const router = useRouter();
  const [info, setInfo] = useState<WheelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [spinResult, setSpinResult] = useState<any>(null);

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const currentRotation = useRef(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchInfo();
    // Subtle pulse animation on the center button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const fetchInfo = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/luckywheel/info');
      setInfo(res.data);
    } catch (e: any) {
      console.log('Failed to fetch lucky wheel info:', e.message || e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSpin = useCallback(async (useXu: boolean) => {
    if (spinning || !info) return;

    if (useXu && info.walletBalance < info.spinCostXu) {
      Alert.alert('Không đủ xu', `Bạn cần ít nhất ${info.spinCostXu} xu để quay.`);
      return;
    }
    if (!useXu && info.freeSpins <= 0) return;

    setSpinning(true);

    try {
      const res = await apiClient.post('/api/luckywheel/spin', { useXu });
      const result = res.data;

      setInfo(prev => prev ? {
        ...prev,
        freeSpins: result.freeSpinsRemaining,
        walletBalance: result.walletBalance,
      } : prev);

      const targetPrizeIndex = result.prizeIndex;
      const sliceAngle = 360 / info.prizes.length;
      const targetAngle = -(targetPrizeIndex * sliceAngle + sliceAngle / 2);
      const spins = 360 * 6; // 6 full rotations for drama
      const nextRotation = currentRotation.current + spins + targetAngle - (currentRotation.current % 360);

      Animated.timing(rotateAnim, {
        toValue: nextRotation,
        duration: 4500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        currentRotation.current = nextRotation;
        setSpinResult(result);
        setResultModalVisible(true);
        setSpinning(false);
      });
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Không thể kết nối. Vui lòng thử lại.');
      setSpinning(false);
    }
  }, [spinning, info, rotateAnim]);

  // ── SVG path helpers ─────────────────────────────────────────────────
  const createSlicePath = useCallback((index: number, total: number) => {
    const startAngle = (index * 360) / total;
    const endAngle = ((index + 1) * 360) / total;
    const startRad = (Math.PI * startAngle) / 180;
    const endRad = (Math.PI * endAngle) / 180;
    const x1 = CENTER + RADIUS * Math.cos(startRad);
    const y1 = CENTER + RADIUS * Math.sin(startRad);
    const x2 = CENTER + RADIUS * Math.cos(endRad);
    const y2 = CENTER + RADIUS * Math.sin(endRad);
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }, []);

  const getLabelCoords = useCallback((index: number, total: number, radiusPct: number) => {
    const midAngle = ((index + 0.5) * 360) / total;
    const midRad = (Math.PI * midAngle) / 180;
    const r = RADIUS * radiusPct;
    return {
      x: CENTER + r * Math.cos(midRad),
      y: CENTER + r * Math.sin(midRad),
      angle: midAngle,
    };
  }, []);

  // ── Loading state ────────────────────────────────────────────────────
  if (loading) {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Đang tải vòng quay...</Text>
      </LinearGradient>
    );
  }

  if (!info) {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
        <Text style={[styles.loadingText, { marginTop: 12 }]}>Không tải được dữ liệu vòng quay</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => { setLoading(true); fetchInfo(); }}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* ── Header ──────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Quay lại">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🎡 Vòng Quay May Mắn</Text>
          <View style={{ width: 48 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* ── Balance bar ──────────────────────────────────────── */}
          <View style={styles.balanceBar}>
            <View style={styles.balanceItem}>
              <View style={[styles.balanceBadge, { backgroundColor: 'rgba(52, 199, 89, 0.15)' }]}>
                <Ionicons name="gift" size={18} color="#34C759" />
              </View>
              <View>
                <Text style={styles.balanceLabel}>Lượt miễn phí</Text>
                <Text style={[styles.balanceValue, { color: '#34C759' }]}>{info.freeSpins}</Text>
              </View>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <View style={[styles.balanceBadge, { backgroundColor: 'rgba(255, 149, 0, 0.15)' }]}>
                <Ionicons name="wallet" size={18} color="#FF9500" />
              </View>
              <View>
                <Text style={styles.balanceLabel}>Số dư Xu</Text>
                <Text style={[styles.balanceValue, { color: '#FF9500' }]}>
                  {info.walletBalance.toLocaleString('vi-VN')}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Wheel ────────────────────────────────────────────── */}
          <View style={styles.wheelWrapper}>
            {/* Outer glow ring */}
            <View style={styles.outerRing} />

            {/* Pointer triangle */}
            <View style={styles.pointerContainer}>
              <View style={styles.pointerTriangle} />
              <View style={styles.pointerDot} />
            </View>

            <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
              <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} style={{ transform: [{ rotate: '-90deg' }] }}>
                <Defs>
                  <RadialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#fff" stopOpacity="0.15" />
                    <Stop offset="100%" stopColor="#fff" stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <G>
                  {info.prizes.map((prize, index) => {
                    const color = SLICE_COLORS[index % SLICE_COLORS.length];
                    const label = getShortLabel(prize);
                    const coords = getLabelCoords(index, info.prizes.length, 0.55);
                    return (
                      <G key={prize.id}>
                        <Path
                          d={createSlicePath(index, info.prizes.length)}
                          fill={color}
                          stroke="rgba(255,255,255,0.3)"
                          strokeWidth={1.5}
                        />
                        <SvgText
                          x={coords.x}
                          y={coords.y}
                          fill="#fff"
                          fontSize={WHEEL_SIZE < 350 ? '14' : '17'}
                          fontWeight="800"
                          textAnchor="middle"
                          alignmentBaseline="middle"
                          transform={`rotate(${coords.angle}, ${coords.x}, ${coords.y})`}
                        >
                          {label}
                        </SvgText>
                      </G>
                    );
                  })}
                </G>
                {/* Center overlay */}
                <Circle cx={CENTER} cy={CENTER} r={RADIUS * 0.18} fill="url(#centerGlow)" />
              </Svg>
            </Animated.View>

            {/* Center button */}
            <Animated.View style={[styles.centerButton, { transform: [{ scale: spinning ? 1 : pulseAnim }] }]}>
              <LinearGradient colors={['#FF6B35', '#EE4D2D']} style={styles.centerButtonGradient}>
                <Text style={styles.centerButtonText}>{spinning ? '...' : 'QUAY'}</Text>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* ── Spin buttons ──────────────────────────────────────── */}
          <View style={[styles.actionContainer, { marginBottom: 16 }]}>
            {info.freeSpins > 0 ? (
              <TouchableOpacity
                style={[styles.spinButton, styles.spinButtonFree]}
                onPress={() => handleSpin(false)}
                disabled={spinning}
                activeOpacity={0.8}
                accessibilityLabel="Quay miễn phí"
              >
                <Ionicons name="gift-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.spinButtonText}>QUAY MIỄN PHÍ ({info.freeSpins} lượt)</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[
                styles.spinButton,
                styles.spinButtonXu,
                info.freeSpins > 0 && { marginTop: 10 },
                (info.walletBalance < info.spinCostXu) && { opacity: 0.4 },
              ]}
              onPress={() => handleSpin(true)}
              disabled={spinning || info.walletBalance < info.spinCostXu}
              activeOpacity={0.8}
              accessibilityLabel="Quay bằng xu"
            >
              <Ionicons name="wallet-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.spinButtonText}>QUAY BẰNG {info.spinCostXu} XU</Text>
            </TouchableOpacity>
          </View>

          {/* ── Prize legend ─────────────────────────────────────── */}
          <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>🏆 Cơ cấu giải thưởng</Text>
            <View style={styles.legendGrid}>
              {(() => {
                const grouped: any[] = [];
                let hasSmallXu = false;

                info.prizes.forEach((prize, index) => {
                  const color = SLICE_COLORS[index % SLICE_COLORS.length];
                  if (['xu_700', 'xu_500', 'xu_100'].includes(prize.id)) {
                    if (!hasSmallXu) {
                      grouped.push({
                        id: 'xu_small_group',
                        emoji: '🟡',
                        color: '#007AFF',
                        desc: '100 - 500 - 700 xu',
                        tag: 'XU NHỎ'
                      });
                      hasSmallXu = true;
                    }
                  } else {
                    const emoji = PRIZE_EMOJI[prize.id] || '🎁';
                    let desc = '';
                    if (prize.xuAmount > 0) desc = `${prize.xuAmount.toLocaleString('vi-VN')} xu`;
                    else if (prize.id === 'voucher_15') desc = 'Giảm 15%';
                    else if (prize.id === 'freeship') desc = 'Miễn phí vận chuyển';
                    else desc = 'Chúc may mắn lần sau';

                    let tag = '';
                    if (prize.id === 'xu_special') tag = 'ĐẶC BIỆT';
                    else if (prize.id === 'xu_big') tag = 'XU ĐẠI';

                    grouped.push({ id: prize.id, emoji, color, desc, tag });
                  }
                });

                return grouped.map((item) => (
                  <View key={item.id} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={styles.legendEmoji}>{item.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.legendItemText}>{item.desc}</Text>
                      {item.tag ? <Text style={[styles.legendTag, item.id === 'xu_special' && styles.legendTagSpecial]}>{item.tag}</Text> : null}
                    </View>
                  </View>
                ));
              })()}
            </View>
          </View>

          {/* ── Hint ──────────────────────────────────────────────── */}
          <View style={styles.hintBox}>
            <Ionicons name="time-outline" size={16} color="#FFD700" />
            <Text style={styles.hintText}>
              Đăng nhập hàng ngày & vào khung giờ vàng 7h-8h và 19h-20h để nhận lượt quay miễn phí!
            </Text>
          </View>
          <View style={{ height: 30 }} />
        </ScrollView>

        {/* ── Result Modal ─────────────────────────────────────────── */}
        <Modal visible={resultModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {spinResult?.prizeId === 'miss' ? (
                <>
                  <Text style={styles.modalEmoji}>🍀</Text>
                  <Text style={styles.modalTitle}>Rất tiếc!</Text>
                  <Text style={styles.modalMessage}>Chúc bạn may mắn lần sau nhé!</Text>
                </>
              ) : (
                <>
                  <Text style={styles.modalEmoji}>🎉</Text>
                  <Text style={styles.modalTitle}>Chúc Mừng!</Text>
                  <Text style={styles.modalMessage}>Bạn đã trúng thưởng</Text>
                  <View style={styles.modalPrizeBox}>
                    <Text style={styles.modalPrizeEmoji}>{PRIZE_EMOJI[spinResult?.prizeId] || '🎁'}</Text>
                    <Text style={styles.modalHighlight}>{spinResult?.rewardDescription}</Text>
                  </View>
                  {spinResult?.rewardXu > 0 && (
                    <View style={styles.modalNote}>
                      <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                      <Text style={styles.modalNoteText}>Xu đã được cộng vào Ví của bạn</Text>
                    </View>
                  )}
                  {spinResult?.rewardDescription?.includes('Voucher') && (
                    <View style={styles.modalNote}>
                      <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                      <Text style={styles.modalNoteText}>Voucher đã lưu vào Kho Voucher</Text>
                    </View>
                  )}
                </>
              )}

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setResultModalVisible(false)}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['#FF6B35', '#EE4D2D']} style={styles.modalCloseGradient}>
                  <Text style={styles.modalCloseText}>ĐÓNG</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 12,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#EE4D2D',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Balance bar
  balanceBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  balanceItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  balanceBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '500',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 1,
  },
  balanceDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 10,
  },

  // Wheel
  wheelWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  outerRing: {
    position: 'absolute',
    width: WHEEL_SIZE + 20,
    height: WHEEL_SIZE + 20,
    borderRadius: (WHEEL_SIZE + 20) / 2,
    borderWidth: 3,
    borderColor: 'rgba(255, 215, 0, 0.35)',
    backgroundColor: 'transparent',
  },
  pointerContainer: {
    position: 'absolute',
    top: -14,
    zIndex: 10,
    alignItems: 'center',
  },
  pointerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderTopWidth: 26,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFD700',
  },
  pointerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD700',
    marginTop: -4,
  },
  centerButton: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    zIndex: 5,
    elevation: 8,
    shadowColor: '#EE4D2D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  centerButtonGradient: {
    flex: 1,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  centerButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },

  // Legend
  legendContainer: {
    marginHorizontal: 16,
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  legendTitle: {
    color: '#FFD700',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  legendGrid: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendEmoji: {
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  legendItemText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '500',
  },
  legendTag: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  legendTagSpecial: {
    color: '#FFD700',
  },

  // Action buttons
  actionContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  spinButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    minHeight: 52,
  },
  spinButtonFree: {
    backgroundColor: '#34C759',
  },
  spinButtonXu: {
    backgroundColor: '#EE4D2D',
  },
  spinButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Hint
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.15)',
  },
  hintText: {
    flex: 1,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    lineHeight: 18,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1e2746',
    width: '100%',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    elevation: 10,
  },
  modalEmoji: {
    fontSize: 56,
    lineHeight: 70,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  modalMessage: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 16,
  },
  modalPrizeBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  modalPrizeEmoji: {
    fontSize: 34,
    lineHeight: 44,
    minWidth: 60,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalHighlight: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFD700',
    textAlign: 'center',
  },
  modalNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  modalNoteText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  modalCloseButton: {
    marginTop: 24,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalCloseGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
