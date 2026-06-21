import { Image } from 'expo-image';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getWallet, getTransactions, topUp, withdraw, WalletDTO, WalletTransactionDTO } from '../lib/walletApi';
import * as Haptics from 'expo-haptics';

export default function WalletScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<WalletDTO | null>(null);
  const [transactions, setTransactions] = useState<WalletTransactionDTO[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'topup' | 'payment' | 'withdraw' | 'refund' | 'gift'>('all');
  
  // Top Up Modal State
  const [topUpVisible, setTopUpVisible] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');

  // Withdraw Modal State
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawBank, setWithdrawBank] = useState('Vietcombank');
  const [withdrawAccountNo, setWithdrawAccountNo] = useState('');
  const [withdrawAccountName, setWithdrawAccountName] = useState('');

  // QR Modal State
  const [qrVisible, setQrVisible] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [qrInvoiceAmount] = useState(15000);

  // Simulation State
  const [simulationStep, setSimulationStep] = useState<'idle' | 'bank_select' | 'processing' | 'success'>('idle');
  const [simulationType, setSimulationType] = useState<'topup' | 'withdraw' | 'qr'>('topup');
  const [selectedBank, setSelectedBank] = useState('Vietcombank');

  const loadData = async () => {
    try {
      setLoading(true);
      const [w, txs] = await Promise.all([
        getWallet(),
        getTransactions()
      ]);
      setWallet(w);
      setTransactions(txs);
    } catch (e) {
      console.log('Failed to fetch wallet info', e);
      Alert.alert('Lỗi', 'Không thể tải thông tin ví.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTopUpPreset = (amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTopUpAmount(amount.toString());
  };

  const handleExecuteTopUp = () => {
    const amt = Number(topUpAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Lỗi', 'Số tiền nạp không hợp lệ.');
      return;
    }
    setTopUpVisible(false);
    setSimulationType('topup');
    setSimulationStep('bank_select');
  };

  const handleConfirmTopUpBank = async () => {
    setSimulationStep('processing');
    // Simulate transaction processing for realistic gateway feel
    setTimeout(async () => {
      try {
        const amt = Number(topUpAmount);
        const res = await topUp(amt);
        setSimulationStep('success');
        setTopUpAmount('');
        loadData();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (err: any) {
        setSimulationStep('idle');
        Alert.alert('Lỗi', err.response?.data?.message || 'Không thể thực hiện nạp tiền.');
      }
    }, 2200);
  };

  const handleExecuteWithdraw = () => {
    const amt = Number(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Lỗi', 'Số tiền rút không hợp lệ.');
      return;
    }
    if (!withdrawAccountNo.trim() || !withdrawAccountName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin tài khoản ngân hàng.');
      return;
    }
    if (wallet && wallet.balance < amt) {
      Alert.alert('Lỗi', 'Số dư ví không đủ để rút.');
      return;
    }

    setWithdrawVisible(false);
    setSimulationType('withdraw');
    setSelectedBank(withdrawBank);
    setSimulationStep('processing');

    // Simulate transfer gateway linking (Napas)
    setTimeout(async () => {
      try {
        const res = await withdraw(amt, withdrawBank, withdrawAccountNo);
        setSimulationStep('success');
        setWithdrawAmount('');
        setWithdrawAccountNo('');
        setWithdrawAccountName('');
        loadData();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (err: any) {
        setSimulationStep('idle');
        Alert.alert('Lỗi', err.response?.data?.message || 'Không thể thực hiện rút tiền.');
      }
    }, 2500);
  };

  const handleStartQRScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setQrVisible(true);
    setScanning(true);
    
    // Simulate scan detection in camera viewfinder
    setTimeout(() => {
      setScanning(false);
    }, 2000);
  };

  const handleConfirmQRPayment = async () => {
    setQrVisible(false);
    setSimulationType('qr');
    setSimulationStep('processing');
    
    setTimeout(async () => {
      try {
        const res = await withdraw(qrInvoiceAmount, 'Cửa hàng tiện lợi ShopeeLite Store', 'Thanh toán QR-CODE');
        setSimulationStep('success');
        loadData();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (err: any) {
        setSimulationStep('idle');
        Alert.alert('Lỗi', err.response?.data?.message || 'Thanh toán thất bại.');
      }
    }, 2000);
  };

  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === 'all') return true;
    return tx.type.toLowerCase() === activeTab;
  });

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'topup':
        return <MaterialCommunityIcons name="bank-transfer-in" size={24} color="#4CAF50" />;
      case 'payment':
        return <MaterialCommunityIcons name="cart-arrow-right" size={24} color="#E53935" />;
      case 'withdraw':
        return <MaterialCommunityIcons name="bank-transfer-out" size={24} color="#F44336" />;
      case 'refund':
        return <MaterialCommunityIcons name="cash-refund" size={24} color="#00ACC1" />;
      case 'gift':
        return <Ionicons name="gift-sharp" size={24} color="#FF9100" />;
      default:
        return <Ionicons name="swap-horizontal" size={24} color="#757575" />;
    }
  };

  const getTransactionName = (type: string) => {
    switch (type.toLowerCase()) {
      case 'topup':
        return 'Nạp tiền vào ví';
      case 'payment':
        return 'Thanh toán đơn hàng';
      case 'withdraw':
        return 'Rút tiền về ngân hàng';
      case 'refund':
        return 'Hoàn tiền';
      case 'gift':
        return 'Nhận xu may mắn';
      default:
        return 'Giao dịch khác';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#EE4D2D" />
        <Text style={{ marginTop: 12, color: '#666' }}>Đang tải thông tin ví...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ví ShopeePay</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
          <Ionicons name="refresh" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Balance Gradient Card */}
        <View style={styles.cardContainer}>
          <View style={styles.walletCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.brandRow}>
                <MaterialCommunityIcons name="wallet-outline" size={22} color="#FFF" />
                <Text style={styles.brandText}>ShopeePay</Text>
              </View>
              <View style={styles.cardStatusBadge}>
                <Text style={styles.cardStatusText}>Đang hoạt động</Text>
              </View>
            </View>

            <View style={styles.balanceSection}>
              <Text style={styles.balanceLabel}>Số dư ví khả dụng</Text>
              <Text style={styles.balanceValue}>
                {wallet ? `${wallet.balance.toLocaleString('vi-VN')}đ` : '0đ'}
              </Text>
            </View>

            <View style={styles.cardFooterRow}>
              <View style={styles.coinBadgeContainer}>
                <Ionicons name="gift" size={16} color="#FFD700" style={{ marginRight: 6 }} />
                <Text style={styles.coinBadgeText}>
                  {wallet ? `${wallet.balance.toLocaleString('vi-VN')} xu` : '0 xu'}
                </Text>
              </View>
              <Text style={styles.cardUserType}>Thành viên Vàng</Text>
            </View>
          </View>
        </View>

        {/* Quick Action Bar */}
        <View style={styles.quickActionsBar}>
          <TouchableOpacity 
            style={styles.quickActionButton} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setTopUpVisible(true);
            }}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="bank-transfer-in" size={24} color="#2E7D32" />
            </View>
            <Text style={styles.actionButtonText}>Nạp tiền</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionButton} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setWithdrawVisible(true);
            }}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#FFEBEE' }]}>
              <MaterialCommunityIcons name="bank-transfer-out" size={24} color="#C62828" />
            </View>
            <Text style={styles.actionButtonText}>Rút tiền</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionButton} 
            onPress={handleStartQRScan}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#E0F7FA' }]}>
              <MaterialCommunityIcons name="qrcode-scan" size={24} color="#00838F" />
            </View>
            <Text style={styles.actionButtonText}>Quét QR</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Filters */}
        <View style={styles.tabSection}>
          <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'all' && styles.tabButtonActive]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>Tất cả</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'topup' && styles.tabButtonActive]}
              onPress={() => setActiveTab('topup')}
            >
              <Text style={[styles.tabText, activeTab === 'topup' && styles.tabTextActive]}>Nạp tiền</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'payment' && styles.tabButtonActive]}
              onPress={() => setActiveTab('payment')}
            >
              <Text style={[styles.tabText, activeTab === 'payment' && styles.tabTextActive]}>Thanh toán</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'withdraw' && styles.tabButtonActive]}
              onPress={() => setActiveTab('withdraw')}
            >
              <Text style={[styles.tabText, activeTab === 'withdraw' && styles.tabTextActive]}>Rút tiền</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'refund' && styles.tabButtonActive]}
              onPress={() => setActiveTab('refund')}
            >
              <Text style={[styles.tabText, activeTab === 'refund' && styles.tabTextActive]}>Hoàn tiền</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'gift' && styles.tabButtonActive]}
              onPress={() => setActiveTab('gift')}
            >
              <Text style={[styles.tabText, activeTab === 'gift' && styles.tabTextActive]}>Mở quà</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Transactions list */}
        <View style={styles.listContainer}>
          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="receipt-text-minus" size={48} color="#CCCCCC" />
              <Text style={styles.emptyText}>Chưa có giao dịch nào thuộc danh mục này.</Text>
            </View>
          ) : (
            filteredTransactions.map((tx) => (
              <View key={tx.id} style={styles.txRow}>
                <View style={styles.txIconContainer}>
                  {getTransactionIcon(tx.type)}
                </View>
                <View style={styles.txDetails}>
                  <Text style={styles.txName}>{getTransactionName(tx.type)}</Text>
                  <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text>
                  <Text style={styles.txDate}>
                    {new Date(tx.createdAt).toLocaleString('vi-VN')}
                  </Text>
                </View>
                <Text style={[
                  styles.txAmount,
                  tx.amount > 0 ? styles.txAmountPositive : styles.txAmountNegative
                ]}>
                  {tx.amount > 0 ? `+${tx.amount.toLocaleString('vi-VN')}đ` : `${tx.amount.toLocaleString('vi-VN')}đ`}
                </Text>
              </View>
            ))
          )}
        </View>

      </ScrollView>

      {/* Top Up Preset & Amount Input Modal */}
      <Modal
        visible={topUpVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTopUpVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nạp tiền vào ví</Text>
              <TouchableOpacity onPress={() => setTopUpVisible(false)}>
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nhập số tiền nạp (VND)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                placeholder="Ví dụ: 100000"
                value={topUpAmount}
                onChangeText={setTopUpAmount}
                autoFocus
              />
            </View>

            {/* Presets */}
            <View style={styles.presetsRow}>
              {[50000, 100000, 200000, 500000].map(amt => (
                <TouchableOpacity 
                  key={amt} 
                  style={[
                    styles.presetButton,
                    topUpAmount === amt.toString() && styles.presetButtonActive
                  ]}
                  onPress={() => handleTopUpPreset(amt)}
                >
                  <Text style={[
                    styles.presetButtonText,
                    topUpAmount === amt.toString() && styles.presetButtonTextActive
                  ]}>
                    {(amt / 1000).toLocaleString('vi-VN')}K
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.executeButton} onPress={handleExecuteTopUp}>
              <Text style={styles.executeButtonText}>Tiếp tục</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        visible={withdrawVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setWithdrawVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rút tiền về ngân hàng</Text>
              <TouchableOpacity onPress={() => setWithdrawVisible(false)}>
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Tên ngân hàng thụ hưởng</Text>
                <TextInput
                  style={styles.textInputSmall}
                  placeholder="Ví dụ: Vietcombank, Techcombank..."
                  value={withdrawBank}
                  onChangeText={setWithdrawBank}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Số tài khoản</Text>
                <TextInput
                  style={styles.textInputSmall}
                  keyboardType="numeric"
                  placeholder="Nhập số tài khoản ngân hàng"
                  value={withdrawAccountNo}
                  onChangeText={setWithdrawAccountNo}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Tên chủ tài khoản (Không dấu)</Text>
                <TextInput
                  style={styles.textInputSmall}
                  autoCapitalize="characters"
                  placeholder="Ví dụ: NGUYEN VAN A"
                  value={withdrawAccountName}
                  onChangeText={setWithdrawAccountName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Số tiền cần rút (đ)</Text>
                <TextInput
                  style={styles.textInputSmall}
                  keyboardType="numeric"
                  placeholder="Ví dụ: 100000"
                  value={withdrawAmount}
                  onChangeText={setWithdrawAmount}
                />
              </View>

              <TouchableOpacity style={[styles.executeButton, { marginTop: 24 }]} onPress={handleExecuteWithdraw}>
                <Text style={styles.executeButtonText}>Xác nhận rút tiền</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* QR scanner simulation Modal */}
      <Modal
        visible={qrVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQrVisible(false)}
      >
        <View style={styles.qrModalOverlay}>
          {scanning ? (
            <View style={styles.scannerContainer}>
              <View style={styles.scannerHeader}>
                <TouchableOpacity onPress={() => setQrVisible(false)}>
                  <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.scannerTitle}>Quét mã QR thanh toán</Text>
                <View style={{ width: 24 }} />
              </View>
              
              <View style={styles.viewfinderContainer}>
                <View style={styles.viewfinder}>
                  <View style={styles.scanBar} />
                  <View style={styles.cornerTL} />
                  <View style={styles.cornerTR} />
                  <View style={styles.cornerBL} />
                  <View style={styles.cornerBR} />
                </View>
                <Text style={styles.scanLabel}>Hướng camera vào mã QR ShopeePay QR-CODE</Text>
              </View>
              
              <ActivityIndicator size="large" color="#FFF" style={{ marginTop: 20 }} />
            </View>
          ) : (
            <View style={styles.qrInvoiceCard}>
              <View style={styles.qrInvoiceHeader}>
                <MaterialCommunityIcons name="qrcode-scan" size={32} color="#00838F" />
                <Text style={styles.qrInvoiceTitle}>Phát hiện QR thanh toán</Text>
              </View>
              
              <View style={styles.qrInvoiceDetails}>
                <Text style={styles.qrInvoiceDetailLabel}>Đơn vị chấp nhận:</Text>
                <Text style={styles.qrInvoiceDetailValue}>Cửa hàng ShopeeLite Premium Store</Text>

                <Text style={[styles.qrInvoiceDetailLabel, { marginTop: 12 }]}>Số tiền thanh toán:</Text>
                <Text style={styles.qrInvoicePrice}>15.000đ</Text>

                <Text style={[styles.qrInvoiceDetailLabel, { marginTop: 12 }]}>Nguồn tiền thanh toán:</Text>
                <Text style={styles.qrInvoiceWallet}>Ví ShopeePay ({wallet ? `${wallet.balance.toLocaleString('vi-VN')}đ` : '0đ'})</Text>
              </View>

              <View style={styles.qrInvoiceActions}>
                <TouchableOpacity style={styles.qrCancelButton} onPress={() => setQrVisible(false)}>
                  <Text style={styles.qrCancelButtonText}>Hủy giao dịch</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.qrConfirmButton} onPress={handleConfirmQRPayment}>
                  <Text style={styles.qrConfirmButtonText}>Thanh toán ngay</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* Gateway Simulation Overlay Modal */}
      <Modal
        visible={simulationStep !== 'idle'}
        transparent
        animationType="fade"
      >
        <View style={styles.simOverlay}>
          {simulationStep === 'bank_select' && (
            <View style={styles.simCard}>
              <Text style={styles.simTitle}>Cổng thanh toán liên kết</Text>
              <Text style={styles.simSub}>Chọn ngân hàng nguồn tiền nạp vào ví ShopeePay</Text>
              
              <ScrollView style={{ maxHeight: 250, marginVertical: 16 }}>
                {['Vietcombank', 'Techcombank', 'MB Bank', 'Agribank', 'Ví điện tử MoMo'].map((bank) => (
                  <TouchableOpacity 
                    key={bank}
                    style={[styles.bankRow, selectedBank === bank && styles.bankRowActive]}
                    onPress={() => setSelectedBank(bank)}
                  >
                    <Ionicons 
                      name={selectedBank === bank ? "radio-button-on" : "radio-button-off"} 
                      size={20} 
                      color={selectedBank === bank ? "#EE4D2D" : "#888"} 
                    />
                    <Text style={[styles.bankRowText, selectedBank === bank && styles.bankRowTextActive]}>
                      {bank}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.simActions}>
                <TouchableOpacity style={styles.simCancelBtn} onPress={() => setSimulationStep('idle')}>
                  <Text style={styles.simCancelBtnText}>Hủy bỏ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.simConfirmBtn} onPress={handleConfirmTopUpBank}>
                  <Text style={styles.simConfirmBtnText}>Xác nhận thanh toán</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {simulationStep === 'processing' && (
            <View style={styles.simCardCentered}>
              <ActivityIndicator size="large" color="#EE4D2D" />
              
              <Text style={styles.simProgressTitle}>
                {simulationType === 'topup' && 'Đang liên kết nguồn tiền nạp...'}
                {simulationType === 'withdraw' && 'Đang kết nối cổng Napas quốc gia...'}
                {simulationType === 'qr' && 'Đang bảo mật giao dịch QR-Pay...'}
              </Text>
              
              <Text style={styles.simProgressSub}>
                {simulationType === 'topup' && `Đang giao dịch an toàn với ${selectedBank}. Vui lòng không đóng ứng dụng.`}
                {simulationType === 'withdraw' && `Đang chuyển khoản tới số tài khoản thụ hưởng tại ${selectedBank}.`}
                {simulationType === 'qr' && 'Hệ thống đang xác thực chữ ký số hóa đơn thanh toán.'}
              </Text>
            </View>
          )}

          {simulationStep === 'success' && (
            <View style={styles.simCardCentered}>
              <View style={styles.successCircle}>
                <Ionicons name="checkmark" size={40} color="#FFFFFF" />
              </View>
              
              <Text style={styles.simSuccessTitle}>Giao dịch thành công!</Text>
              <Text style={styles.simSuccessSub}>
                {simulationType === 'topup' && `Nạp tiền thành công từ cổng liên kết ${selectedBank}. Số dư của bạn đã tăng lên.`}
                {simulationType === 'withdraw' && `Số tiền rút đã được chuyển đi thành công về ngân hàng ${selectedBank}.`}
                {simulationType === 'qr' && 'Đơn hàng QR tại cửa hàng đã được thanh toán thành công.'}
              </Text>
              
              <TouchableOpacity style={styles.simDoneBtn} onPress={() => setSimulationStep('idle')}>
                <Text style={styles.simDoneBtnText}>Hoàn tất</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 4,
  },
  refreshButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  cardContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  walletCard: {
    backgroundColor: '#1E1A3C', // Deep premium navy
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#1E1A3C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardStatusBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardStatusText: {
    color: '#4CAF50',
    fontSize: 11,
    fontWeight: '700',
  },
  balanceSection: {
    marginVertical: 20,
  },
  balanceLabel: {
    color: '#A0AEC0',
    fontSize: 13,
    fontWeight: '500',
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 14,
  },
  coinBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  coinBadgeText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '800',
  },
  cardUserType: {
    color: '#CBD5E0',
    fontSize: 12,
    fontWeight: '600',
  },
  quickActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A5568',
  },
  tabSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D3748',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 4,
  },
  tabButton: {
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  tabButtonActive: {
    backgroundColor: '#EE4D2D',
  },
  tabText: {
    fontSize: 13,
    color: '#4A5568',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    paddingHorizontal: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    color: '#718096',
    fontSize: 13,
    textAlign: 'center',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  txIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txDetails: {
    flex: 1,
  },
  txName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3748',
  },
  txDesc: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  txDate: {
    fontSize: 10,
    color: '#A0AEC0',
    marginTop: 4,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  txAmountPositive: {
    color: '#4CAF50',
  },
  txAmountNegative: {
    color: '#2D3748',
  },
  // Modal Style
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D3748',
  },
  inputContainer: {
    marginTop: 16,
  },
  inputLabel: {
    color: '#718096',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderBottomWidth: 2,
    borderBottomColor: '#EE4D2D',
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    paddingVertical: 8,
  },
  textInputSmall: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    paddingVertical: 8,
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  presetButton: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetButtonActive: {
    backgroundColor: '#FFF5F5',
    borderColor: '#EE4D2D',
  },
  presetButtonText: {
    fontSize: 13,
    color: '#4A5568',
    fontWeight: '700',
  },
  presetButtonTextActive: {
    color: '#EE4D2D',
  },
  executeButton: {
    backgroundColor: '#EE4D2D',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  executeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  // Simulation overlays
  simOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  simCard: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  simTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D3748',
  },
  simSub: {
    fontSize: 13,
    color: '#718096',
    marginTop: 6,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    gap: 12,
  },
  bankRowActive: {
    backgroundColor: '#FFF5F5',
  },
  bankRowText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
  },
  bankRowTextActive: {
    color: '#EE4D2D',
  },
  simActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  simCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#EDF2F7',
    alignItems: 'center',
  },
  simCancelBtnText: {
    color: '#4A5568',
    fontWeight: '700',
  },
  simConfirmBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#EE4D2D',
    alignItems: 'center',
  },
  simConfirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  simCardCentered: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
  },
  simProgressTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D3748',
    marginTop: 20,
    textAlign: 'center',
  },
  simProgressSub: {
    fontSize: 13,
    color: '#718096',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  simSuccessTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D3748',
    textAlign: 'center',
  },
  simSuccessSub: {
    fontSize: 13,
    color: '#718096',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  simDoneBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  simDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  // QR scanner overlay
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    position: 'absolute',
    top: 50,
  },
  scannerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  viewfinderContainer: {
    alignItems: 'center',
  },
  viewfinder: {
    width: 250,
    height: 250,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  scanBar: {
    width: '90%',
    height: 3,
    backgroundColor: '#00838F',
    position: 'absolute',
    top: '50%',
  },
  cornerTL: { position: 'absolute', top: -2, left: -2, width: 20, height: 20, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#00838F' },
  cornerTR: { position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#00838F' },
  cornerBL: { position: 'absolute', bottom: -2, left: -2, width: 20, height: 20, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#00838F' },
  cornerBR: { position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#00838F' },
  scanLabel: {
    color: '#FFF',
    fontSize: 13,
    marginTop: 20,
    textAlign: 'center',
  },
  qrInvoiceCard: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  qrInvoiceHeader: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  qrInvoiceTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D3748',
  },
  qrInvoiceDetails: {
    width: '100%',
    backgroundColor: '#F7FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  qrInvoiceDetailLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
  },
  qrInvoiceDetailValue: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '700',
    marginTop: 2,
  },
  qrInvoicePrice: {
    fontSize: 24,
    color: '#EE4D2D',
    fontWeight: '900',
    marginTop: 2,
  },
  qrInvoiceWallet: {
    fontSize: 13,
    color: '#4A5568',
    fontWeight: '700',
    marginTop: 2,
  },
  qrInvoiceActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  qrCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E0',
    alignItems: 'center',
  },
  qrCancelButtonText: {
    color: '#718096',
    fontWeight: '700',
  },
  qrConfirmButton: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#00838F',
    alignItems: 'center',
  },
  qrConfirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
