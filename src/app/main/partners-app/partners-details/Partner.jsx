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
  useGetPartnerQuery,
  useCreatePartnerMutation,
  useUpdatePartnerMutation,
} from '../PartnersApi';
import BasicInfoTab from './tabs/BasicInfoTab';
import SocialLinksTab from './tabs/SocialLinksTab';
import ServicesTab from './tabs/ServicesTab';
import PartnerModel from './models/PartnerModel';
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

const serviceSchema = z.object({
  title: z.string().min(1, 'Service title is required'),
  description: translationDtoSchema('Service description'),
});

const partnerSchema = z.object({
  name: translationDtoSchema('Name'),

  slug: translationDtoSchema('Slug'),

  image: z.string().min(1, 'Image is required').url('Image must be a valid URL'),

  partner_ship_type: z
    .string()
    .min(4, 'Partner type must be at least 4 characters')
    .max(25, 'Partner type must not exceed 25 characters'),

  custom_card_size: z.string().optional(),

  year: z.coerce
    .number({ required_error: 'Year is required', invalid_type_error: 'Year must be a number' })
    .int('Year must be a whole number')
    .min(2026, 'Year must be 2026 or later')
    .max(2060, 'Year must be 2060 or earlier'),

  short_description: translationDtoSchema('Short description'),
  long_description: translationDtoSchema('Long description'),

  social_links: z
    .array(z.string().min(1, 'Link cannot be empty'))
    .min(1, 'At least one social link is required'),

  contact_info: z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    address: translationDtoSchema('Address'),
  }),

  services: z.array(serviceSchema).min(1, 'At least one service is required'),
});

const TAB_FIELDS = [
  [
    'name',
    'slug',
    'image',
    'partner_ship_type',
    'custom_card_size',
    'year',
    'short_description',
    'long_description',
  ],
  ['social_links', 'contact_info'],
  ['services'],
];

function Partner() {
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [currentTab, setCurrentTab] = useState(0);
  const isNew = partnerId === 'add';

  const { data: partner, isLoading } = useGetPartnerQuery(partnerId, { skip: isNew });
  const [createPartner, { isLoading: isCreating }] = useCreatePartnerMutation();
  const [updatePartner, { isLoading: isUpdating }] = useUpdatePartnerMutation();
  const isSaving = isCreating || isUpdating;

  const {
    control,
    handleSubmit,
    reset,
    register,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(partnerSchema),
    defaultValues: PartnerModel(),
  });

  useEffect(() => {
    if (partner && !isNew) {
      reset({
        name: ensureLocaleValue(partner.name),
        slug: ensureLocaleValue(partner.slug),
        image: partner.image || '',
        partner_ship_type: partner.partner_ship_type || '',
        custom_card_size: partner.custom_card_size || '',
        year: partner.year || new Date().getFullYear(),
        short_description: ensureLocaleValue(partner.short_description),
        long_description: ensureLocaleValue(partner.long_description),
        social_links:
          Array.isArray(partner.social_links) && partner.social_links.length
            ? partner.social_links
            : [''],
        contact_info: {
          email: partner.contact_info?.email || '',
          phone: partner.contact_info?.phone || '',
          address: ensureLocaleValue(partner.contact_info?.address),
        },
        services: Array.isArray(partner.services)
          ? partner.services.map((s) => ({
              title: s.title || '',
              description: ensureLocaleValue(s.description),
            }))
          : [],
      });
    }
  }, [partner, isNew, reset]);

  const onSubmit = async (formData) => {
    try {
      const cleanedSocialLinks = (formData.social_links || [])
        .map((link) => (typeof link === 'string' ? link.trim() : ''))
        .filter((link) => link !== '');

      const payload = {
        name: formData.name,
        slug: formData.slug,
        partner_ship_type: formData.partner_ship_type,
        custom_card_size: formData.custom_card_size || undefined,
        year: formData.year,
        short_description: formData.short_description,
        long_description: formData.long_description,
        social_links: cleanedSocialLinks,
        contact_info: formData.contact_info,
        services: formData.services || [],
      };
      if (isNew) {
  payload.image = formData.image;
} else {
  delete payload.image;
}

      if (isNew) {
        await createPartner(payload).unwrap();
        enqueueSnackbar('Partner created successfully', { variant: 'success' });
      } else {
        await updatePartner({ id: partnerId, data: payload }).unwrap();
        enqueueSnackbar('Partner updated successfully', { variant: 'success' });
      }
      navigate('/partners');
    } catch (error) {
      console.error('Save failed:', error);
      const backendMessage = error?.data?.details?.[0]?.message;
      enqueueSnackbar(backendMessage || `Failed to ${isNew ? 'create' : 'update'} partner`, {
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
          { label: 'Partners', href: '/partners' },
          { label: isNew ? 'Add New Partner' : 'Edit Partner' },
        ]}
      />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-tedx-dark">
          {isNew ? 'Add New Partner' : 'Edit Partner'}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            onClick={() => navigate('/partners')}
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
              '&:hover': { bgcolor: 'var(--color-primary-dark)' },
            }}
          >
            {isSaving ? 'Saving...' : 'Save Partner'}
          </Button>
        </div>
      </div>

      <Paper
        elevation={0}
        sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}
      >
        <Tabs
          value={currentTab}
          onChange={(_, v) => setCurrentTab(v)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: 3,
            '& .MuiTab-root.Mui-selected': { color: 'var(--color-primary)' },
            '& .MuiTabs-indicator': { backgroundColor: 'var(--color-primary)' },
          }}
        >
          <Tab
            label="Partner Information"
            sx={{ color: TAB_FIELDS[0].some((f) => errors[f]) ? 'error.main' : undefined }}
          />
          <Tab
            label="Social & Contact Links"
            sx={{ color: TAB_FIELDS[1].some((f) => errors[f]) ? 'error.main' : undefined }}
          />
          <Tab
            label="Services"
            sx={{ color: TAB_FIELDS[2].some((f) => errors[f]) ? 'error.main' : undefined }}
          />
        </Tabs>
        <Box>
          {currentTab === 0 && (
            <BasicInfoTab control={control} errors={errors} setValue={setValue} />
          )}
          {currentTab === 1 && <SocialLinksTab control={control} errors={errors} />}
          {currentTab === 2 && (
            <ServicesTab control={control} register={register} errors={errors} />
          )}
        </Box>
      </Paper>
    </div>
  );
}

export default Partner;
