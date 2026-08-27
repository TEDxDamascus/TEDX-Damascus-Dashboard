import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Typography,
  Checkbox,
  Paper,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import {
  useGetAvailablePermissionsQuery,
  useGetUserPermissionsQuery,
  useUpdateUserPermissionsMutation,
} from '../UsersApi';
import {
  buildDefaultPermissions,
  permissionsFromArray,
  permissionsToArray,
  parsePermissionsCatalog,
} from '../models/UserModel';

const ACTION_LABELS = { create: 'Create', read: 'Read', update: 'Update', delete: 'Delete' };

function PermissionsDialog({ open, user, onClose }) {
  const { enqueueSnackbar } = useSnackbar();
  const userId = user?.id;
  const { data: catalog, isLoading: isLoadingCatalog } = useGetAvailablePermissionsQuery(undefined, {
    skip: !open,
  });
  const { data: currentPermissions, isLoading: isLoadingPerms } = useGetUserPermissionsQuery(
    userId,
    { skip: !open || !userId },
  );
  const [updatePermissions, { isLoading: isSaving }] = useUpdateUserPermissionsMutation();

  const { resources, actions } = useMemo(() => parsePermissionsCatalog(catalog), [catalog]);
  const [matrix, setMatrix] = useState(() => buildDefaultPermissions(false));

  useEffect(() => {
    if (!open) return;
    const next = permissionsFromArray(
      Array.isArray(currentPermissions) ? currentPermissions : [],
      catalog,
    );
    setMatrix(next);
  }, [open, currentPermissions, catalog]);

  const toggle = (resource, action) => {
    setMatrix((prev) => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [action]: !prev[resource]?.[action],
      },
    }));
  };

  const handleSave = async () => {
    try {
      await updatePermissions({
        id: userId,
        permissions: permissionsToArray(matrix),
      }).unwrap();
      enqueueSnackbar('Permissions updated successfully', { variant: 'success' });
      onClose();
    } catch (error) {
      enqueueSnackbar(error?.data?.message ?? error?.message ?? 'Failed to update permissions', { variant: 'error' });
    }
  };

  const isLoading = isLoadingCatalog || isLoadingPerms;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit Permissions
        {user?.name || user?.email ? (
          <Typography variant="body2" color="text.secondary">
            {user.name || user.email}
          </Typography>
        ) : null}
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 1.5 }}>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fafafa' }}>
                    <th
                      style={{
                        padding: '10px 16px',
                        textAlign: 'left',
                        fontWeight: 600,
                        fontSize: 13,
                        color: '#555',
                        borderBottom: '1px solid #e0e0e0',
                      }}
                    >
                      Resource
                    </th>
                    {actions.map((action) => (
                      <th
                        key={action}
                        style={{
                          padding: '10px 16px',
                          textAlign: 'center',
                          fontWeight: 600,
                          fontSize: 13,
                          color: '#555',
                          borderBottom: '1px solid #e0e0e0',
                        }}
                      >
                        {ACTION_LABELS[action] || action}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resources.map((resource, ri) => (
                    <tr
                      key={resource}
                      style={{ backgroundColor: ri % 2 === 0 ? '#fff' : '#fafafa' }}
                    >
                      <td
                        style={{
                          padding: '8px 16px',
                          fontSize: 13,
                          fontWeight: 500,
                          borderBottom: '1px solid #f0f0f0',
                          textTransform: 'capitalize',
                        }}
                      >
                        {resource.replace(/-/g, ' ')}
                      </td>
                      {actions.map((action) => (
                        <td
                          key={action}
                          style={{
                            padding: '8px 16px',
                            textAlign: 'center',
                            borderBottom: '1px solid #f0f0f0',
                          }}
                        >
                          <Checkbox
                            checked={!!matrix?.[resource]?.[action]}
                            onChange={() => toggle(resource, action)}
                            size="small"
                            sx={{ p: 0.5, '&.Mui-checked': { color: 'var(--color-primary)' } }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isLoading || isSaving}
          sx={{
            backgroundColor: 'var(--color-primary)',
            '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
          }}
        >
          {isSaving ? 'Saving...' : 'Save Permissions'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PermissionsDialog;
