import { useSelector } from 'react-redux';
import { selectUserRole, selectUserPermissions } from './store/userSlice';

export default function PermissionGate({ children, roles, permissions, fallback = null }) {
  const userRole = useSelector(selectUserRole);
  const userPermissions = useSelector(selectUserPermissions);

  const roleAllowed = !roles?.length || roles.includes(userRole);
  const permissionsAllowed =
    !permissions?.length || permissions.every((p) => userPermissions.includes(p));

  if (!roleAllowed || !permissionsAllowed) return fallback;

  return children;
}
