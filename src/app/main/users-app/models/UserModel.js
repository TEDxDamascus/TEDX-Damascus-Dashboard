const FALLBACK_PERMISSION_RESOURCES = [
  'blogs',
  'users',
  'speakers',
  'forms',
  'events',
  'files',
  'images',
  'volunteer',
  'partner',
  'general-settings',
  'wall',
];
const FALLBACK_PERMISSION_ACTIONS = ['create', 'read', 'update', 'delete'];

/**
 * Parse permissions catalog from API.
 * Accepts: string[] like "blogs:create", or { resources, actions }, or { blogs: ['create'] }.
 */
export function parsePermissionsCatalog(catalog) {
  if (!catalog) {
    return {
      resources: FALLBACK_PERMISSION_RESOURCES,
      actions: FALLBACK_PERMISSION_ACTIONS,
    };
  }

  if (Array.isArray(catalog)) {
    const resources = new Set();
    const actions = new Set();
    catalog.forEach((entry) => {
      if (typeof entry === 'string' && entry.includes(':')) {
        const [resource, action] = entry.split(':');
        if (resource) resources.add(resource);
        if (action) actions.add(action);
      } else if (typeof entry === 'string') {
        resources.add(entry);
      }
    });
    return {
      resources: resources.size ? [...resources] : FALLBACK_PERMISSION_RESOURCES,
      actions: actions.size ? [...actions] : FALLBACK_PERMISSION_ACTIONS,
    };
  }

  if (catalog.resources && catalog.actions) {
    return {
      resources: catalog.resources,
      actions: catalog.actions,
    };
  }

  if (typeof catalog === 'object') {
    const resources = Object.keys(catalog);
    const actions = new Set();
    resources.forEach((r) => {
      const vals = catalog[r];
      if (Array.isArray(vals)) vals.forEach((a) => actions.add(a));
      else if (vals && typeof vals === 'object') Object.keys(vals).forEach((a) => actions.add(a));
    });
    return {
      resources: resources.length ? resources : FALLBACK_PERMISSION_RESOURCES,
      actions: actions.size ? [...actions] : FALLBACK_PERMISSION_ACTIONS,
    };
  }

  return {
    resources: FALLBACK_PERMISSION_RESOURCES,
    actions: FALLBACK_PERMISSION_ACTIONS,
  };
}

export function buildDefaultPermissions(allTrue = false, catalog) {
  const { resources, actions } = parsePermissionsCatalog(catalog);
  return Object.fromEntries(
    resources.map((r) => [r, Object.fromEntries(actions.map((a) => [a, allTrue]))]),
  );
}

export function permissionsToArray(permissions) {
  return Object.entries(permissions ?? {}).flatMap(([resource, actions]) =>
    Object.entries(actions ?? {})
      .filter(([, granted]) => granted)
      .map(([action]) => `${resource}:${action}`),
  );
}

export function permissionsFromArray(permissionsArray, catalog) {
  const permissions = buildDefaultPermissions(false, catalog);
  (permissionsArray ?? []).forEach((entry) => {
    const [resource, action] = String(entry).split(':');
    if (permissions[resource] && action in permissions[resource]) {
      permissions[resource][action] = true;
    }
  });
  return permissions;
}

export const PERMISSION_RESOURCES = FALLBACK_PERMISSION_RESOURCES;
export const PERMISSION_ACTIONS = FALLBACK_PERMISSION_ACTIONS;

const UserModel = {
  name: '',
  email: '',
  role: 'admin',
  isActive: true,
  permissions: buildDefaultPermissions(false),
};

export default UserModel;
