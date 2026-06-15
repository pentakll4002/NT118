import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { apiClient } from '../../lib/apiClient';

interface Mission {
  id: string; 
  title: string;
  type: number;
  rewardXu: number;
  isDaily: boolean;
  status: 'todo' | 'completed' | 'claimed';
}

export default function MissionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  
  // Daily check-in state
  const [checkInStreak, setCheckInStreak] = useState(0);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  
  const [missions, setMissions] = useState<Mission[]>([]);

  useEffect(() => {
    fetchMissions();
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await apiClient.get('/api/wallet/balance');
      setBalance(res.data.coinBalance);
    } catch (e) {
      console.log('Error fetching wallet:', e);
    }
  };

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/missions/daily');
      const data = res.data;
      setCheckInStreak(data.checkInStreak || 0);
      setHasCheckedInToday(data.hasCheckedInToday || false);
      setMissions(data.missions.map((m: any) => ({
        id: m.id.toString(),
        title: m.title,
        type: m.type,
        rewardXu: m.rewardXu,
        isDaily: m.isDaily,
        status: m.status
      })));
    } catch (error) {
      console.log('Error fetching missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (hasCheckedInToday) return;
    
    const checkInMission = missions.find(m => m.type === 1); // 1 = DailyCheckIn
    if (!checkInMission) {
      Alert.alert('Lỗi', 'Không tìm thấy nhiệm vụ điểm danh');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/api/missions/claim', { missionId: parseInt(checkInMission.id) });
      setBalance(res.data.newBalance);
      setCheckInStreak(prev => prev + 1);
      setHasCheckedInToday(true);
      
      // Update local mission status
      setMissions(prev => prev.map(m => m.id === checkInMission.id ? { ...m, status: 'claimed' } : m));
      
      Alert.alert('Thành công', `Bạn đã nhận được ${res.data.rewardXu} Xu điểm danh!`);
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể điểm danh');
    } finally {
      setLoading(false);
    }
  };

  const handleMissionAction = async (mission: Mission) => {
    if (mission.status === 'claimed') return;

    // Play Lucky Wheel
    if (mission.type === 5) {
      router.push('/lucky-wheel' as any);
      return;
    }
    
    // Write Review
    if (mission.type === 3) {
      router.push('/orders?status=delivered' as any);
      return;
    }

    if (mission.type === 2) { // Share App
      try {
        const result = await Share.share({
          message: 'Tải ngay NT118 App để mua sắm với vô vàn ưu đãi và tích Xu đổi quà hấp dẫn! https://nt118.com',
          title: 'Chia sẻ ứng dụng'
        });
        
        if (result.action === Share.sharedAction) {
          const res = await apiClient.post('/api/missions/claim', { missionId: parseInt(mission.id) });
          setBalance(res.data.newBalance);
          setMissions(prev => prev.map(m => m.id === mission.id ? { ...m, status: 'claimed' } : m));
          Alert.alert('Thành công', `Bạn đã nhận được ${res.data.rewardXu} Xu!`);
        }
      } catch (e: any) {
        Alert.alert('Lỗi', e.response?.data?.message || e.message || 'Không thể chia sẻ');
      }
    } else if (mission.status === 'completed') {
      // Claim reward for other types
      try {
        const res = await apiClient.post('/api/missions/claim', { missionId: parseInt(mission.id) });
        setBalance(res.data.newBalance);
        setMissions(prev => prev.map(m => m.id === mission.id ? { ...m, status: 'claimed' } : m));
        Alert.alert('Thành công', `Bạn đã nhận được ${res.data.rewardXu} Xu!`);
      } catch (e: any) {
        Alert.alert('Lỗi', e.response?.data?.message || 'Không thể nhận thưởng');
      }
    } else {
      // For referral
      router.push('/referral' as any);
    }
  };

  const getMissionConfig = (type: number) => {
    switch (type) {
      case 2: return { icon: 'share-social', actionText: 'Chia sẻ' };
      case 3: return { icon: 'star', actionText: 'Đánh giá ngay' };
      case 4: return { icon: 'people', actionText: 'Mời bạn' };
      case 5: return { icon: 'aperture', actionText: 'Quay ngay' };
      default: return { icon: 'gift', actionText: 'Thực hiện' };
    }
  };

  const renderCheckInDays = () => {
    const days = [];
    for (let i = 1; i <= 7; i++) {
      const isPast = i <= checkInStreak;
      const isToday = i === checkInStreak + 1;
      const isSpecial = i === 7;
      const reward = isSpecial ? 500 : 100;

      days.push(
        <View key={i} style={[styles.checkInDayBox, isPast && styles.checkInDayBoxPast, isToday && styles.checkInDayBoxToday]}>
          <Text style={[styles.checkInDayText, (isPast || isToday) && styles.textWhite]}>Ngày {i}</Text>
          <View style={styles.checkInIconContainer}>
            {isPast ? (
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
            ) : (
              <FontAwesome5 name="coins" size={20} color={isToday ? "#fff" : "#FF9500"} />
            )}
          </View>
          <Text style={[styles.checkInRewardText, (isPast || isToday) && styles.textWhite]}>+{reward}</Text>
        </View>
      );
    }
    return days;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#EE4D2D', '#FF7337']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Săn Xu Mỗi Ngày</Text>
          <View style={{ width: 40 }} />
        </View>
        
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Số dư Shopee Xu</Text>
            <View style={styles.balanceRow}>
              <FontAwesome5 name="coins" size={22} color="#FFD700" />
              <Text style={styles.balanceValue}>{balance.toLocaleString('vi-VN')}</Text>
            </View>
            <Text style={styles.balanceSubtext}>Dùng để giảm giá trực tiếp vào đơn hàng</Text>
          </View>
          <TouchableOpacity style={styles.historyBtn}>
            <Text style={styles.historyBtnText}>Lịch sử</Text>
            <Ionicons name="chevron-forward" size={16} color="#EE4D2D" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Daily Check-in */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Điểm danh nhận Xu</Text>
            <Text style={styles.sectionSubtitle}>Liên tục 7 ngày nhận quà lớn</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.checkInScroll}>
            {renderCheckInDays()}
          </ScrollView>

          <TouchableOpacity 
            style={[styles.mainBtn, hasCheckedInToday && styles.mainBtnDisabled]} 
            onPress={handleCheckIn}
            disabled={hasCheckedInToday || loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>{hasCheckedInToday ? 'Đã điểm danh hôm nay' : 'Điểm danh ngay'}</Text>}
          </TouchableOpacity>
        </View>

        {/* Missions List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nhiệm vụ hàng ngày</Text>
          <View style={styles.missionList}>
            {missions.filter(m => m.isDaily && m.type !== 1).map((mission) => {
              const config = getMissionConfig(mission.type);
              return (
              <View key={mission.id} style={styles.missionCard}>
                <View style={[styles.missionIconWrapper, mission.status === 'claimed' && { backgroundColor: '#e0e0e0' }]}>
                  <Ionicons name={config.icon as any} size={24} color={mission.status === 'claimed' ? '#888' : '#EE4D2D'} />
                </View>
                <View style={styles.missionContent}>
                  <Text style={styles.missionTitle}>{mission.title}</Text>
                  {mission.rewardXu > 0 && (
                    <View style={styles.rewardTag}>
                      <FontAwesome5 name="coins" size={11} color="#FF9500" />
                      <Text style={styles.rewardText}>+{mission.rewardXu} Xu</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity 
                  style={[
                    styles.actionBtn, 
                    mission.status === 'completed' && styles.actionBtnClaim,
                    mission.status === 'claimed' && styles.actionBtnClaimed
                  ]}
                  onPress={() => handleMissionAction(mission)}
                  disabled={mission.status === 'claimed'}
                >
                  <Text style={[
                    styles.actionBtnText,
                    mission.status === 'claimed' && styles.actionBtnTextClaimed
                  ]}>
                    {mission.status === 'claimed' ? 'Đã nhận' : mission.status === 'completed' ? 'Nhận Xu' : config.actionText}
                  </Text>
                </TouchableOpacity>
              </View>
            )})}
          </View>
        </View>

        {/* One-time Missions */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <Text style={styles.sectionTitle}>Nhiệm vụ đặc biệt</Text>
          <View style={styles.missionList}>
            {missions.filter(m => !m.isDaily).map((mission) => {
              const config = getMissionConfig(mission.type);
              return (
              <View key={mission.id} style={styles.missionCard}>
                <View style={styles.missionIconWrapper}>
                  <Ionicons name={config.icon as any} size={24} color="#EE4D2D" />
                </View>
                <View style={styles.missionContent}>
                  <Text style={styles.missionTitle}>{mission.title}</Text>
                  <View style={styles.rewardTag}>
                    <FontAwesome5 name="coins" size={11} color="#FF9500" />
                    <Text style={styles.rewardText}>+{mission.rewardXu.toLocaleString('vi-VN')} Xu</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={() => handleMissionAction(mission)}
                >
                  <Text style={styles.actionBtnText}>{config.actionText}</Text>
                </TouchableOpacity>
              </View>
            )})}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backButton: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  balanceCard: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  balanceInfo: { flex: 1 },
  balanceLabel: { fontSize: 13, color: '#666', marginBottom: 4 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  balanceValue: { fontSize: 28, fontWeight: '800', color: '#EE4D2D' },
  balanceSubtext: { fontSize: 12, color: '#999', marginTop: 4 },
  historyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0ED', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  historyBtnText: { color: '#EE4D2D', fontSize: 13, fontWeight: '600', marginRight: 2 },
  
  content: { flex: 1 },
  section: { backgroundColor: '#fff', marginTop: 12, paddingVertical: 16 },
  sectionHeader: { paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', paddingHorizontal: 16 },
  sectionSubtitle: { fontSize: 13, color: '#666', marginTop: 2 },
  
  checkInScroll: { paddingHorizontal: 16, gap: 10, paddingBottom: 16 },
  checkInDayBox: { width: 65, height: 90, backgroundColor: '#f9f9f9', borderRadius: 12, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderWidth: 1, borderColor: '#eee' },
  checkInDayBoxPast: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  checkInDayBoxToday: { backgroundColor: '#EE4D2D', borderColor: '#EE4D2D', transform: [{ scale: 1.05 }] },
  checkInDayText: { fontSize: 12, color: '#666', fontWeight: '600' },
  checkInIconContainer: { flex: 1, justifyContent: 'center' },
  checkInRewardText: { fontSize: 13, color: '#EE4D2D', fontWeight: '700' },
  textWhite: { color: '#fff' },
  
  mainBtn: { backgroundColor: '#EE4D2D', marginHorizontal: 16, padding: 14, borderRadius: 8, alignItems: 'center' },
  mainBtnDisabled: { backgroundColor: '#ccc' },
  mainBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  missionList: { paddingHorizontal: 16, marginTop: 12 },
  missionCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  missionIconWrapper: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF0ED', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  missionContent: { flex: 1 },
  missionTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 4 },
  rewardTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9E6', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, gap: 4 },
  rewardText: { fontSize: 12, color: '#FF9500', fontWeight: '700' },
  
  actionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#EE4D2D' },
  actionBtnClaim: { backgroundColor: '#EE4D2D' },
  actionBtnClaimed: { backgroundColor: '#f0f0f0', borderColor: '#e0e0e0' },
  actionBtnText: { color: '#EE4D2D', fontSize: 13, fontWeight: '600' },
  actionBtnTextClaimed: { color: '#888' },
});
