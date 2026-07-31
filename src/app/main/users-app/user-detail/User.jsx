import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  useGetUserPermissionsQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserPermissionsMutation,
} from '../UsersApi';
import BasicInfoTab from './tabs/BasicInfoTab';
import UserModel, { buildDefaultPermissions } from './models/UserModel';

const baseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  status: z.string().min(1, 'Status is required'),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
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
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [currentTab, setCurrentTab] = useState(0);
  const isNew = userId === 'add';

  const currentUser = useSelector(selectUser);
  const { data: user, isLoading } = useGetUserQuery(userId, { skip: isNew });
  const { data: permissions, isFetching: isLoadingPermissions } = useGetUserPermissionsQuery(
    userId,
    { skip: isNew },
  );
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [updateUserPermissions, { isLoading: isSavingPermissions }] =
    useUpdateUserPermissionsMutation();

  const isUserDisabled = user?.status === 'disabled';
  const isOwnSuperadmin =
    !isNew && currentUser?.role === 'superadmin' && currentUser?.id === userId;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(isNew ? newUserSchema : userSchema),
    defaultValues: { ...UserModel, password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (user) {
      reset({ ...user, permissions: getValues('permissions') });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, reset]);

  useEffect(() => {
    if (permissions) {
      setValue('permissions', { ...buildDefaultPermissions(false), ...permissions });
    }
  }, [permissions, setValue]);

  const onSubmit = async (data) => {
    const { permissions: permissionsData, ...basicInfo } = data;
    basicInfo.role = 'admin';
    try {
      if (isNew) {
        await createUser(basicInfo).unwrap();
        enqueueSnackbar('User created successfully', { variant: 'success' });
      } else {
        await Promise.all([
          updateUser({ id: userId, data: basicInfo }).unwrap(),
          updateUserPermissions({ id: userId, permissions: permissionsData }).unwrap(),
        ]);
        enqueueSnackbar('User updated successfully', { variant: 'success' });
      }
      navigate('/users');
    } catch (error) {
      enqueueSnackbar(error?.data?.message || 'Failed to save user', { variant: 'error' });
    }
  };

  if (isLoading || (!isNew && isLoadingPermissions)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-6 pt-8">
      <Breadcrumb
        items={[{ label: 'Users', path: '/users' }, { label: isNew ? 'Add User' : 'Edit User' }]}
      />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tedx-dark">
            {isNew ? 'Add New User' : 'Edit User'}
          </h1>
          <p className="mt-1 text-gray-500">
            {isNew ? 'Create a new user account' : 'Update user information and status'}
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
            onClick={handleSubmit(onSubmit)}
            disabled={isCreating || isUpdating || isSavingPermissions || !isDirty}
            sx={{
              backgroundColor: 'var(--color-primary)',
              '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
            }}
          >
            {isCreating || isUpdating || isSavingPermissions ? 'Saving...' : 'Save User'}
          </Button>
        </div>
      </div>

      {isUserDisabled && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          This user is disabled. You can only edit their status.
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
          isDisabled={isUserDisabled}
          isOwnSuperadmin={isOwnSuperadmin}
          isNew={isNew}
        />
      </Paper>
    </div>
  );
}

export default User;
