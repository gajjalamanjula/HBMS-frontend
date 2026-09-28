import { describe, expect, it } from 'vitest';
import {
  updateUserStatusInListData,
  updateUserStatusInPageData,
} from './useSuperAdminDashboard';

describe('useSuperAdminDashboard cache helpers', () => {
  it('updates a user status inside paginated user cache data', () => {
    const page = {
      content: [
        { id: '1', active: true },
        { id: '2', active: true },
      ],
      totalElements: 2,
    };

    const result = updateUserStatusInPageData(page, '2', false);

    expect(result.content[0].active).toBe(true);
    expect(result.content[1].active).toBe(false);
    expect(result.totalElements).toBe(2);
  });

  it('updates a user status inside owner list cache data', () => {
    const owners = [
      { id: 'owner-1', active: true },
      { id: 'owner-2', active: false },
    ];

    const result = updateUserStatusInListData(owners, 'owner-1', false);

    expect(result[0].active).toBe(false);
    expect(result[1].active).toBe(false);
  });
});
