import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tabs, Tab, Box, Paper, CircularProgress, Button, Alert } from '@mui/material';
import { Save } from '@mui/icons-material';
import Breadcrumb from '../../../shared-components/breadcrumb';
import { useSnackbar } from 'notistack';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../auth/store/userSlice';
import {
  useGetUserQuery,
  useGetAvailablePermissionsQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserPermissionsMutation,
  useEnableUserMutation,
  useDisableUserMutation,
} from '../UsersApi';
import BasicInfoTab from './tabs/BasicInfoTab';
import UserModel, {
  buildDefaultPermissions,
  permissionsToArray,
  permissionsFromArray,
} from '../models/UserModel';
import { toCreatePayload, toUpdatePayload, toFormValues } from '../models/userMappers';

const permissionBool = z.preprocess((v) => !!v, z.boolean());

const baseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['user', 'admin']),
  isActive: z.boolean(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  permissions: z.record(z.string(), z.record(z.string(), permissionBool)).optional(),
});

const userSchema = baseSchema.superRefine((data, ctx) => {
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

const newUserSchema = baseSchema
  .extend({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm the password'),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      });
    }
  });

function User() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [currentTab, setCurrentTab] = useState(0);
  const isNew = userId === 'add';
  const initialRole = searchParams.get('role') === 'user' ? 'user' : 'admin';

  const currentUser = useSelector(selectUser);
  const { data: user, isLoading } = useGetUserQuery(userId, { skip: isNew });
  const { data: catalog } = useGetAvailablePermissionsQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [updateUserPermissions, { isLoading: isSavingPermissions }] =
    useUpdateUserPermissionsMutation();
  const [enableUser] = useEnableUserMutation();
  const [disableUser] = useDisableUserMutation();

  const isUserDisabled = user && !user.isActive;
  const isOwnAccount = !isNew && currentUser?.id === userId;
  const isSuperAdmin = currentUser?.role === 'superadmin';
  // Backend: only superadmin can change role, permissions, or active status
  const canManagePrivileges = isSuperAdmin;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(isNew ? newUserSchema : userSchema),
    defaultValues: {
      ...UserModel,
      role: initialRole,
      password: '',
      confirmPassword: '',
      permissions: buildDefaultPermissions(false),
    },
  });

  const formRole = watch('role');

  // Keep permissions matrix in sync with catalog without marking form dirty
  useEffect(() => {
    if (!catalog || formRole !== 'admin') return;
    if (isNew) {
      setValue('permissions', buildDefaultPermissions(false, catalog), { shouldDirty: false });
      return;
    }
    if (user) {
      setValue('permissions', permissionsFromArray(user.permissions || [], catalog), {
        shouldDirty: false,
      });
    }
  }, [catalog, formRole, isNew, user, setValue]);

  useEffect(() => {
    if (user) {
      const matrix = buildDefaultPermissions(false, catalog);
      reset(
        toFormValues(
          user,
          user.role === 'admin'
            ? permissionsFromArray(user.permissions || [], catalog)
            : matrix,
        ),
      );
    }
  }, [user, reset, catalog]);

  const onInvalid = (formErrors) => {
    const first =
      formErrors?.name?.message ||
      formErrors?.email?.message ||
      formErrors?.password?.message ||
      formErrors?.confirmPassword?.message ||
      formErrors?.role?.message ||
      formErrors?.permissions?.message ||
      'Please fix the highlighted fields';
    enqueueSnackbar(first, { variant: 'warning' });
  };

  const onSubmit = async (data) => {
    try {
      if (isNew) {
        if (data.role === 'admin' && !isSuperAdmin) {
          enqueueSnackbar('Only superadmin can create admin users', { variant: 'error' });
          return;
        }
        const payload = toCreatePayload(data);
        if (!isSuperAdmin) {
          // Regular admin can only create standard users
          payload.role = 'user';
          delete payload.permissions;
        }
        await createUser(payload).unwrap();
        enqueueSnackbar(
          data.role === 'admin' ? 'Admin created successfully' : 'User created successfully',
          { variant: 'success' },
        );
      } else {
        const updatePayload = toUpdatePayload(data, { includeRole: canManagePrivileges });
        const tasks = [updateUser({ id: userId, data: updatePayload }).unwrap()];

        if (canManagePrivileges && data.role === 'admin') {
          tasks.push(
            updateUserPermissions({
              id: userId,
              permissions: permissionsToArray(data.permissions),
            }).unwrap(),
          );
        }

        if (canManagePrivileges && !isOwnAccount && user && data.isActive !== user.isActive) {
          tasks.push(
            data.isActive ? enableUser(userId).unwrap() : disableUser(userId).unwrap(),
          );
        }

        await Promise.all(tasks);
        enqueueSnackbar('User updated successfully', { variant: 'success' });
      }
      navigate(`/users?tab=${data.role || 'admin'}`);
    } catch (error) {
      enqueueSnackbar(error?.data?.message || 'Failed to save user', { variant: 'error' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  const titleRole = isNew
    ? initialRole === 'admin'
      ? 'Admin'
      : 'User'
    : user?.role === 'admin'
      ? 'Admin'
      : 'User';

  return (
    <div className="p-6 pt-8">
      <Breadcrumb
        items={[
          { label: 'Users', path: '/users' },
          { label: isNew ? `Add ${titleRole}` : `Edit ${titleRole}` },
        ]}
      />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tedx-dark">
            {isNew ? `Add New ${titleRole}` : `Edit ${titleRole}`}
          </h1>
          <p className="mt-1 text-gray-500">
            {isNew
              ? `Create a new ${titleRole.toLowerCase()} account`
              : 'Update account information and permissions'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            onClick={() => navigate('/users')}
            sx={{ borderColor: '#e0e0e0', color: '#666' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={
              isCreating || isUpdating || isSavingPermissions ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <Save />
              )
            }
            onClick={handleSubmit(onSubmit, onInvalid)}
            disabled={
              isCreating || isUpdating || isSavingPermissions || (!isNew && !isDirty)
            }
            sx={{
              backgroundColor: 'var(--color-primary)',
              '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
            }}
          >
            {isCreating || isUpdating || isSavingPermissions ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {isUserDisabled && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          This account is inactive. Enable it from the list or toggle Active below.
        </Alert>
      )}

      {!isSuperAdmin && !isNew && (
        <Alert severity="info" sx={{ mb: 3 }}>
          As an admin you can update name, email, and password only. Role, permissions, and active
          status can be changed by a superadmin.
        </Alert>
      )}

      <Paper sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
            <Tab label="Basic Info" />
          </Tabs>
        </Box>

        <BasicInfoTab
          control={control}
          errors={errors}
          isDisabled={false}
          isOwnAccount={isOwnAccount}
          isNew={isNew}
          catalog={catalog}
          lockRole={isNew || !canManagePrivileges}
          lockActiveStatus={!canManagePrivileges || isOwnAccount}
          showPermissions={canManagePrivileges || isNew}
        />
      </Paper>
    </div>
  );
}

export default User;
