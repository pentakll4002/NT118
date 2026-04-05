import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';

const PlaceOrder: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <Image 
            source={require('../../assets/images/place-order/icon/Vector 3.svg')} 
            style={styles.backIcon} 
            resizeMode="contain" 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh Toán</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Image 
            source={require('../../assets/images/place-order/icon/favorite.svg')} 
            style={styles.heartIcon} 
            resizeMode="contain" 
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Product Component */}
        <View style={styles.productContainer}>
          <View style={styles.productImageWrapper}>
            {/* Placeholder for product image */}
            <View style={styles.productImagePlaceholder} />
          </View>
          
          <View style={styles.productInfo}>
            <Text style={styles.productTitle}>Women's Casual Wear</Text>
            <Text style={styles.productSubtitle}>Checked Single-Breasted Blazer</Text>
            
            <View style={styles.dropdownsRow}>
              <TouchableOpacity style={styles.dropdownButton}>
                <Text style={styles.dropdownText}>Size <Text style={styles.dropdownBold}>42</Text></Text>
                <Image source={require('../../assets/images/place-order/icon/keyboard_arrow_down.svg')} style={styles.dropdownIcon} resizeMode="contain" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.dropdownButton}>
                <Text style={styles.dropdownText}>Qty <Text style={styles.dropdownBold}>1</Text></Text>
                <Image source={require('../../assets/images/place-order/icon/keyboard_arrow_down.svg')} style={styles.dropdownIcon} resizeMode="contain" />
              </TouchableOpacity>
            </View>

            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryLabel}>Delivery by </Text>
              <Text style={styles.deliveryValue}>10 May 2XXX</Text>
            </View>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Coupon Section */}
        <View style={styles.couponContainer}>
          <View style={styles.couponLeft}>
            <Image source={require('../../assets/images/place-order/icon/🦆 icon _coupon_.svg')} style={styles.couponIcon} resizeMode="contain" />
            <Text style={styles.couponText}>Mã giảm giá</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.selectText}>Chọn</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        {/* Order Details Header */}
        <Text style={styles.sectionTitle}>Chi tiết đơn hàng</Text>

        {/* Order Details Values */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Amounts</Text>
            <Text style={styles.detailValue}>₹ 7,000.00</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.convenienceLeft}>
              <Text style={styles.detailLabel}>Convenience</Text>
              <TouchableOpacity>
                <Text style={styles.actionTextSmall}>Know More</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity>
              <Text style={styles.actionText}>Apply Coupon</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Delivery Fee</Text>
            <Text style={styles.actionText}>Free</Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Total Order Section */}
        <View style={styles.totalSection}>
          <View style={styles.detailRow}>
            <Text style={styles.totalTitle}>Tổng đơn hàng</Text>
            <Text style={styles.totalValue}>₹ 7,000.00</Text>
          </View>
          <View style={styles.emiRow}>
            <Text style={styles.detailLabel}>EMI Available</Text>
            <TouchableOpacity>
              <Text style={styles.actionTextSmall}>Details</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Extra spacing for scroll padding */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Floating Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarLeft}>
          <Text style={styles.bottomTotalValue}>₹ 7,000.00</Text>
          <TouchableOpacity>
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.checkoutButton}>
          <Text style={styles.checkoutButtonText}>Tiến hành thanh toán</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 10,
    height: 18,
  },
  heartIcon: {
    width: 22,
    height: 18,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // padding for bottom bar
  },
  productContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 24,
  },
  productImageWrapper: {
    width: 100,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
  },
  productImagePlaceholder: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  productSubtitle: {
    fontSize: 12,
    color: '#555555',
    marginBottom: 12,
    lineHeight: 18,
  },
  dropdownsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  dropdownText: {
    fontSize: 12,
    color: '#333333',
    marginRight: 4,
  },
  dropdownBold: {
    fontWeight: '600',
    color: '#000000',
  },
  dropdownIcon: {
    width: 10,
    height: 5,
    marginLeft: 4,
  },
  deliveryRow: {
    flexDirection: 'row',
  },
  deliveryLabel: {
    fontSize: 12,
    color: '#555555',
  },
  deliveryValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  separator: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 20,
  },
  couponContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  couponLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  couponText: {
    fontSize: 16,
    color: '#000000',
  },
  selectText: {
    fontSize: 14,
    color: '#F83758',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#333333',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  convenienceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionTextSmall: {
    fontSize: 12,
    color: '#F83758',
    fontWeight: '500',
  },
  actionText: {
    fontSize: 14,
    color: '#F83758',
    fontWeight: '500',
  },
  totalSection: {
    
  },
  totalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  emiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // safe area padding
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    borderColor: '#EEEEEE',
    borderTopWidth: 1,
  },
  bottomBarLeft: {
    flexDirection: 'column',
  },
  bottomTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#F83758',
    fontWeight: '600',
  },
  checkoutButton: {
    backgroundColor: '#F83758',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PlaceOrder;
