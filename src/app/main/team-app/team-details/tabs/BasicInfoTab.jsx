import { Controller } from 'react-hook-form';
import { TextField, Grid, Box, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput } from '@mui/material';
import { LocaleInput, localeInputTypes } from '../../../../shared-components/locale-input';
import { ImagePickerField } from '../../../../shared-components/image-picker';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 2060 - CURRENT_YEAR + 1 }, (_, i) => String(CURRENT_YEAR + i));

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

function BasicInfoTab({ control, errors, events = [], isLoadingEvents }) {
  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textField}
                label="Full Name"
                required
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="image"
            control={control}
            render={({ field }) => (
              <ImagePickerField
                value={field.value}
                onChange={field.onChange}
                label="Photo"
                required
                error={!!errors.image}
                helperText={errors.image?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="year"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                required
                label="Year"
                value={field.value ?? ''}
                error={!!errors.year}
                helperText={errors.year?.message}
              >
                {YEARS.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textField}
                label="Role"
                placeholder="e.g. Organizer, Volunteer"
                error={!!errors.role}
                helperText={
                  errors.role?.message ||
                  errors.role?.en?.message ||
                  errors.role?.ar?.message
                }
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textField}
                label="Category"
                placeholder="e.g. Core Team, Logistics"
                error={!!errors.category}
                helperText={
                  errors.category?.message ||
                  errors.category?.en?.message ||
                  errors.category?.ar?.message
                }
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="events"
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <FormControl fullWidth error={Boolean(errors.events?.message || errors.events?.root?.message)}>
                <InputLabel id="team-member-events-label" shrink>
                  Events
                </InputLabel>
                <Select
                  labelId="team-member-events-label"
                  multiple
                  displayEmpty
                  value={toEventIds(value)}
                  onChange={(e) => onChange(toEventIds(e.target.value))}
                  onBlur={onBlur}
                  label="Events"
                  input={<OutlinedInput notched label="Events" />}
                  renderValue={(selected) =>
                    selected.length ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((id) => {
                          const ev = events.find((e) => String(e.id) === String(id));
                          return (
                            <Chip
                              key={id}
                              size="small"
                              label={ev?.title?.en || ev?.title?.ar || id}
                            />
                          );
                        })}
                      </Box>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )
                  }
                >
                  {isLoadingEvents && (
                    <MenuItem disabled>
                      Loading events...
                    </MenuItem>
                  )}
                  {events.map((event) => (
                    <MenuItem key={event.id} value={event.id}>
                      {event.title?.en || event.title?.ar || event.id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="bio"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textFieldMultiple}
                label="Bio"
                required
                minRows={3}
                error={!!errors.bio}
                helperText={errors.bio?.message}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default BasicInfoTab;
