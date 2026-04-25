import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { userApi } from '@/lib/userApi';

export default function AdminLayout() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      try {
        const profile = await userApi.getProfile();
        if (profile.role === 'admin') {
          setIsAdmin(true);
        } else {
          console.log('Unauthorized: User is not an admin', profile.role);
          router.replace('/login');
        }
      } catch (error) {
        console.error('Admin check failed', error);
        router.replace('/login');
      }
    }
    checkAdmin();
  }, []);

  if (isAdmin === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <ActivityIndicator size="large" color="#4392F9" />
        <Text style={{ marginTop: 10, color: '#7f8c8d' }}>Đang xác thực quyền Admin...</Text>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4392F9',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#edf2f7',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Tổng quan',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Danh mục',
          tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="vouchers"
        options={{
          title: 'Voucher',
          tabBarIcon: ({ color, size }) => <Ionicons name="ticket-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Thiết lập',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="shops"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
