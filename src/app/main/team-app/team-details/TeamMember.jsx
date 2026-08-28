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
  useGetTeamMemberQuery,
  useCreateTeamMemberMutation,
  useUpdateTeamMemberMutation,
} from '../teamApi';
import { useGetEventsQuery } from '../../events-app/EventsApi';
import BasicInfoTab from './tabs/BasicInfoTab';
import SocialLinksTab from './tabs/SocialLinksTab';
import TeamMemberModel from './models/TeamMemberModel';
import { ensureLocaleValue } from '../../../shared-components/locale-input';
import {
  assignOptionalArray,
  assignOptionalLocale,
  getApiErrorMessage,
} from '../../../shared/apiError';
import { normalizeMediaFormValue } from '../../../shared-components/image-picker';

const localeObjectSchema = z.object({ ar: z.string(), en: z.string() });

const optionalBothLocales = (label) =>
  localeObjectSchema.optional().refine((v) => {
    const en = v?.en?.trim();
    const ar = v?.ar?.trim();
    if (!en && !ar) return true;
    return Boolean(en && ar);
  }, `${label} must include both English and Arabic`);

const imageUrlSchema = z.preprocess((val) => {
  if (val && typeof val === 'object') return val.url || val.secure_url || val.path || '';
  return val ?? '';
}, z.string().optional());

function toEventIds(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === 'string' || typeof item === 'number') return String(item).trim();
      if (item && typeof item === 'object') {
        const id = item.id ?? item._id;
        return id != null ? String(id).trim() : '';
      }
      return '';
    })
    .filter(Boolean);
}

function toUrlString(item) {
  if (typeof item === 'string') return item.trim();
  if (item && typeof item === 'object') {
    return String(item.url || item.link || item.href || item.value || '').trim();
  }
  return '';
}

function getMemberSocialLinks(member) {
  const raw = member?.social_links ?? member?.social_link ?? [];
  if (typeof raw === 'string') return raw.trim() ? [raw.trim()] : [];
  if (!Array.isArray(raw)) return [];
  return raw.map(toUrlString).filter(Boolean);
}

function pickSocialUrl(urls, ...needles) {
  return urls.find((u) => needles.some((needle) => u.toLowerCase().includes(needle))) ?? '';
}

const teamMemberSchema = z.object({
  name: localeObjectSchema.refine((v) => v?.en?.trim() || v?.ar?.trim(), 'Name is required'),
  bio: localeObjectSchema.refine((v) => v?.en?.trim() || v?.ar?.trim(), 'Bio is required'),
  image: imageUrlSchema,
  year: z.string().min(1, 'Year is required'),
  role: optionalBothLocales('Role'),
  category: optionalBothLocales('Category'),
  events: z.preprocess(toEventIds, z.array(z.string())).optional(),
  linkedin_url: z.string().optional(),
  twitter_url: z.string().optional(),
  facebook_url: z.string().optional(),
  website_url: z.string().optional(),
});

function TeamMember() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [currentTab, setCurrentTab] = useState(0);
  const isNew = memberId === 'add';

  const { data: member, isLoading } = useGetTeamMemberQuery(memberId, { skip: isNew });
  const [createMember, { isLoading: isCreating }] = useCreateTeamMemberMutation();
  const [updateMember, { isLoading: isUpdating }] = useUpdateTeamMemberMutation();
  const isSaving = isCreating || isUpdating;
  const { data: eventsData, isLoading: isLoadingEvents } = useGetEventsQuery({ pageSize: 100 });
  const events = eventsData?.items ?? [];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: TeamMemberModel(),
  });

  useEffect(() => {
    if (member && !isNew) {
      const links = getMemberSocialLinks(member);
      const linkedin_url = pickSocialUrl(links, 'linkedin');
      const twitter_url = pickSocialUrl(links, 'twitter', 'x.com');
      const facebook_url = pickSocialUrl(links, 'facebook');
      const website_url =
        links.find((u) => {
          const value = u.toLowerCase();
          return (
            !value.includes('linkedin') &&
            !value.includes('twitter') &&
            !value.includes('x.com') &&
            !value.includes('facebook')
          );
        }) ?? '';

      reset({
        name: ensureLocaleValue(member.name),
        bio: ensureLocaleValue(member.bio),
        image: normalizeMediaFormValue(member.image).url || '',
        year: member.year ? String(member.year) : new Date().getFullYear().toString(),
        role: ensureLocaleValue(member.role),
        category: ensureLocaleValue(member.category),
        events: toEventIds(member.events?.length ? member.events : member.event_id ? [member.event_id] : []),
        linkedin_url,
        twitter_url,
        facebook_url,
        website_url,
      });
    }
  }, [member, isNew, reset]);

  const onSubmit = async (formData) => {
    try {
      const socialLink = [
        formData.linkedin_url,
        formData.twitter_url,
        formData.facebook_url,
        formData.website_url,
      ].filter((u) => u?.trim());

      const payload = {
        name: formData.name,
        bio: formData.bio,
        year: formData.year,
      };
      const imageUrl = normalizeMediaFormValue(formData.image).url || formData.image;
      if (typeof imageUrl === 'string' && imageUrl) payload.image = imageUrl;
      assignOptionalLocale(payload, 'role', formData.role, !isNew);
      assignOptionalLocale(payload, 'category', formData.category, !isNew);
      assignOptionalArray(payload, 'events', formData.events ?? [], !isNew);
      assignOptionalArray(payload, 'social_links', socialLink, !isNew);

      if (isNew) {
        await createMember(payload).unwrap();
        enqueueSnackbar('Team member created successfully', { variant: 'success' });
      } else {
        await updateMember({ id: memberId, data: payload }).unwrap();
        enqueueSnackbar('Team member updated successfully', { variant: 'success' });
      }
      navigate('/team');
    } catch (error) {
      enqueueSnackbar(
        getApiErrorMessage(error, `Failed to ${isNew ? 'create' : 'update'} team member`),
        { variant: 'error' },
      );
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
        items={[{ label: 'Team', href: '/team' }, { label: isNew ? 'Add Member' : 'Edit Member' }]}
      />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-tedx-dark">
          {isNew ? 'Add Team Member' : 'Edit Team Member'}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            onClick={() => navigate('/team')}
            sx={{ borderColor: '#e0e0e0', color: '#666' }}
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
            {isSaving ? 'Saving...' : 'Save Member'}
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
          <Tab label="Basic Info" />
          <Tab label="Social Links" />
        </Tabs>
        <Box>
          {currentTab === 0 && (
            <BasicInfoTab
              control={control}
              errors={errors}
              events={events}
              isLoadingEvents={isLoadingEvents}
            />
          )}
          {currentTab === 1 && <SocialLinksTab control={control} errors={errors} />}
        </Box>
      </Paper>
    </div>
  );
}

export default TeamMember;
