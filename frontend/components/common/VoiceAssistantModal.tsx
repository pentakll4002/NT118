import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Animated, 
  Easing, 
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { parseVoiceAudio, parseVoiceText, VoiceParsedResponse } from '../../lib/chatApi';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface VoiceAssistantModalProps {
  visible: boolean;
  onClose: () => void;
  // If we are currently on a product detail page, we can pass the product ID & add to cart handler
  currentProductId?: string | number;
  onAddToCart?: () => Promise<void>;
  onAddToWishlist?: () => Promise<void>;
}

export default function VoiceAssistantModal({ 
  visible, 
  onClose,
  currentProductId,
  onAddToCart,
  onAddToWishlist
}: VoiceAssistantModalProps) {
  const router = useRouter();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [statusText, setStatusText] = useState('Đang lắng nghe...');
  const [transcription, setTranscription] = useState('');
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnims = [
    useRef(new Animated.Value(10)).current,
    useRef(new Animated.Value(25)).current,
    useRef(new Animated.Value(15)).current,
    useRef(new Animated.Value(30)).current,
    useRef(new Animated.Value(12)).current,
  ];

  // Start pulsing mic icon when recording
  useEffect(() => {
    let pulse: Animated.CompositeAnimation | null = null;
    let waveLoops: Animated.CompositeAnimation[] = [];

    if (isRecording) {
      pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      );
      pulse.start();

      // Start waveform animations
      waveAnims.forEach((anim, index) => {
        const loop = Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: Math.random() * 40 + 15,
              duration: 250 + index * 50,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: Math.random() * 10 + 5,
              duration: 250 + index * 50,
              useNativeDriver: false,
            }),
          ])
        );
        waveLoops.push(loop);
        loop.start();
      });
    } else {
      pulseAnim.setValue(1);
      waveAnims.forEach((anim, i) => anim.setValue(10 + i * 2));
    }

    return () => {
      if (pulse) pulse.stop();
      waveLoops.forEach(loop => loop.stop());
    };
  }, [isRecording]);

  // Handle start/stop recording on open/close
  useEffect(() => {
    if (visible) {
      startRecordingWorkflow();
    } else {
      stopRecordingWorkflow(false); // cancel
      // Reset state
      setTranscription('');
      setResponseText('');
      setStatusText('Nhấn giữ hoặc chạm để nói...');
    }
  }, [visible]);

  const startRecordingWorkflow = async () => {
    try {
      setTranscription('');
      setResponseText('');
      setLoading(false);
      
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        setStatusText('Không có quyền sử dụng Microphone');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      setStatusText('Đang lắng nghe...');
      setIsRecording(true);

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
    } catch (err) {
      console.log('Failed to start recording', err);
      setStatusText('Lỗi khởi động ghi âm');
      setIsRecording(false);
    }
  };

  const stopRecordingWorkflow = async (shouldProcess = true) => {
    if (!recording) {
      setIsRecording(false);
      return;
    }

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (shouldProcess && uri) {
        processAudio(uri);
      }
    } catch (error) {
      console.log('Failed to stop recording', error);
      setIsRecording(false);
    }
  };

  const processAudio = async (uri: string) => {
    try {
      setLoading(true);
      setStatusText('Đang nhận dạng giọng nói...');
      
      const result = await parseVoiceAudio(uri);
      handleVoiceResult(result);
    } catch (err) {
      console.log('Process voice error', err);
      setStatusText('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceResult = (result: VoiceParsedResponse) => {
    setTranscription(result.text);
    setResponseText(result.response_message);
    setStatusText('Đã thực hiện!');

    setTimeout(async () => {
      // Execute Action
      switch (result.action) {
        case 'SEARCH':
          let searchUrl = `/search-results?q=${encodeURIComponent(result.params.q || result.text)}`;
          if (result.params.category) {
            // Check if we can find a matching category from backend later, or let the search endpoint handle the category text
            searchUrl += `&categoryText=${encodeURIComponent(result.params.category)}`;
          }
          if (result.params.color) {
            searchUrl += `&color=${encodeURIComponent(result.params.color)}`;
          }
          if (result.params.min_price) {
            searchUrl += `&minPrice=${result.params.min_price}`;
          }
          if (result.params.max_price) {
            searchUrl += `&maxPrice=${result.params.max_price}`;
          }
          
          onClose();
          router.push(searchUrl as any);
          break;

        case 'NAVIGATE':
          const screen = result.params.screen;
          onClose();
          
          if (screen === 'cart') router.push('/(tabs)/cart');
          else if (screen === 'wishlist') router.push('/(tabs)/wishlist');
          else if (screen === 'notification') router.push('/(tabs)/notification');
          else if (screen === 'settings') router.push('/(tabs)/settings');
          else if (screen === 'home') router.push('/(tabs)');
          else if (screen === 'wallet') router.push('/wallet');
          else if (screen === 'chat') router.push('/chat');
          else if (screen === 'orders') router.push('/orders');
          else router.push('/(tabs)');
          break;

        case 'ADD_TO_CART':
          if (currentProductId && onAddToCart) {
            await onAddToCart();
            setStatusText('Đã thêm sản phẩm vào giỏ hàng!');
          } else if (result.params.product_name) {
            // If they specified a product name but we aren't on detail page, search for it
            onClose();
            router.push(`/search-results?q=${encodeURIComponent(result.params.product_name)}` as any);
          } else {
            setStatusText('Bạn cần ở trang chi tiết sản phẩm.');
          }
          break;

        case 'FAVORITE':
          if (currentProductId && onAddToWishlist) {
            await onAddToWishlist();
            setStatusText('Đã lưu sản phẩm vào danh sách yêu thích!');
          } else if (result.params.product_name) {
            onClose();
            router.push(`/search-results?q=${encodeURIComponent(result.params.product_name)}` as any);
          } else {
            setStatusText('Bạn cần ở trang chi tiết sản phẩm.');
          }
          break;

        default:
          // Try standard search as fallback if unknown
          onClose();
          router.push(`/search-results?q=${encodeURIComponent(result.text)}` as any);
          break;
      }
    }, 1500); // 1.5s delay so the user can read the transcription and response message
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} onPress={onClose} />
        
        <View style={styles.sheetContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Trợ Lý Giọng Nói AI</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            {/* Status text */}
            <Text style={styles.statusText}>{statusText}</Text>

            {/* User transcription */}
            {transcription.length > 0 && (
              <View style={styles.bubbleContainerUser}>
                <View style={styles.userBubble}>
                  <Text style={styles.bubbleTextUser}>"{transcription}"</Text>
                </View>
              </View>
            )}

            {/* Assistant response */}
            {responseText.length > 0 && (
              <View style={styles.bubbleContainerAssistant}>
                <Ionicons name="sparkles" size={18} color="#F73658" style={styles.assistantIcon} />
                <View style={styles.assistantBubble}>
                  <Text style={styles.bubbleTextAssistant}>{responseText}</Text>
                </View>
              </View>
            )}

            {/* Recording Animation Waveform */}
            {isRecording && (
              <View style={styles.waveform}>
                {waveAnims.map((anim, i) => (
                  <Animated.View 
                    key={i} 
                    style={[
                      styles.waveBar, 
                      { height: anim }
                    ]} 
                  />
                ))}
              </View>
            )}

            {/* Loading processing indicator */}
            {loading && (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#F73658" />
              </View>
            )}

            {/* Mic trigger button */}
            <View style={styles.micWrapper}>
              {isRecording ? (
                <TouchableOpacity 
                  onPress={() => stopRecordingWorkflow(true)}
                  activeOpacity={0.8}
                >
                  <Animated.View 
                    style={[
                      styles.micRing, 
                      { transform: [{ scale: pulseAnim }] }
                    ]}
                  >
                    <View style={styles.micButtonActive}>
                      <Ionicons name="stop" size={36} color="white" />
                    </View>
                  </Animated.View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  onPress={startRecordingWorkflow}
                  style={styles.micButtonInactive}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  <MaterialCommunityIcons name="microphone" size={36} color="white" />
                </TouchableOpacity>
              )}
            </View>

            {/* Instructions */}
            <Text style={styles.instructionText}>
              {isRecording ? "Chạm vào nút đỏ để dừng và gửi câu lệnh" : "Nhấn nút để bắt đầu nói câu lệnh của bạn"}
            </Text>

            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 Bạn có thể nói:</Text>
              <Text style={styles.tipsText}>• "Tìm giày chạy bộ Nike dưới 2 triệu"</Text>
              <Text style={styles.tipsText}>• "Mở giỏ hàng của tôi"</Text>
              <Text style={styles.tipsText}>• "Đưa tôi đến ví ShopeePay"</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: height * 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Montserrat_700Bold',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingTop: 16,
  },
  statusText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 16,
    fontFamily: 'Montserrat_500Medium',
  },
  bubbleContainerUser: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: '#F73658',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomRightRadius: 2,
    maxWidth: '80%',
  },
  bubbleTextUser: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  bubbleContainerAssistant: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  assistantIcon: {
    marginTop: 8,
    marginRight: 8,
  },
  assistantBubble: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderTopLeftRadius: 2,
    maxWidth: '80%',
  },
  bubbleTextAssistant: {
    color: '#333333',
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
  },
  waveform: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 16,
  },
  waveBar: {
    width: 6,
    borderRadius: 3,
    backgroundColor: '#F73658',
  },
  loaderContainer: {
    marginVertical: 20,
  },
  micWrapper: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  micRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(247, 54, 88, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonActive: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F73658',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F73658',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  micButtonInactive: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1B1530',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1B1530',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  instructionText: {
    fontSize: 13,
    color: '#999',
    marginTop: 12,
    fontFamily: 'Montserrat_400Regular',
  },
  tipsContainer: {
    alignSelf: 'stretch',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    marginBottom: 6,
    fontFamily: 'Montserrat_700Bold',
  },
  tipsText: {
    fontSize: 12,
    color: '#777',
    lineHeight: 18,
    fontFamily: 'Montserrat_400Regular',
  },
});
