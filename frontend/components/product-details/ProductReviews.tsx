import React from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReviewDto } from '../../lib/reviewApi';

interface ProductReviewsProps {
  productId: number;
  rating: number;
  reviews: ReviewDto[];
  onWriteReview?: () => void;
  canReview?: boolean;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, rating, reviews, onWriteReview, canReview }) => {
  const router = useRouter();
  return (
    <View style={styles.reviewsSection}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.detailsTitle}>Đánh giá sản phẩm</Text>
        {canReview && (
          <TouchableOpacity onPress={onWriteReview}>
            <Text style={styles.viewAllTextRed}>Viết đánh giá</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.ratingSummary}>
        <View style={styles.ratingBig}>
          <Text style={styles.ratingBigText}>{rating.toFixed(1)}</Text>
          <Text style={styles.ratingMaxText}>/5</Text>
        </View>
        <View style={styles.ratingStarsCol}>
          <View style={{ flexDirection: 'row' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <Ionicons 
                key={i} 
                name={i <= Math.round(rating) ? "star" : "star-outline"} 
                size={16} 
                color="#FBC02D" 
              />
            ))}
          </View>
          <Text style={styles.totalReviewsText}>{reviews.length} đánh giá</Text>
        </View>
      </View>

      {reviews.slice(0, 3).map((review) => (
        <View key={review.id} style={styles.reviewItem}>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewerAvatar}>
              <Text style={styles.avatarText}>{review.reviewerName.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.reviewerName}>{review.reviewerName}</Text>
              <View style={{ flexDirection: 'row' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Ionicons 
                    key={i} 
                    name={i <= review.rating ? "star" : "star-outline"} 
                    size={10} 
                    color="#FBC02D" 
                  />
                ))}
              </View>
            </View>
          </View>
          <Text style={styles.reviewComment}>{review.comment}</Text>
          <Text style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</Text>
        </View>
      ))}

      {reviews.length > 0 && (
        <TouchableOpacity 
          style={styles.viewMoreButton}
          onPress={() => router.push({ pathname: '/product/reviews', params: { id: productId } })}
        >
          <Text style={styles.viewMoreText}>Xem tất cả đánh giá ({reviews.length})</Text>
        </TouchableOpacity>
      )}
      
      {reviews.length === 0 && (
        <Text style={styles.noReviews}>Chưa có đánh giá nào.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  reviewsSection: {
    padding: 20,
    backgroundColor: '#FFF',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllTextRed: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F83758',
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  ratingBig: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 20,
  },
  ratingBigText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F83758',
  },
  ratingMaxText: {
    fontSize: 14,
    color: '#999',
  },
  ratingStarsCol: {
    flex: 1,
  },
  totalReviewsText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  reviewItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  reviewComment: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginVertical: 6,
  },
  reviewDate: {
    fontSize: 11,
    color: '#999',
  },
  viewMoreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F83758',
  },
  noReviews: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 10,
  },
});

export default ProductReviews;
