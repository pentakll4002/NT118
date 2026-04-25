import { useState, useEffect, useCallback } from 'react';
import { adminApi, AdminStatsDTO, AdminUserDTO, AdminShopDTO } from '@/lib/adminApi';

export function useAdminDashboard() {
  const [stats, setStats] = useState<AdminStatsDTO | null>(null);
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [shops, setShops] = useState<AdminShopDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [statsData, usersData, shopsData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getShops(),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setShops(shopsData);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu admin');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  return {
    stats,
    users,
    shops,
    loading,
    refreshing,
    error,
    onRefresh,
    retry: fetchData,
  };
}
