import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getProductReviews, ReviewDto } from '../../lib/reviewApi';

const ReviewListScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = parseInt(id, 10);
  const router = useRouter();

  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null); // null means "All"
  const [averageRating, setAverageRating] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await getProductReviews(productId, 1, 50); // Load more for this screen
      setReviews(res.reviews);
      setAverageRating(res.averageRating);
      setTotalCount(res.totalReviews);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = filterRating 
    ? reviews.filter(r => r.rating === filterRating)
    : reviews;

  const renderReviewItem = ({ item }: { item: ReviewDto }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerAvatar}>
          <Text style={styles.avatarText}>{item.reviewerName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>{item.reviewerName}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <Ionicons 
                key={i} 
                name={i <= item.rating ? "star" : "star-outline"} 
                size={12} 
                color="#FBC02D" 
              />
            ))}
          </View>
        </View>
        <Text style={styles.reviewDate}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
      {item.isVerified && (
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
          <Text style={styles.verifiedText}>Đã mua hàng</Text>
        </View>
      )}
    </View>
  );

  const FilterChip = ({ rating, label }: { rating: number | null, label: string }) => (
    <TouchableOpacity 
      style={[styles.filterChip, filterRating === rating && styles.activeFilterChip]}
      onPress={() => setFilterRating(rating)}
    >
      <Text style={[styles.filterChipText, filterRating === rating && styles.activeFilterChipText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá ({totalCount})</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.summarySection}>
        <View style={styles.ratingBig}>
          <Text style={styles.ratingNumber}>{averageRating.toFixed(1)}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <Ionicons 
                key={i} 
                name={i <= Math.round(averageRating) ? "star" : "star-outline"} 
                size={16} 
                color="#FBC02D" 
              />
            ))}
          </View>
          <Text style={styles.totalText}>{totalCount} đánh giá</Text>
        </View>
        
        <View style={styles.filtersContainer}>
          <FilterChip rating={null} label="Tất cả" />
          <FilterChip rating={5} label="5 sao" />
          <FilterChip rating={4} label="4 sao" />
          <FilterChip rating={3} label="3 sao" />
          <FilterChip rating={2} label="2 sao" />
          <FilterChip rating={1} label="1 sao" />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#F83758" />
        </View>
      ) : (
        <FlatList
          data={filteredReviews}
          renderItem={renderReviewItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbox-ellipses-outline" size={64} color="#DDD" />
              <Text style={styles.emptyText}>Chưa có đánh giá nào phù hợp.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  summarySection: {
    padding: 20,
    backgroundColor: '#FFF',
    marginBottom: 8,
  },
  ratingBig: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingNumber: {
    fontSize: 40,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  totalText: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  activeFilterChip: {
    backgroundColor: '#FFF0F0',
    borderColor: '#F83758',
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: '#F83758',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 20,
  },
  reviewCard: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#F83758',
    fontSize: 14,
    fontWeight: '700',
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 11,
    color: '#999',
  },
  reviewComment: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 10,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: '#999',
  },
});

export default ReviewListScreen;
