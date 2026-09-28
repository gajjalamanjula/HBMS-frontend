import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '../../auth/hooks/useAuth';
import foodMenuApi from '../../foodMenu/api/foodMenu.api';
import { normalizeFoodMenu, normalizeTenantUser } from '../utils/tenantMappers';

export const tenantFoodMenuKeys = {
  all: ['tenant', 'food-menu'],
  me: () => [...tenantFoodMenuKeys.all, 'me'],
  current: () => [...tenantFoodMenuKeys.all, 'current'],
  history: () => [...tenantFoodMenuKeys.all, 'history'],
};

const normalizeFoodMenuHistory = (items = []) =>
  Array.isArray(items)
    ? items.map(normalizeFoodMenu).filter((item) => item.hasData)
    : [];

export function useTenantFoodMenu() {
  const currentUserQuery = useCurrentUser();
  const meQuery = {
    ...currentUserQuery,
    data: normalizeTenantUser(currentUserQuery.data || {}),
  };

  const currentQuery = useQuery({
    queryKey: tenantFoodMenuKeys.current(),
    queryFn: foodMenuApi.getCurrent,
    select: normalizeFoodMenu,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const historyQuery = useQuery({
    queryKey: tenantFoodMenuKeys.history(),
    queryFn: foodMenuApi.getHistory,
    select: normalizeFoodMenuHistory,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    tenant: meQuery.data || {},
    currentMenu: currentQuery.data || null,
    history: historyQuery.data || [],

    queries: {
      me: meQuery,
      current: currentQuery,
      history: historyQuery,
    },

    isLoading: meQuery.isLoading || currentQuery.isLoading || historyQuery.isLoading,

    refetchAll: () => {
      meQuery.refetch();
      currentQuery.refetch();
      historyQuery.refetch();
    },
  };
}

export default useTenantFoodMenu;
