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
  useGetSpeakerQuery,
  useCreateSpeakerMutation,
  useUpdateSpeakerMutation,
} from '../SpeakersApi';
import BasicInfoTab from './tabs/BasicInfoTab';
import MediaLinksTab from './tabs/SocialLinksTab';
import SpeakerModel from './models/SpeakerModel';
import { ensureLocaleValue } from '../../../shared-components/locale-input';

const localeObjectSchema = z.object({ ar: z.string(), en: z.string() });

const speakerSchema = z.object({
  name: localeObjectSchema.refine((v) => v?.en?.trim() || v?.ar?.trim(), 'Name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  bio: localeObjectSchema.optional(),
  experience: localeObjectSchema.optional(),
  brief: localeObjectSchema.optional(),
  description: localeObjectSchema.optional(),
  speaker_image: z.string().optional(),
  linkedin_url: z.string().optional(),
  twitter_url: z.string().optional(),
  facebook_url: z.string().optional(),
  website_url: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  video_link: z.array(z.string()).optional(),
  phone: z.string().optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
});

function Speaker() {
  const { speakerId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [currentTab, setCurrentTab] = useState(0);
  const isNew = speakerId === 'add';

  const { data: speaker, isLoading } = useGetSpeakerQuery(speakerId, { skip: isNew });
  const [createSpeaker, { isLoading: isCreating }] = useCreateSpeakerMutation();
  const [updateSpeaker, { isLoading: isUpdating }] = useUpdateSpeakerMutation();
  const isSaving = isCreating || isUpdating;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(speakerSchema),
    defaultValues: SpeakerModel(),
  });

  useEffect(() => {
    if (speaker && !isNew) {
      const links = Array.isArray(speaker.social_links) ? speaker.social_links : [];
      const linkedin_url = links.find((u) => u.includes('linkedin')) ?? '';
      const twitter_url = links.find((u) => u.includes('twitter') || u.includes('x.com')) ?? '';
      const facebook_url = links.find((u) => u.includes('facebook')) ?? '';
      const website_url =
        links.find(
          (u) =>
            !u.includes('linkedin') &&
            !u.includes('twitter') &&
            !u.includes('x.com') &&
            !u.includes('facebook'),
        ) ?? '';

      reset({
        name: ensureLocaleValue(speaker.name),
        bio: ensureLocaleValue(speaker.bio),
        experience: ensureLocaleValue(speaker.experience),
        brief: ensureLocaleValue(speaker.brief),
        description: ensureLocaleValue(speaker.description),
        speaker_image: speaker.speaker_image || '',
        linkedin_url,
        twitter_url,
        facebook_url,
        website_url,
        gallery: Array.isArray(speaker.gallery) ? speaker.gallery : [],
        video_link: Array.isArray(speaker.video_link)
          ? speaker.video_link
          : speaker.video_link
            ? [speaker.video_link]
            : [],
        email: speaker.email || '',
        phone: speaker.phone || '',
        featured: speaker.featured ?? false,
        active: speaker.active ?? true,
      });
    }
  }, [speaker, isNew, reset]);

  const onSubmit = async (formData) => {
    try {
      const socialLinks = [
        formData.linkedin_url,
        formData.twitter_url,
        formData.facebook_url,
        formData.website_url,
      ].filter((u) => u?.trim());

      const payload = {
        name: formData.name,
        bio: formData.bio,
        experience: formData.experience,
        brief: formData.brief,
        description: formData.description,
        featured: formData.featured,
        active: formData.active,
      };

      if (formData.email?.trim()) payload.email = formData.email.trim();
      if (formData.phone?.trim()) payload.phone = formData.phone.trim();
      if (formData.speaker_image) payload.speaker_image = formData.speaker_image;
      const validVideoLinks = (formData.video_link ?? []).filter((v) => v?.trim());
      if (validVideoLinks.length) payload.video_link = validVideoLinks;
      if (formData.gallery?.length) payload.gallery = formData.gallery;
      if (socialLinks.length) payload.social_links = socialLinks;

      if (isNew) {
        await createSpeaker(payload).unwrap();
        enqueueSnackbar('Speaker created successfully', { variant: 'success' });
      } else {
        await updateSpeaker({ id: speakerId, data: payload }).unwrap();
        enqueueSnackbar('Speaker updated successfully', { variant: 'success' });
      }
      navigate('/speakers');
    } catch {
      enqueueSnackbar(`Failed to ${isNew ? 'create' : 'update'} speaker`, { variant: 'error' });
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
          { label: 'Speakers', href: '/speakers' },
          { label: isNew ? 'Add New Speaker' : 'Edit Speaker' },
        ]}
      />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-tedx-dark">
          {isNew ? 'Add New Speaker' : 'Edit Speaker'}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            onClick={() => navigate('/speakers')}
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
            {isSaving ? 'Saving...' : 'Save Speaker'}
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
          <Tab label="Basic Information" />
          <Tab label="Media & Links" />
        </Tabs>
        <Box>
          {currentTab === 0 && <BasicInfoTab control={control} errors={errors} />}
          {currentTab === 1 && <MediaLinksTab control={control} errors={errors} />}
        </Box>
      </Paper>
    </div>
  );
}

export default Speaker;
