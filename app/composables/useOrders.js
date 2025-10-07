/**
 * Composable to fetch and share banner orders across components
 * This prevents multiple API calls to the same endpoint
 */
export const useOrders = () => {
  // Use useAsyncData to fetch once and cache on both server and client
  const { data: ordersData, error, pending } = useAsyncData(
    'banner-orders',
    async () => {
      const { fetchOrders } = await import('@/services/api');
      const response = await fetchOrders();
      return response.success ? response.result.orders.data : [];
    },
    {
      // Cache for 5 minutes
      getCachedData: (key) => useNuxtApp().payload.data[key],
    }
  );

  // Filter functions for different banner types
  const getLeaderboardBanners = computed(() => {
    return ordersData.value?.filter(
      (order) => order.format === 'web_large_leaderboard' && order.status === 1
    ) || [];
  });

  const getSquareBanners = computed(() => {
    return ordersData.value?.filter(
      (order) => order.format === 'web_square' && order.status === 1
    ) || [];
  });

  const getSkyscraperBanners = computed(() => {
    return ordersData.value?.filter(
      (order) => order.format === 'web_skyscraper' && order.status === 1
    ) || [];
  });

  return {
    ordersData,
    error,
    pending,
    leaderboardBanners: getLeaderboardBanners,
    squareBanners: getSquareBanners,
    skyscraperBanners: getSkyscraperBanners,
  };
};
