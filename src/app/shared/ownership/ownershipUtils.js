/**
 * Ownership scoping helpers.
 * superadmin → full access; admin → only own records.
 */

export function isSuperAdmin(user) {
  return user?.role === 'superadmin';
}

export function isAdminRole(user) {
  return user?.role === 'admin';
}

/** Prefer JWT/Redux user id (sub). */
export function getCurrentUserId(user) {
  if (!user) return null;
  const id = user.id ?? user._id ?? user.sub;
  return id != null && id !== '' ? String(id) : null;
}

/** Whether this user should have ownership filters applied. */
export function needsOwnershipScope(user) {
  return isAdminRole(user) && !isSuperAdmin(user);
}

/**
 * Extract possible owner ids from a record (API shapes vary).
 */
export function getRecordOwnerIds(record) {
  if (!record || typeof record !== 'object') return [];

  const candidates = [
    record.created_by,
    record.createdBy,
    record.created_by_id,
    record.createdById,
    record.user_id,
    record.userId,
    record.author_user_id,
    record.authorUserId,
    record.owner_id,
    record.ownerId,
    record.owner,
    record.author_admin?.id,
    record.author_admin?._id,
    record.created_by?.id,
    record.created_by?._id,
    record.createdBy?.id,
    record.user?.id,
    record.user?._id,
    record.author?.id,
    record.author?._id,
  ];

  return candidates
    .filter((v) => v != null && v !== '')
    .map((v) => String(typeof v === 'object' ? v.id || v._id || '' : v))
    .filter(Boolean);
}

export function ownsRecord(record, userId) {
  if (!userId) return false;
  const owners = getRecordOwnerIds(record);
  if (!owners.length) return false;
  return owners.some((id) => id === String(userId));
}

/**
 * Can the current user manage (edit/delete) this record?
 * - superadmin: yes
 * - admin: only if ownsRecord
 * - if no owner fields on record: allow (backend will enforce) unless strict=true
 */
export function canManageRecord(record, user, { strict = false } = {}) {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  if (!needsOwnershipScope(user)) return true;

  const userId = getCurrentUserId(user);
  const owners = getRecordOwnerIds(record);
  if (!owners.length) return !strict;
  return ownsRecord(record, userId);
}

/**
 * Add owner query params for admin-scoped list requests.
 * Sends common param names so backend can accept whichever it supports.
 */
export function withOwnerQueryParams(params = {}, user) {
  if (!needsOwnershipScope(user)) return { ...params };

  const userId = getCurrentUserId(user);
  if (!userId) return { ...params };

  return {
    ...params,
    created_by: userId,
    author_user_id: userId,
  };
}

/**
 * Client-side fallback filter when API ignores owner params.
 * If items have no owner fields at all, returns items unchanged (cannot filter safely).
 */
export function filterOwnedRecords(items, user) {
  if (!needsOwnershipScope(user)) return items ?? [];
  const list = Array.isArray(items) ? items : [];
  const userId = getCurrentUserId(user);
  if (!userId) return [];

  const anyHasOwner = list.some((item) => getRecordOwnerIds(item).length > 0);
  if (!anyHasOwner) return list;

  return list.filter((item) => ownsRecord(item, userId));
}
