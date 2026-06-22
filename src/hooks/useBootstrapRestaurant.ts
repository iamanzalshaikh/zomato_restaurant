import { useQuery } from '@tanstack/react-query';
import { getMyRestaurant } from '@/services/restaurants';
import { useAuthStore } from '@/stores/authStore';
import { useRestaurantStore } from '@/stores/restaurantStore';

export function useBootstrapRestaurant() {
  const userId = useAuthStore((s) => s.user?._id);
  const { restaurant, setRestaurant } = useRestaurantStore();

  const q = useQuery({
    queryKey: ['owner-restaurant', userId],
    queryFn: async () => {
      const r = await getMyRestaurant();
      setRestaurant(r);
      return r;
    },
    enabled: Boolean(userId),
    retry: 1,
    staleTime: 0,
  });

  return {
    restaurant: q.data ?? restaurant ?? null,
    isLoading: q.isLoading,
    error: q.error,
  };
}
