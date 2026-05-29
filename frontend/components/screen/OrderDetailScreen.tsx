import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getOrderDetail, OrderDetailResponse, formatOrderStatus, formatPaymentStatus, formatPaymentMethod, formatPriceFull } from '../../lib/orderApi';
import { getReturnRequest, ReturnRequestDTO } from '../../lib/returnApi';

const SC: Record<string,string> = { pending:'#F59E0B', confirmed:'#3B82F6', shipping:'#F97316', delivered:'#10B981', cancelled:'#EF4444' };
const PC: Record<string,string> = { pending:'#F59E0B', paid:'#10B981', failed:'#EF4444' };

export default function OrderDetailScreen({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [data, setData] = useState<OrderDetailResponse|null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|null>(null);
  const [returnReq, setReturnReq] = useState<ReturnRequestDTO|null>(null);

  useEffect(() => {
    (async () => { 
      try { 
        setLoading(true); 
        setData(await getOrderDetail(orderId));
        try {
          setReturnReq(await getReturnRequest(orderId));
        } catch(e) {} // ignore if no return request
      } catch(e:any) { 
        setErr(e.message); 
      } finally { 
        setLoading(false); 
      } 
    })();
  }, [orderId]);

  if (loading) return <SafeAreaView style={s.container}><View style={s.header}><TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#1E293B" /></TouchableOpacity><Text style={s.headerTitle}>Chi tiết đơn hàng</Text><View style={{width:32}}/></View><View style={s.center}><ActivityIndicator size="large" color="#FF4747"/></View></SafeAreaView>;
  if (err||!data) return <SafeAreaView style={s.container}><View style={s.header}><TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#1E293B" /></TouchableOpacity><Text style={s.headerTitle}>Chi tiết đơn hàng</Text><View style={{width:32}}/></View><View style={s.center}><Text style={{color:'#EF4444'}}>{err||'Không tìm thấy đơn hàng'}</Text></View></SafeAreaView>;

  const { order, items } = data;
  const sc = SC[order.status.toLowerCase()]||'#64748B';
  const pc = PC[order.paymentStatus.toLowerCase()]||'#64748B';

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#1E293B"/></TouchableOpacity>
        <Text style={s.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={{width:32}}/>
      </View>
      <ScrollView contentContainerStyle={{paddingBottom:24}}>
        {/* Status */}
        <View style={[s.card, {borderLeftColor:sc, borderLeftWidth:4}]}>
          <View style={{flexDirection:'row',alignItems:'center'}}>
            <Feather name="box" size={24} color={sc}/>
            <View style={{marginLeft:12}}>
              <Text style={{fontSize:16,fontWeight:'700',color:sc}}>{formatOrderStatus(order.status)}</Text>
              <Text style={{fontSize:13,color:'#64748B'}}>#{order.orderNumber}</Text>
            </View>
          </View>
          <Text style={{fontSize:12,color:'#94A3B8'}}>{new Date(order.orderedAt).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}</Text>
        </View>
        {/* Payment */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Thanh toán</Text>
          <View style={s.row}><Text style={s.lbl}>Phương thức</Text><Text style={s.val}>{formatPaymentMethod(order.paymentMethod)}</Text></View>
          <View style={s.row}><Text style={s.lbl}>Trạng thái</Text><View style={{backgroundColor:pc+'18',paddingHorizontal:10,paddingVertical:4,borderRadius:12}}><Text style={{fontSize:12,fontWeight:'600',color:pc}}>{formatPaymentStatus(order.paymentStatus)}</Text></View></View>
        </View>
        {/* Items */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Sản phẩm ({items.length})</Text>
          {items.map(it => (
            <View key={it.id} style={{flexDirection:'row',alignItems:'center',paddingVertical:8,borderBottomWidth:1,borderBottomColor:'#F1F5F9'}}>
              {it.productImage ? <Image source={{uri:it.productImage}} style={{width:52,height:52,borderRadius:8,marginRight:12}}/> : <View style={{width:52,height:52,borderRadius:8,backgroundColor:'#F1F5F9',alignItems:'center',justifyContent:'center',marginRight:12}}><Feather name="image" size={20} color="#CBD5E1"/></View>}
              <View style={{flex:1}}><Text style={{fontSize:14,fontWeight:'500',color:'#1E293B'}} numberOfLines={2}>{it.productName}</Text><Text style={{fontSize:12,color:'#94A3B8'}}>SL: {it.quantity}</Text></View>
              <View style={{alignItems:'flex-end'}}>
                <Text style={{fontSize:14,fontWeight:'600',color:'#FF4747'}}>{formatPriceFull(it.totalPrice)}</Text>
                {order.status.toLowerCase() === 'delivered' && (
                  <TouchableOpacity 
                    style={s.reviewBtn}
                    onPress={() => router.push({
                      pathname: '/write-review',
                      params: { productId: it.productId, orderId: order.id }
                    })}
                  >
                    <Text style={s.reviewBtnText}>Đánh giá</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
        {/* Price */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Chi tiết giá</Text>
          <View style={s.row}><Text style={s.lbl}>Tạm tính</Text><Text style={s.val}>{formatPriceFull(order.subtotal)}</Text></View>
          <View style={s.row}><Text style={s.lbl}>Phí vận chuyển</Text><Text style={s.val}>{order.shippingFee===0?'Miễn phí':formatPriceFull(order.shippingFee)}</Text></View>
          {order.discountAmount>0 && <View style={s.row}><Text style={s.lbl}>Giảm giá</Text><Text style={[s.val,{color:'#10B981'}]}>-{formatPriceFull(order.discountAmount)}</Text></View>}
          <View style={[s.row,{borderTopWidth:1,borderTopColor:'#E2E8F0',marginTop:8,paddingTop:12}]}>
            <Text style={{fontSize:16,fontWeight:'700',color:'#1E293B'}}>Tổng thanh toán</Text>
            <Text style={{fontSize:18,fontWeight:'700',color:'#FF4747'}}>{formatPriceFull(order.totalAmount)}</Text>
          </View>
        </View>
        {order.notes && <View style={s.card}><Text style={s.cardTitle}>Ghi chú</Text><Text style={{fontSize:14,color:'#475569'}}>{order.notes}</Text></View>}
        
        {/* Actions */}
        {order.status.toLowerCase() === 'delivered' && (
          <View style={s.actionsContainer}>
            {!returnReq ? (
              <TouchableOpacity 
                style={[s.actionButton, s.secondaryButton]} 
                onPress={() => router.push(`/return-request?orderId=${order.id}` as any)}
              >
                <Text style={[s.actionButtonText, { color: '#FF4747' }]}>Trả hàng / Hoàn tiền</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[s.actionButton, s.secondaryButton]} 
                onPress={() => router.push(`/return-status?orderId=${order.id}` as any)}
              >
                <Text style={[s.actionButtonText, { color: '#F59E0B' }]}>Xem trạng thái Trả hàng</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#F5F5F5'},
  header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:14,backgroundColor:'#FFF',borderBottomWidth:1,borderBottomColor:'#E2E8F0'},
  headerTitle:{fontSize:18,fontWeight:'700',color:'#1E293B'},
  center:{flex:1,alignItems:'center',justifyContent:'center'},
  card:{backgroundColor:'#FFF',marginHorizontal:16,marginTop:12,borderRadius:12,padding:16},
  cardTitle:{fontSize:15,fontWeight:'700',color:'#1E293B',marginBottom:12},
  row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:6},
  lbl:{fontSize:14,color:'#64748B'},
  val:{fontSize:14,fontWeight:'500',color:'#1E293B'},
  reviewBtn: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FF4747',
  },
  reviewBtnText: {
    fontSize: 12,
    color: '#FF4747',
    fontWeight: '600',
  },
  actionsContainer: {
    padding: 16,
    marginTop: 8,
  },
  actionButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: '#FFF',
  },
  secondaryButton: {
    borderColor: '#E2E8F0',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
