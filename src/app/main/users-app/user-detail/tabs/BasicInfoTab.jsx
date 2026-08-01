import { Controller } from 'react-hook-form';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  Checkbox,
  Paper,
} from '@mui/material';
import { PERMISSION_RESOURCES, PERMISSION_ACTIONS } from '../models/UserModel';

const ACTION_LABELS = { create: 'Create', read: 'Read', update: 'Update', delete: 'Delete' };
const RESOURCE_LABELS = {
  blogs: 'Blogs',
  users: 'Users',
  speakers: 'Speakers',
  forms: 'Forms',
  events: 'Events',
  files: 'Files',
  images: 'Images',
  volunteer: 'Volunteer',
  partner: 'Partner',
  'general-settings': 'General Settings',
  wall: 'Wall',
};

function PermissionsTable({ control, isDisabled }) {
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
                {PERMISSION_ACTIONS.map((action) => (
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
                    {ACTION_LABELS[action]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_RESOURCES.map((resource, ri) => (
                <tr key={resource} style={{ backgroundColor: ri % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td
                    style={{
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#333',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    {RESOURCE_LABELS[resource]}
                  </td>
                  {PERMISSION_ACTIONS.map((action) => (
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

function BasicInfoTab({ control, errors, isDisabled, isOwnSuperadmin, isNew }) {
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
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth required error={!!errors.status} disabled={isOwnSuperadmin}>
                <InputLabel>Status</InputLabel>
                <Select {...field} label="Status">
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="disabled">Disabled</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        {isOwnSuperadmin && (
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
                As a Super Admin you cannot change your own status.
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Password section */}
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

        <Grid item xs={12}>
          <PermissionsTable control={control} isDisabled={isDisabled} />
        </Grid>
      </Grid>
    </Box>
  );
}

export default BasicInfoTab;
