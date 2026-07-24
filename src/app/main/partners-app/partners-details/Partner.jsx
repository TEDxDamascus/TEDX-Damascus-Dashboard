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

const localeObjectSchema = z.object({ ar: z.string(), en: z.string() });

const servicesSchema = z.object({
  title: z.string().min(1, 'Service title is required'),
  description: localeObjectSchema.refine(
    (v) => v?.en?.trim() || v?.ar?.trim(),
    'Description is required',
  ),
});

const partnerSchema = z.object({
  name: localeObjectSchema.refine((v) => v?.en?.trim() || v?.ar?.trim(), 'Name is required'),
  slug: localeObjectSchema.optional(),
  image: z.string().optional(), 
  partnership_type: z.string().min(1, 'Partnership type is required'),
  card_size: z.string().min(1, 'Card size is required'),
  short_description: localeObjectSchema.optional(),
  long_description: localeObjectSchema.optional(),
  social_links: z.array(z.string().optional()).optional(),
  contact_info: z
    .object({
      email: z.string().email('Invalid email address').or(z.literal('')),
      phone: z.string().optional(),
      address: localeObjectSchema.optional(),
    })
    .optional(),
  services: z.array(servicesSchema).optional(), 
});

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
        partnership_type: partner.partnership_type || '',
        card_size: partner.card_size || '',
        short_description: ensureLocaleValue(partner.short_description),
        long_description: ensureLocaleValue(partner.long_description),
        social_links: Array.isArray(partner.social_links) ? partner.social_links : [''],
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
      .map(link => typeof link === 'string' ? link.trim() : '')
      .filter(link => link !== '');

    const payload = {
      name: formData.name,
      slug: formData.slug,
      partnership_type: formData.partnership_type,
      card_size: formData.card_size,
      short_description: formData.short_description,
      long_description: formData.long_description,
      social_links: cleanedSocialLinks,
      contact_info: {
        email: formData.contact_info?.email || '',
        phone: formData.contact_info?.phone || '',
        address: formData.contact_info?.address,
      },
      services: formData.services || [], 
    };

    const originalImageId = partner?.image && typeof partner.image === 'object' ? partner.image._id : partner.image;
    
    const currentImageId = formData.image && typeof formData.image === 'object' ? formData.image._id : formData.image;

    if (currentImageId && currentImageId !== originalImageId && currentImageId.trim() !== '') {
      payload.image = currentImageId;
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
    console.error('Update failed:', error);
    enqueueSnackbar(`Failed to ${isNew ? 'create' : 'update'} partner`, { variant: 'error' });
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
            onClick={handleSubmit(onSubmit)}
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
          <Tab label="Partner Information" />
          <Tab label="Social & Contact Links" />
          <Tab label="Services (Optional)" />
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
