// Organizer.jsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tabs, Tab, Box, Paper, CircularProgress, Button } from '@mui/material';
import { Save } from '@mui/icons-material';
import Breadcrumb from '../../../shared-components/breadcrumb';
import { useSnackbar } from 'notistack';

import {
  useGetOrganizerQuery,
  useCreateOrganizerMutation,
  useUpdateOrganizerMutation,
} from '../organizersApi';

import BasicInfoTab from './tabs/BasicInfoTab';
import MediaLinksTab from './tabs/SocialLinksTab';

import OrganizerModel from './models/organizerModel';
import { ensureLocaleValue } from '../../../shared-components/locale-input';

const translationDtoSchema = (fieldLabel = 'This field') =>
  z.object({
    en: z
      .string()
      .min(1, `${fieldLabel} (English) is required`)
      .min(4, `${fieldLabel} (English) must be at least 4 characters`)
      .max(1000, `${fieldLabel} (English) must not exceed 1000 characters`),
    ar: z
      .string()
      .min(1, `${fieldLabel} (Arabic) is required`)
      .min(4, `${fieldLabel} (Arabic) must be at least 4 characters`)
      .max(1000, `${fieldLabel} (Arabic) must not exceed 1000 characters`),
  });

const organizerSchema = z.object({
  name: translationDtoSchema('Name'),
  image: z.string().min(1, 'Image is required').url('Image must be a valid URL'),
  bio: translationDtoSchema('Bio'),
  role: z.string().min(1, 'Role is required'),
  gallery: z
    .array(z.string().url('Each gallery image must be a valid URL'))
    .min(1, 'At least one gallery image is required'),
  linkedin_url: z.string().optional(),
  twitter_url: z.string().optional(),
  facebook_url: z.string().optional(),
  website_url: z.string().optional(),
});

const TAB_FIELDS = [
  ['name', 'image', 'bio', 'role'],
  ['social_links', 'linkedin_url', 'twitter_url', 'facebook_url', 'website_url', 'gallery'],
];

function Organizer() {
  const { organizerId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [currentTab, setCurrentTab] = useState(0);

  const isNew = organizerId === 'add';

  const { data: organizer, isLoading } = useGetOrganizerQuery(organizerId, {
    skip: isNew,
  });

  const [createOrganizer, { isLoading: isCreating }] = useCreateOrganizerMutation();
  const [updateOrganizer, { isLoading: isUpdating }] = useUpdateOrganizerMutation();
  const isSaving = isCreating || isUpdating;
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(organizerSchema),
    defaultValues: OrganizerModel(),
  });

  useEffect(() => {
    if (organizer && !isNew) {
      const links = Array.isArray(organizer.social_links) ? organizer.social_links : [];

      const imageUrl = typeof organizer.image === 'object' ? organizer.image?.url : organizer.image;

      const galleryUrls = Array.isArray(organizer.gallery)
        ? organizer.gallery
            .map((item) => (typeof item === 'object' ? item?.url : item))
            .filter(Boolean)
        : [];

      reset({
        name: ensureLocaleValue(organizer.name),
        bio: ensureLocaleValue(organizer.bio),
        image: imageUrl || '',
        role: organizer.role || '',
        linkedin_url: links.find((u) => u.includes('linkedin')) || '',
        twitter_url: links.find((u) => u.includes('twitter') || u.includes('x.com')) || '',
        facebook_url: links.find((u) => u.includes('facebook')) || '',
        website_url:
          links.find(
            (u) =>
              !u.includes('linkedin') &&
              !u.includes('twitter') &&
              !u.includes('x.com') &&
              !u.includes('facebook'),
          ) || '',
        gallery: galleryUrls,
      });
    }
  }, [organizer, isNew, reset]);

  const onSubmit = async (data) => {
    const social_links = [
      data.linkedin_url,
      data.twitter_url,
      data.facebook_url,
      data.website_url,
    ].filter(Boolean);

    const payload = {
      name: data.name,
      bio: data.bio,
      role: data.role,
      image: data.image,
      social_links,
      gallery: data.gallery,
    };

    try {
      if (isNew) {
        await createOrganizer(payload).unwrap();
        enqueueSnackbar('Organizer created successfully', { variant: 'success' });
      } else {
        await updateOrganizer({ id: organizerId, data: payload }).unwrap();
        enqueueSnackbar('Organizer updated successfully', { variant: 'success' });
      }
      navigate('/organizers');
    } catch (error) {
      console.error('Save failed:', error);
      const backendMessage = error?.data?.details?.[0]?.message;
      enqueueSnackbar(backendMessage || `Failed to ${isNew ? 'create' : 'update'} organizer`, {
        variant: 'error',
      });
    }
  };

  const onInvalid = (formErrors) => {
    enqueueSnackbar('Please fix the highlighted fields before saving', { variant: 'error' });

    const errorFieldNames = Object.keys(formErrors);
    const tabIndex = TAB_FIELDS.findIndex((fields) =>
      fields.some((f) => errorFieldNames.includes(f)),
    );

    if (tabIndex !== -1) {
      setCurrentTab(tabIndex);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <CircularProgress className="text-tedx-red" />
      </div>
    );
  }

  return (
    <div className="p-6 pt-8">
      <Breadcrumb
        items={[
          { label: 'Organizers', href: '/organizers' },
          { label: isNew ? 'Add New Organizer' : 'Edit Organizer' },
        ]}
      />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-tedx-dark">
          {isNew ? 'Add New Organizer' : 'Edit Organizer'}
        </h1>

        <div className="flex gap-2">
          <Button
            variant="outlined"
            onClick={() => navigate('/organizers')}
            className="border-gray-300 text-gray-500"
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : <Save />}
            onClick={handleSubmit(onSubmit, onInvalid)}
            disabled={isSaving}
            sx={{
              bgcolor: 'var(--color-primary)',
              '&:hover': {
                bgcolor: 'var(--color-primary-dark)',
              },
            }}
          >
            {isSaving ? 'Saving...' : 'Save Organizer'}
          </Button>
        </div>
      </div>

      <Paper
        elevation={0}
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={currentTab}
          onChange={(_, v) => setCurrentTab(v)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: 3,
            '& .MuiTab-root.Mui-selected': {
              color: 'var(--color-primary)',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'var(--color-primary)',
            },
          }}
        >
          <Tab
            label="Basic Information"
            sx={{ color: TAB_FIELDS[0].some((f) => errors[f]) ? 'error.main' : undefined }}
          />
          <Tab
            label="Media & Links"
            sx={{ color: TAB_FIELDS[1].some((f) => errors[f]) ? 'error.main' : undefined }}
          />
        </Tabs>

        <Box>
          {currentTab === 0 && <BasicInfoTab control={control} errors={errors} />}

          {currentTab === 1 && <MediaLinksTab control={control} errors={errors} />}
        </Box>
      </Paper>
    </div>
  );
}

export default Organizer;
