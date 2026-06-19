import { Controller } from 'react-hook-form';
import { Grid, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { parse, format, isValid } from 'date-fns';

import { LocaleInput, localeInputTypes } from '../../../../shared-components/locale-input';

import { CustomAutocomplete } from '../../../../shared-components/custom-autocomplete';
import { ImagePickerField } from '../../../../shared-components/image-picker';

import { searchSpeakerOptions } from '../../../speakers-app/SpeakersApi';

const pickerSx = {
  width: '100%',
  '& .MuiOutlinedInput-root': {
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'var(--color-primary)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'var(--color-primary)',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: 'var(--color-primary)',
  },
  '& .MuiIconButton-root': {
    color: 'var(--color-primary)',
  },
};

const EVENT_TYPES = [
  { value: 'salon', label: 'Salon' },
  { value: 'main_event', label: 'Main Event' },
  { value: 'meetup', label: 'Meetup' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function BasicInfoTab({ control, errors }) {
  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* TITLE */}
        <Grid item xs={12}>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textField}
                label="Event Title"
                required
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            )}
          />
        </Grid>

        {/* DATE */}
        <Grid item xs={12} md={6}>
          <Controller
            name="date"
            control={control}
            render={({ field }) => {
              const dateValue = field.value
                ? (() => {
                    const d = parse(field.value, 'yyyy-MM-dd', new Date());
                    return isValid(d) ? d : null;
                  })()
                : null;

              return (
                <DatePicker
                  label="Event Date *"
                  value={dateValue}
                  onChange={(newDate) =>
                    field.onChange(newDate && isValid(newDate) ? format(newDate, 'yyyy-MM-dd') : '')
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.date,
                      helperText: errors.date?.message,
                    },
                  }}
                  sx={pickerSx}
                />
              );
            }}
          />
        </Grid>

        {/* EVENT TYPE */}
        <Grid item xs={12} md={6}>
          <Controller
            name="event_type"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Event Type</InputLabel>
                <Select {...field} label="Event Type" value={field.value ?? ''}>
                  {EVENT_TYPES.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        {/* STATUS */}
        <Grid item xs={12} md={6}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select {...field} label="Status" value={field.value ?? 'draft'}>
                  {STATUS_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        {/* LOCATION */}
        <Grid item xs={12}>
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textField}
                label="Location / City"
                error={!!errors.location}
                helperText={errors.location?.message}
              />
            )}
          />
        </Grid>

        {/* COVER IMAGE */}
        <Grid item xs={12}>
          <Controller
            name="event_image"
            control={control}
            render={({ field }) => (
              <ImagePickerField
                value={field.value}
                onChange={field.onChange}
                label="Event Cover Image"
                required
                error={!!errors.event_image}
                helperText={errors.event_image?.message}
              />
            )}
          />
        </Grid>

        {/* SPEAKERS */}
        <Grid item xs={12}>
          <Controller
            name="speakers"
            control={control}
            render={({ field }) => (
              <CustomAutocomplete
                {...field}
                scope="event-speakers"
                fetchOptions={searchSpeakerOptions}
                multiple
                label="Event Speakers"
                placeholder="Search speakers..."
                error={!!errors.speakers}
                helperText={errors.speakers?.message}
                onChange={(value) => field.onChange(value)}
              />
            )}
          />
        </Grid>

        {/* BRIEF */}
        <Grid item xs={12}>
          <Controller
            name="brief"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textFieldMultiple}
                label="Brief (optional)"
                minRows={2}
                error={!!errors.brief}
                helperText={errors.brief?.message}
              />
            )}
          />
        </Grid>

        {/* DESCRIPTION */}
        <Grid item xs={12}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textFieldMultiple}
                label="Event Description"
                minRows={4}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default BasicInfoTab;
