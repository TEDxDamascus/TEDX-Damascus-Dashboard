import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../auth/store/userSlice';
import {
  canManageRecord,
  filterOwnedRecords,
  getCurrentUserId,
  isSuperAdmin,
  needsOwnershipScope,
  ownsRecord,
  withOwnerQueryParams,
} from './ownershipUtils';

/**
 * Hook for ownership scoping in list/detail screens.
 */
export function useOwnershipScope() {
  const user = useSelector(selectUser);

  return useMemo(() => {
    const userId = getCurrentUserId(user);
    const scoped = needsOwnershipScope(user);

    return {
      user,
      userId,
      isSuperAdmin: isSuperAdmin(user),
      needsOwnershipScope: scoped,
      withOwnerParams: (params) => withOwnerQueryParams(params, user),
      filterOwned: (items) => filterOwnedRecords(items, user),
      owns: (record) => ownsRecord(record, userId),
      canManage: (record, options) => canManageRecord(record, user, options),
    };
  }, [user]);
}

export {
  canManageRecord,
  filterOwnedRecords,
  getCurrentUserId,
  isSuperAdmin,
  needsOwnershipScope,
  ownsRecord,
  withOwnerQueryParams,
} from './ownershipUtils';
