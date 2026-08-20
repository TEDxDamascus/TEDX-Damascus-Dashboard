import { useMemo } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import {
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  Checkbox,
  Paper,
  Switch,
} from '@mui/material';
import { parsePermissionsCatalog } from '../../models/UserModel';

const ACTION_LABELS = { create: 'Create', read: 'Read', update: 'Update', delete: 'Delete' };

function PermissionsTable({ control, isDisabled, catalog }) {
  const { resources, actions } = useMemo(() => parsePermissionsCatalog(catalog), [catalog]);

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary' }}>
        Permissions
      </Typography>
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
                    minWidth: 120,
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
                <tr key={resource} style={{ backgroundColor: ri % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td
                    style={{
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#333',
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
                      <Controller
                        name={`permissions.${resource}.${action}`}
                        control={control}
                        defaultValue={false}
                        render={({ field }) => (
                          <Checkbox
                            checked={!!field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            disabled={isDisabled}
                            size="small"
                            sx={{
                              p: 0.5,
                              '&.Mui-checked': { color: 'var(--color-primary)' },
                            }}
                          />
                        )}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );
}

function BasicInfoTab({
  control,
  errors,
  isDisabled,
  isOwnAccount,
  isNew,
  catalog,
  lockRole = false,
  lockActiveStatus = false,
  showPermissions = true,
}) {
  const role = useWatch({ control, name: 'role' });

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Name"
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={isDisabled}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                fullWidth
                required
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isDisabled}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth required error={!!errors.role} disabled={isDisabled || lockRole}>
                <InputLabel>Role</InputLabel>
                <Select {...field} label="Role">
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    disabled={isDisabled || lockActiveStatus}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--color-primary)' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: 'var(--color-primary)',
                      },
                    }}
                  />
                }
                label={field.value ? 'Active' : 'Inactive'}
                sx={{ mt: 1 }}
              />
            )}
          />
        </Grid>

        {(isOwnAccount || lockActiveStatus || lockRole) && !isNew && (
          <Grid item xs={12}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: '#FFF3E0',
                border: '1px solid #FFB74D',
              }}
            >
              <Typography variant="body2" sx={{ color: '#E65100' }}>
                {isOwnAccount
                  ? 'You cannot change your own active status here.'
                  : 'Role, permissions, and active status can only be changed by a superadmin.'}
              </Typography>
            </Box>
          </Grid>
        )}

        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0 }}>
            {isNew ? 'Set Password' : 'Change Password'}
          </Typography>
          {!isNew && (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Leave blank to keep the current password.
            </Typography>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={isNew ? 'Password' : 'New Password'}
                type="password"
                fullWidth
                required={isNew}
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isDisabled}
                autoComplete="new-password"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Confirm Password"
                type="password"
                fullWidth
                required={isNew}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                disabled={isDisabled}
                autoComplete="new-password"
              />
            )}
          />
        </Grid>

        {showPermissions && role === 'admin' && (
          <Grid item xs={12}>
            <PermissionsTable control={control} isDisabled={isDisabled} catalog={catalog} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default BasicInfoTab;
