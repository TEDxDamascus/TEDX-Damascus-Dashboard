import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Avatar,
  Box,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Alert,
  Chip,
} from '@mui/material';
import { Save, LockOutlined, MailOutline, Security } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useDispatch } from 'react-redux';
import Breadcrumb from '../../../shared-components/breadcrumb';
import StatusBadge from '../../../shared-components/status-badge';
import { useGetMyProfileQuery, useUpdateMyProfileMutation } from '../UsersApi';
import { setUser } from '../../../auth/store/userSlice';
import { normalizeUser } from '../models/userMappers';

const fieldSx = {
  '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: 'var(--color-primary)' },
  '& .MuiInputLabel-root.Mui-focused': { color: 'var(--color-primary)' },
};

const profileSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password && data.password.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password must be at least 6 characters',
        path: ['password'],
      });
    }
    if (data.password && data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      });
    }
  });

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return value;
  }
}

function roleLabel(role) {
  if (role === 'superadmin') return 'Super Admin';
  if (role === 'admin') return 'Admin';
  return role || 'User';
}

function formatPermission(permission) {
  const [resource, action] = String(permission).split(':');
  if (!action) return permission;
  return `${resource.replace(/-/g, ' ')} · ${action}`;
}

function MyProfile() {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const { data: profile, isLoading } = useGetMyProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateMyProfileMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (profile) {
      reset({
        email: profile.email || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data) => {
    const payload = { email: data.email };
    if (data.password) payload.password = data.password;

    try {
      const result = await updateProfile(payload).unwrap();
      const updated = normalizeUser(result?.data ?? result ?? { ...profile, ...payload });
      dispatch(
        setUser({
          ...profile,
          ...updated,
          role: updated.role || profile?.role,
        }),
      );
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
      reset({
        email: updated.email || data.email,
        password: '',
        confirmPassword: '',
      });
    } catch (error) {
      enqueueSnackbar(error?.data?.message || 'Failed to update profile', { variant: 'error' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  const initial = (profile?.email || 'A').charAt(0).toUpperCase();

  return (
    <div className="p-6 pt-8">
      <Breadcrumb items={[{ label: 'My Profile' }]} />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tedx-dark">My Profile</h1>
          <p className="mt-1 text-gray-500">Manage your account email and password</p>
        </div>
        <Button
          variant="contained"
          startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : <Save />}
          onClick={handleSubmit(onSubmit)}
          disabled={isSaving || !isDirty}
          sx={{
            alignSelf: { xs: 'stretch', sm: 'auto' },
            backgroundColor: 'var(--color-primary)',
            px: 2.5,
            '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
            '&.Mui-disabled': { backgroundColor: '#e0e0e0', color: '#9e9e9e' },
          }}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {profile && !profile.isActive && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          Your account is currently inactive.
        </Alert>
      )}

      <div className="mx-auto grid max-w-3xl gap-5">
        {/* Identity */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: 2,
            border: '1px solid #eee',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2.5,
          }}
        >
          <Avatar
            sx={{
              width: 72,
              height: 72,
              fontSize: 28,
              fontWeight: 700,
              backgroundColor: 'var(--color-primary)',
            }}
          >
            {initial}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: '#1a1a1a', wordBreak: 'break-all' }}
            >
              {profile?.email || '—'}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.25 }}>
              <Chip
                label={roleLabel(profile?.role)}
                size="small"
                sx={{
                  fontWeight: 600,
                  backgroundColor: '#FFF3E0',
                  color: '#E65100',
                }}
              />
              <StatusBadge status={profile?.isActive ? 'active' : 'inactive'} />
            </Box>
            <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: '#9e9e9e' }}>
              Joined {formatDate(profile?.createdAt)}
              {profile?.updatedAt ? ` · Updated ${formatDate(profile.updatedAt)}` : ''}
            </Typography>
          </Box>
        </Paper>

        {/* Permissions (read-only from GET /users/me) */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid #eee',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              px: { xs: 2.5, sm: 3 },
              py: 2,
              borderBottom: '1px solid #f0f0f0',
              backgroundColor: '#fafafa',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Security sx={{ fontSize: 20, color: '#888' }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                Permissions
              </Typography>
              <Typography variant="body2" sx={{ color: '#888', mt: 0.25 }}>
                Assigned to your account (read-only)
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
            {Array.isArray(profile?.permissions) && profile.permissions.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profile.permissions.map((permission) => (
                  <Chip
                    key={permission}
                    label={formatPermission(permission)}
                    size="small"
                    sx={{
                      fontWeight: 500,
                      textTransform: 'capitalize',
                      backgroundColor: '#F5F5F5',
                      border: '1px solid #E0E0E0',
                      color: '#333',
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
                {profile?.role === 'superadmin'
                  ? 'Super Admin has full access (no explicit permission list).'
                  : 'No permissions assigned to this account.'}
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Account settings */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: '1px solid #eee',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              px: { xs: 2.5, sm: 3 },
              py: 2,
              borderBottom: '1px solid #f0f0f0',
              backgroundColor: '#fafafa',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
              Account settings
            </Typography>
            <Typography variant="body2" sx={{ color: '#888', mt: 0.25 }}>
              Changes apply after you save.
            </Typography>
          </Box>

          <Box sx={{ p: { xs: 2.5, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <MailOutline sx={{ fontSize: 18, color: '#888' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#555' }}>
                  Email
                </Typography>
              </Box>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email address"
                    type="email"
                    fullWidth
                    required
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={fieldSx}
                  />
                )}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <LockOutlined sx={{ fontSize: 18, color: '#888' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#555' }}>
                  Password
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ display: 'block', color: '#9e9e9e', mb: 1.5 }}>
                Leave blank to keep your current password.
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                }}
              >
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="New password"
                      type="password"
                      fullWidth
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      autoComplete="new-password"
                      sx={fieldSx}
                    />
                  )}
                />
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Confirm password"
                      type="password"
                      fullWidth
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      autoComplete="new-password"
                      sx={fieldSx}
                    />
                  )}
                />
              </Box>
            </Box>
          </Box>
        </Paper>
      </div>
    </div>
  );
}

export default MyProfile;
