import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import InfoInput from '../common/InfoInput';

const { width } = Dimensions.get('window');

const ProfilePage = () => {
  const [profile, setProfile] = React.useState({
    name: 'Ân',
    gender: 'Nam',
    dob: '12/02/2005',
    phone: '0912345678',
    email: 'shinosuke@gmail.com',
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Profile Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={require('../../assets/images/homepage/icons/Ellipse 6.svg')} 
              style={styles.avatar} 
            />
            <TouchableOpacity style={styles.editAvatarBtn}>
              <MaterialCommunityIcons name="pencil" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <InfoInput 
            label="Tên" 
            value={profile.name} 
            onChangeText={(text) => setProfile({...profile, name: text})} 
          />
          <InfoInput 
            label="Giới tính" 
            value={profile.gender} 
            onChangeText={(text) => setProfile({...profile, gender: text})} 
          />
          <InfoInput 
            label="Ngày sinh" 
            value={profile.dob} 
            onChangeText={(text) => setProfile({...profile, dob: text})} 
          />
          <InfoInput 
            label="Số điện thoại" 
            value={profile.phone} 
            onChangeText={(text) => setProfile({...profile, phone: text})} 
          />
          <InfoInput 
            label="email" 
            value={profile.email} 
            onChangeText={(text) => setProfile({...profile, email: text})} 
          />
        </View>

        {/* Address Section */}
        <View style={styles.addressSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={18} color="black" />
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
          </View>
          
          <View style={styles.addressCards}>
            <View style={styles.addressCard}>
              <View style={styles.addressCardHeader}>
                <Text style={styles.addressLabel}>Mặc định :</Text>
                <TouchableOpacity>
                  <Feather name="edit" size={14} color="#676767" />
                </TouchableOpacity>
              </View>
              <Text style={styles.addressText}>
                Phường Linh Trung, Thành phố Thủ Đức, TP. HCM
              </Text>
            </View>

            <TouchableOpacity style={styles.addAddressCard}>
              <Ionicons name="add-circle-outline" size={32} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#000',
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    borderWidth: 1,
    borderColor: '#4392F9',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4392F9',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  form: {
    paddingHorizontal: 24,
  },
  addressSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#000',
  },
  addressCards: {
    flexDirection: 'row',
    gap: 12,
  },
  addressCard: {
    flex: 3,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  addressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    color: '#000',
  },
  addressText: {
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    color: '#000',
    lineHeight: 16,
  },
  addAddressCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    height: 80,
  },
  saveButton: {
    backgroundColor: '#F73658',
    marginHorizontal: 24,
    marginTop: 40,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
});

export default ProfilePage;
