import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface HeaderProps {
  onMenuPress?: () => void;
  onProfilePress?: () => void;
  logoText?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  onMenuPress, 
  onProfilePress, 
  logoText = "ShopeeLite" 
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
        <View style={styles.menuIconLine} />
        <View style={[styles.menuIconLine, { width: 15 }]} />
        <View style={styles.menuIconLine} />
      </TouchableOpacity>
      
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/homepage/icons/Component 1.svg')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>{logoText}</Text>
      </View>

      <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
        <Image 
          source={require('../../assets/images/homepage/icons/Ellipse 6.svg')} 
          style={styles.profileImage}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#F9F9F9',
  },
  menuButton: {
    width: 32,
    height: 32,
    backgroundColor: '#EEEEEE',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  menuIconLine: {
    width: 18,
    height: 2,
    backgroundColor: '#333',
    borderRadius: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4392F9',
    fontFamily: 'Montserrat_700Bold',
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
});

export default Header;
