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
import PartnerModel from './models/PartnerModel';
import { ensureLocaleValue } from '../../../shared-components/locale-input';

const localeObjectSchema = z.object({ ar: z.string(), en: z.string() });

const partnerSchema = z.object({
  name: localeObjectSchema.refine((v) => v?.en?.trim() || v?.ar?.trim(), 'Name is required'),
  slug: localeObjectSchema.optional(),
  description: localeObjectSchema.optional(),
  image: z.string().optional(),
  partnership_type: z.string().min(1, 'Partnership type is required'),
  website_url: z.string().optional(),
  instagram_url: z.string().optional(),
  linkedin_url: z.string().optional(),
  facebook_url: z.string().optional(),
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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(partnerSchema),
    defaultValues: PartnerModel(),
  });

  useEffect(() => {
    if (partner && !isNew) {
      const links = Array.isArray(partner.social_links) ? partner.social_links : [];
      const website_url =
        links.find(
          (u) => !u.includes('instagram') && !u.includes('linkedin') && !u.includes('facebook'),
        ) ?? '';
      const instagram_url = links.find((u) => u.includes('instagram')) ?? '';
      const linkedin_url = links.find((u) => u.includes('linkedin')) ?? '';
      const facebook_url = links.find((u) => u.includes('facebook')) ?? '';

      reset({
        name: ensureLocaleValue(partner.name),
        slug: ensureLocaleValue(partner.slug),
        description: ensureLocaleValue(partner.description),
        image: partner.image || '',
        partnership_type: partner.partnership_type || '',
        website_url,
        instagram_url,
        linkedin_url,
        facebook_url,
      });
    }
  }, [partner, isNew, reset]);

  const onSubmit = async (formData) => {
    try {
      const socialLinks = [
        formData.website_url,
        formData.instagram_url,
        formData.linkedin_url,
        formData.facebook_url,
      ].filter((u) => u?.trim());

      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        partnership_type: formData.partnership_type,
      };

      if (formData.image) payload.image = formData.image;
      if (socialLinks.length) payload.social_links = socialLinks;

      if (isNew) {
        await createPartner(payload).unwrap();
        enqueueSnackbar('Partner created successfully', { variant: 'success' });
      } else {
        await updatePartner({ id: partnerId, data: payload }).unwrap();
        enqueueSnackbar('Partner updated successfully', { variant: 'success' });
      }
      navigate('/partners');
    } catch {
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
          <Tab label="Social Links" />
        </Tabs>
        <Box>
          {currentTab === 0 && <BasicInfoTab control={control} errors={errors} />}
          {currentTab === 1 && <SocialLinksTab control={control} errors={errors} />}
        </Box>
      </Paper>
    </div>
  );
}

export default Partner;
