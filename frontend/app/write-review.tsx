import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Platform, StatusBar, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { createReview } from '../lib/reviewApi';

const WriteReviewScreen = () => {
  const { productId: productIdRaw, orderId: orderIdRaw } = useLocalSearchParams<{ productId: string; orderId: string }>();
  const productId = parseInt(productIdRaw, 10);
  const orderId = parseInt(orderIdRaw, 10);
  const router = useRouter();
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn số sao đánh giá.');
      return;
    }

    if (!orderId || isNaN(orderId) || !productId || isNaN(productId)) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin sản phẩm hoặc đơn hàng. Vui lòng thử lại.');
      return;
    }

    try {
      setSubmitting(true);
      const result = await createReview({
        orderId,
        productId,
        rating,
        comment
      });

      Alert.alert('Thành công', 'Đánh giá của bạn đã được gửi!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Đã xảy ra lỗi khi gửi đánh giá.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Viết đánh giá</Text>
        <TouchableOpacity 
          style={styles.submitButtonHeader} 
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#F83758" />
          ) : (
            <Text style={styles.submitTextHeader}>Gửi</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Chất lượng sản phẩm</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((i) => (
              <TouchableOpacity key={i} onPress={() => setRating(i)}>
                <Ionicons
                  name={i <= rating ? "star" : "star-outline"}
                  size={40}
                  color={i <= rating ? "#F83758" : "#DDD"}
                  style={styles.starIcon}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingText}>
            {rating === 1 ? 'Tệ' : rating === 2 ? 'Không hài lòng' : rating === 3 ? 'Bình thường' : rating === 4 ? 'Hài lòng' : rating === 5 ? 'Tuyệt vời' : 'Vui lòng chọn'}
          </Text>
        </View>

        <View style={styles.commentSection}>
          <TextInput
            style={styles.textInput}
            placeholder="Hãy chia sẻ nhận xét của bạn về sản phẩm này nhé..."
            multiline
            numberOfLines={10}
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  submitButtonHeader: {
    padding: 4,
  },
  submitTextHeader: {
    color: '#F83758',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  starIcon: {
    marginHorizontal: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#F83758',
    fontWeight: '500',
  },
  commentSection: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
  },
  textInput: {
    height: 200,
    fontSize: 14,
    color: '#333',
  },
});

export default WriteReviewScreen;
