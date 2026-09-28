import { useQuery } from '@tanstack/react-query';

import { authApi } from '../../auth/api/auth.api';
import { httpClient } from '../../../lib/axios/apiClient';

function unwrapBranchRows(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function getBranchId(branch = {}) {
  return String(branch.id ?? branch.branchId ?? branch.uuid ?? '').trim();
}

function normalizeManagerAssignedBranch(profile = {}, branch = null) {
  const branchId = String(profile.branchId ?? getBranchId(branch) ?? '').trim();
  if (!branchId) return null;

  if (branch && getBranchId(branch)) {
    return {
      ...branch,
      id: getBranchId(branch),
      branchId: getBranchId(branch),
    };
  }

  return {
    id: branchId,
    branchId,
    name: profile.branchName || 'Assigned branch',
    branchName: profile.branchName || 'Assigned branch',
  };
}

export function getAssignedBranchFromRows(profile = {}, rows = []) {
  const branchId = String(profile.branchId || '').trim();
  if (!branchId) return normalizeManagerAssignedBranch(profile, null);

  const matchedBranch = rows.find((row) => String(getBranchId(row)) === branchId);
  return normalizeManagerAssignedBranch(profile, matchedBranch || null);
}

export function useManagerBranch() {
  return useQuery({
    queryKey: ['manager-branch'],
    queryFn: async () => {
      const profile = await authApi.getCurrentUser();
      if (!profile?.branchId) return null;

      try {
        const response = await httpClient.get('/branches');
        const rows = unwrapBranchRows(response.data);
        return getAssignedBranchFromRows(profile, rows);
      } catch {
        return normalizeManagerAssignedBranch(profile, null);
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: true,
  });
}

export default useManagerBranch;
