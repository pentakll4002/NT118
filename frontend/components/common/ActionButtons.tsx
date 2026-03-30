import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ActionButtonsProps {
  onAddToCart: () => void;
  onBuyNow: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onAddToCart, onBuyNow }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.buttonWrapper} onPress={onAddToCart}>
        <LinearGradient
          colors={['#4392F9', '#1E40AF']}
          style={styles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.iconCircle}>
            <Feather name="shopping-cart" size={20} color="white" />
          </View>
          <Text style={styles.buttonText}>Giỏ hàng</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonWrapper} onPress={onBuyNow}>
        <LinearGradient
          colors={['#6EE7B7', '#10B981']}
          style={styles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.iconCircle}>
            <MaterialIcons name="touch-app" size={20} color="white" />
          </View>
          <Text style={styles.buttonText}>Mua ngay</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 24,
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 22,
    paddingLeft: 4,
    paddingRight: 16,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
  },
});

export default ActionButtons;
