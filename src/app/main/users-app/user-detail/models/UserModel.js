const PERMISSION_RESOURCES = [
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
const PERMISSION_ACTIONS = ['create', 'read', 'update', 'delete'];

export function buildDefaultPermissions(allTrue = false) {
  return Object.fromEntries(
    PERMISSION_RESOURCES.map((r) => [
      r,
      Object.fromEntries(PERMISSION_ACTIONS.map((a) => [a, allTrue])),
    ]),
  );
}

export function permissionsToArray(permissions) {
  return Object.entries(permissions ?? {}).flatMap(([resource, actions]) =>
    Object.entries(actions ?? {})
      .filter(([, granted]) => granted)
      .map(([action]) => `${resource}:${action}`),
  );
}

export function permissionsFromArray(permissionsArray) {
  const permissions = buildDefaultPermissions(false);
  (permissionsArray ?? []).forEach((entry) => {
    const [resource, action] = String(entry).split(':');
    if (permissions[resource] && action in permissions[resource]) {
      permissions[resource][action] = true;
    }
  });
  return permissions;
}

export { PERMISSION_RESOURCES, PERMISSION_ACTIONS };

const UserModel = {
  name: '',
  email: '',
  role: 'admin',
  status: 'active',
  permissions: buildDefaultPermissions(false),
};

export default UserModel;
