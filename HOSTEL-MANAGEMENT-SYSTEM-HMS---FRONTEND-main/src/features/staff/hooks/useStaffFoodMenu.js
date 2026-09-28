import { useQuery } from '@tanstack/react-query';
import staffApi from '../api/staff.api';
import { useStaffProfile } from './useStaffProfile';

export const staffFoodMenuKeys = {
  all: ['staff', 'food-menu'],
  current: () => [...staffFoodMenuKeys.all, 'current'],
  history: () => [...staffFoodMenuKeys.all, 'history'],
};

export function useStaffFoodMenu() {
  const staffQuery = useStaffProfile();

  const currentQuery = useQuery({
    queryKey: staffFoodMenuKeys.current(),
    queryFn: staffApi.getCurrentFoodMenu,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const historyQuery = useQuery({
    queryKey: staffFoodMenuKeys.history(),
    queryFn: staffApi.getFoodMenuHistory,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    staff: staffQuery.data || {},
    currentMenu: currentQuery.data || null,
    history: historyQuery.data || [],
    queries: {
      staff: staffQuery,
      current: currentQuery,
      history: historyQuery,
    },
    isLoading: staffQuery.isLoading || currentQuery.isLoading || historyQuery.isLoading,
    refetchAll: () => {
      staffQuery.refetch();
      currentQuery.refetch();
      historyQuery.refetch();
    },
  };
}

export default useStaffFoodMenu;
