import { permissionsToArray } from './UserModel';

/**
 * Normalize a user/admin entity from any backend shape.
 */
export function normalizeUser(raw = {}) {
  const isActive =
    typeof raw.isActive === 'boolean'
      ? raw.isActive
      : typeof raw.is_active === 'boolean'
        ? raw.is_active
        : raw.status === 'active' || raw.status === 'enabled';

  let permissions = raw.permissions;
  if (permissions && !Array.isArray(permissions) && typeof permissions === 'object') {
    permissions = permissionsToArray(permissions);
  }

  const name =
    typeof raw.name === 'string'
      ? raw.name
      : raw.name?.en || raw.name?.ar || raw.fullName || raw.full_name || '';

  const roleRaw = raw.role ?? raw.userRole ?? raw.user_role;
  const role =
    typeof roleRaw === 'string' ? roleRaw.toLowerCase() : roleRaw?.name?.toLowerCase?.() || 'user';

  return {
    id: raw._id || raw.id,
    name,
    email: raw.email ?? '',
    role: role === 'admin' || role === 'superadmin' ? role : role || 'user',
    isActive: !!isActive,
    permissions: Array.isArray(permissions) ? permissions : [],
    createdAt: raw.createdAt ?? raw.created_at ?? null,
    updatedAt: raw.updatedAt ?? raw.updated_at ?? null,
  };
}

/**
 * Normalize paginated list response: { data, meta } or legacy shapes.
 */
export function normalizeUsersList(response) {
  const raw =
    response?.data ?? response?.users ?? response?.items ?? response ?? [];
  const rawItems = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.users)
        ? raw.users
        : Array.isArray(raw?.items)
          ? raw.items
          : [];
  const items = rawItems.map(normalizeUser);
  const meta = response?.meta ?? raw?.meta ?? {};
  return {
    items,
    total: meta.total ?? response?.total ?? raw?.total ?? items.length,
    page: meta.page ?? 1,
    limit: meta.limit ?? items.length,
    totalPages: meta.totalPages ?? 1,
  };
}

/**
 * Build POST /admin/users body from form values.
 */
export function toCreatePayload(form) {
  const payload = {
    name: form.name,
    email: form.email,
    password: form.password,
    role: form.role || 'user',
    is_active: form.isActive !== false,
  };

  if (form.role === 'admin' && form.permissions) {
    payload.permissions = Array.isArray(form.permissions)
      ? form.permissions
      : permissionsToArray(form.permissions);
  }

  return payload;
}

/**
 * Build PATCH /admin/users/:id body (omit empty password).
 * Non-superadmins must not send role / is_active — backend returns 403.
 */
export function toUpdatePayload(form, { includeRole = true } = {}) {
  const payload = {
    name: form.name,
    email: form.email,
  };

  if (includeRole && form.role) {
    payload.role = form.role;
  }

  if (form.password) {
    payload.password = form.password;
  }

  return payload;
}

/**
 * Map normalized user into React Hook Form defaults.
 */
export function toFormValues(user, permissionsMatrix) {
  return {
    name: user?.name ?? '',
    email: user?.email ?? '',
    role: user?.role ?? 'user',
    isActive: user?.isActive !== false,
    password: '',
    confirmPassword: '',
    permissions: permissionsMatrix,
  };
}
