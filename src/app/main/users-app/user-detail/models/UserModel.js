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
const PERMISSION_ACTIONS = ['view', 'create', 'edit', 'delete'];

export function buildDefaultPermissions(allTrue = false) {
  return Object.fromEntries(
    PERMISSION_RESOURCES.map((r) => [
      r,
      Object.fromEntries(PERMISSION_ACTIONS.map((a) => [a, allTrue])),
    ]),
  );
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
