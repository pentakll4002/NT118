import { useState, useEffect, useCallback } from 'react';
import { sellerApi, SellerDashboardStats } from '../../../lib/sellerApi';

/**
 * Custom hook to manage seller dashboard data fetching and state
 */
export const useSellerDashboard = () => {
  const [stats, setStats] = useState<SellerDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      const data = await sellerApi.getDashboardStats();
      setStats(data);
    } catch (err: unknown) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Khong the tai du lieu dashboard. Vui long thu lai sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = useCallback(() => {
    fetchStats(true);
  }, [fetchStats]);

  return {
    stats,
    loading,
    refreshing,
    error,
    onRefresh,
    retry: fetchStats,
  };
};
