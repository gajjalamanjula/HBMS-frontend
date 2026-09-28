import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superAdminKeys } from '../../../lib/query/queryKeys';
import { superadminApi } from '../api/superadminApi';

export function useSuperAdminOwners() {
  const [search, setSearch] = useState('');

  const ownersQuery = useQuery({
    queryKey: superAdminKeys.owners(),
    queryFn: superadminApi.getOwners,
    staleTime: 1000 * 60 * 2,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const owners = ownersQuery.data || [];

  const filteredOwners = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return owners;

    return owners.filter((owner) =>
      [owner.name, owner.email, owner.phone, owner.branchName, owner.branchId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [owners, search]);

  const summary = useMemo(
    () => ({
      total: owners.length,
      active: owners.filter((owner) => owner.active).length,
      inactive: owners.filter((owner) => !owner.active).length,
      verified: owners.filter((owner) => owner.verified).length,
    }),
    [owners]
  );

  return {
    search,
    setSearch,
    owners,
    filteredOwners,
    summary,
    ownersQuery,
    refetch: ownersQuery.refetch,
  };
}

export default useSuperAdminOwners;
