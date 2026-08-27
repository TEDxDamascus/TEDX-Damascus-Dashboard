import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tabs, Tab, Box, Paper, CircularProgress, Button } from '@mui/material';
import { Save } from '@mui/icons-material';
import Breadcrumb from '../../../shared-components/breadcrumb';
import { useSnackbar } from 'notistack';

import { useGetEventQuery, useCreateEventMutation, useUpdateEventMutation } from '../EventsApi';

import BasicInfoTab from './tabs/BasicInfoTab';
import SocialLinksTab from './tabs/SocialLinksTab';
import EventModel from './models/events-model';
import { ensureLocaleValue } from '../../../shared-components/locale-input';
import { assignOptionalArray, assignOptionalString, getApiErrorMessage } from '../../../shared/apiError';

const localeObjectSchema = z.object({
  ar: z.string().optional(),
  en: z.string().optional(),
});

const eventSchema = z.object({
  title: localeObjectSchema.refine((v) => v?.en?.trim() || v?.ar?.trim(), 'Title is required'),

  date: z.string().min(1, 'Date is required'),

  description: localeObjectSchema.optional(),
  brief: localeObjectSchema.optional(),
  location: localeObjectSchema.optional(),
  location_description: localeObjectSchema.optional(),

  location_email: z.string().optional(),
  location_phone: z.string().optional(),

  start_time: z.string().optional(),
  end_time: z.string().optional(),

  coordinate_lng: z.union([z.number(), z.string()]).optional().nullable(),
  coordinate_lat: z.union([z.number(), z.string()]).optional().nullable(),

  volunteers_count: z.union([z.number(), z.string()]).optional().nullable(),

  event_type: z.string().optional(),
  event_image: z.string().optional(),
  gallery: z.array(z.string()).optional(),

  speakers: z.array(z.any()).optional(),

  status: z.string().optional(),
});

function Event() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [currentTab, setCurrentTab] = useState(0);

  const isNew = eventId === 'add';

  const {
    data: event,
    isLoading,
    isError,
  } = useGetEventQuery(eventId, {
    skip: isNew,
  });

  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();

  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();

  const isSaving = isCreating || isUpdating;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: EventModel(),
  });

  useEffect(() => {
    if (!isNew && event) {
      reset({
        ...event,
        title: ensureLocaleValue(event.title),
        description: ensureLocaleValue(event.description),
        brief: ensureLocaleValue(event.brief),
        location: ensureLocaleValue(event.location),
        location_description: ensureLocaleValue(event.location_description),
        location_email: event.location_email ?? '',
        location_phone: event.location_phone ?? '',
        start_time: event.start_time ?? '',
        end_time: event.end_time ?? '',
        coordinate_lng: Array.isArray(event.coordinates) ? (event.coordinates[0] ?? '') : '',
        coordinate_lat: Array.isArray(event.coordinates) ? (event.coordinates[1] ?? '') : '',
        volunteers_count: event.volunteers_count ?? '',
        gallery: Array.isArray(event.gallery) ? event.gallery : [],
        speakers: Array.isArray(event.speakers) ? event.speakers : [],
        event_type: event.event_type ?? '',
        event_image: event.event_image ?? '',
        status: event.status ?? 'draft',
      });
    }
  }, [event, isNew, reset]);

  const onSubmit = async (data) => {
    try {
      // Only include `ar` when it has a value — never overwrite backend Arabic with an empty string
      const localeField = (obj) => ({
        en: obj?.en ?? '',
        ...(obj?.ar?.trim() ? { ar: obj.ar } : {}),
      });

      const payload = {
        title: localeField(data.title),
        description: localeField(data.description),
        location: localeField(data.location),
        location_description: localeField(data.location_description),
        start_time: data.start_time || undefined,
        end_time: data.end_time || undefined,
        coordinates:
          data.coordinate_lng !== '' || data.coordinate_lat !== ''
            ? [
                data.coordinate_lng !== '' ? Number(data.coordinate_lng) : null,
                data.coordinate_lat !== '' ? Number(data.coordinate_lat) : null,
              ]
            : undefined,
        volunteers_count: data.volunteers_count !== '' ? Number(data.volunteers_count) : undefined,
        date: data.date,
        event_type: data.event_type || undefined,
        event_image: data.event_image || undefined,
        status: data.status || undefined,
      };

      assignOptionalString(payload, 'location_email', data.location_email, !isNew);
      assignOptionalString(payload, 'location_phone', data.location_phone, !isNew);
      assignOptionalArray(payload, 'gallery', data.gallery ?? [], !isNew);
      assignOptionalArray(
        payload,
        'speakers',
        (data.speakers ?? []).map((s) => s.id ?? s),
        !isNew,
      );

      if (data.brief?.en?.trim() || data.brief?.ar?.trim() || !isNew) {
        payload.brief = localeField(data.brief);
      }

      if (isNew) {
        await createEvent(payload).unwrap();
        enqueueSnackbar('Event created successfully', { variant: 'success' });
        navigate('/events');
      } else {
        await updateEvent({ id: eventId, data: payload }).unwrap();
        enqueueSnackbar('Event updated successfully', { variant: 'success' });
      }
    } catch (error) {
      enqueueSnackbar(
        getApiErrorMessage(error, `Failed to ${isNew ? 'create' : 'update'} event`),
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

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Failed to load event
      </div>
    );
  }

  return (
    <div className="p-6 pt-8">
      <Breadcrumb
        items={[
          { label: 'Events', href: '/events' },
          {
            label: isNew ? 'Add New Event' : 'Edit Event',
          },
        ]}
      />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-tedx-dark">
          {isNew ? 'Add New Event' : 'Edit Event'}
        </h1>

        <div className="flex gap-2">
          <Button
            variant="outlined"
            onClick={() => navigate('/events')}
            className="border-gray-300 text-gray-500"
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : <Save />}
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            className="bg-tedx-red hover:bg-tedx-red-dark"
          >
            {isSaving ? 'Saving...' : 'Save Event'}
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
          <Tab label="Basic Information" />
          <Tab label="Location & Media" />
        </Tabs>

        <Box>
          {currentTab === 0 && <BasicInfoTab control={control} errors={errors} />}

          {currentTab === 1 && <SocialLinksTab control={control} errors={errors} />}
        </Box>
      </Paper>
    </div>
  );
}

export default Event;
