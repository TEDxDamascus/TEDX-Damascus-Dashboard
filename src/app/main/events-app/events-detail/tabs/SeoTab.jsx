import { Controller, useWatch } from 'react-hook-form';
import {
  Box,
  Grid,
  TextField,
  Typography,
  Chip,
  Stack,
  LinearProgress,
} from '@mui/material';

import {
  LocaleInput,
  localeInputTypes,
  ensureLocaleValue,
} from '../../../../shared-components/locale-input';
import { ImagePickerField } from '../../../../shared-components/image-picker';

/** og_image / event_image are stored as plain URL/id strings in the events module. */
function imageValueToSrc(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.url || '';
}

function getLengthStatus(len, min, max) {
  if (len === 0) return 'red';
  if (len >= min && len <= max) return 'green';
  return 'yellow';
}

const statusColor = (s) => (s === 'green' ? 'success' : s === 'yellow' ? 'warning' : 'error');
const statusLabel = (s) => (s === 'green' ? 'Good' : s === 'yellow' ? 'Needs tweak' : 'Missing');

function SeoTab({ control, errors }) {
  const titleValue = useWatch({ control, name: 'title' });
  const descriptionValue = useWatch({ control, name: 'description' });
  const metaTitleValue = useWatch({ control, name: 'meta_title' });
  const metaDescriptionValue = useWatch({ control, name: 'meta_description' });
  const metaKeywordsValue = useWatch({ control, name: 'meta_keywords' });
  const ogTitleValue = useWatch({ control, name: 'og_title' });
  const ogDescriptionValue = useWatch({ control, name: 'og_description' });
  const coverImage = useWatch({ control, name: 'event_image' });
  const ogImage = useWatch({ control, name: 'og_image' });

  const preferred = (value) => {
    const v = ensureLocaleValue(value);
    return v.en?.trim() || v.ar?.trim() || '';
  };

  const metaTitleLength = preferred(metaTitleValue).length || preferred(titleValue).length;
  const metaDescriptionLength = preferred(metaDescriptionValue).length;
  const keywordsLength = preferred(metaKeywordsValue).length;

  const ogPreview = imageValueToSrc(ogImage);
  const coverPreview = imageValueToSrc(coverImage);
  const previewImage = ogPreview || coverPreview || '';
  const usesCoverFallback = !ogPreview && !!coverPreview;

  const titleStatus = getLengthStatus(metaTitleLength, 50, 60);
  const descriptionStatus = getLengthStatus(metaDescriptionLength, 150, 160);
  const ogImageStatus = previewImage ? 'green' : 'red';
  const keywordsStatus = keywordsLength > 0 ? 'green' : 'red';

  const scoreMap = { green: 2, yellow: 1, red: 0 };
  const scoreRaw =
    scoreMap[titleStatus] +
    scoreMap[descriptionStatus] +
    scoreMap[ogImageStatus] +
    scoreMap[keywordsStatus];
  const scorePercent = Math.round((scoreRaw / 8) * 100);
  const scoreColor = scorePercent >= 75 ? 'success' : scorePercent >= 40 ? 'warning' : 'error';

  const socialTitle =
    preferred(ogTitleValue) || preferred(metaTitleValue) || preferred(titleValue) || 'Event title preview';
  const socialDescription =
    preferred(ogDescriptionValue) ||
    preferred(metaDescriptionValue) ||
    preferred(descriptionValue) ||
    'Event description preview';

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* ── SEO checklist ── */}
        <Grid item xs={12}>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.25,
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>SEO Checklist</Typography>
              <Chip label={`${scorePercent}%`} color={scoreColor} size="small" />
            </Box>
            <LinearProgress
              variant="determinate"
              value={scorePercent}
              color={scoreColor}
              sx={{ height: 8, borderRadius: 999, mb: 1.5 }}
            />
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2">Meta title length (50-60 chars): {metaTitleLength}</Typography>
                <Chip label={statusLabel(titleStatus)} color={statusColor(titleStatus)} size="small" />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  Meta description length (150-160 chars): {metaDescriptionLength}
                </Typography>
                <Chip
                  label={statusLabel(descriptionStatus)}
                  color={statusColor(descriptionStatus)}
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2">Social (OG) image available</Typography>
                <Chip label={statusLabel(ogImageStatus)} color={statusColor(ogImageStatus)} size="small" />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2">Meta keywords provided</Typography>
                <Chip label={statusLabel(keywordsStatus)} color={statusColor(keywordsStatus)} size="small" />
              </Box>
            </Stack>
          </Box>
        </Grid>

        {/* ── Meta fields ── */}
        <Grid item xs={12}>
          <Controller
            name="meta_title"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textField}
                label="Meta Title"
                error={!!errors.meta_title}
                helperText={errors.meta_title?.message || 'Defaults to the event title if left empty.'}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="meta_description"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textFieldMultiple}
                label="Meta Description"
                minRows={3}
                error={!!errors.meta_description}
                helperText={errors.meta_description?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="meta_keywords"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textField}
                label="Meta Keywords"
                error={!!errors.meta_keywords}
                helperText={errors.meta_keywords?.message || 'Comma-separated, e.g. TEDx, Damascus, ideas'}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="canonical_url"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Canonical URL"
                fullWidth
                placeholder="https://tedxdamascus.sy/en/events/event-slug"
                error={!!errors.canonical_url}
                helperText={errors.canonical_url?.message}
              />
            )}
          />
        </Grid>

        {/* ── Open Graph ── */}
        <Grid item xs={12}>
          <Controller
            name="og_image"
            control={control}
            render={({ field }) => (
              <ImagePickerField
                value={field.value}
                onChange={field.onChange}
                label="OG Image"
                error={!!errors.og_image}
                helperText={
                  errors.og_image?.message ||
                  (usesCoverFallback
                    ? 'Fallback active: the event cover image will be used for social sharing.'
                    : 'Image for social sharing. If empty, the event cover image is used.')
                }
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="og_title"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textField}
                label="OG Title"
                error={!!errors.og_title}
                helperText={errors.og_title?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="og_description"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textFieldMultiple}
                label="OG Description"
                minRows={3}
                error={!!errors.og_description}
                helperText={errors.og_description?.message}
              />
            )}
          />
        </Grid>

        {/* ── Social preview card ── */}
        <Grid item xs={12}>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1.5,
              overflow: 'hidden',
              maxWidth: 540,
            }}
          >
            <Box
              sx={{
                px: 1.5,
                py: 1,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Social Preview Card
              </Typography>
            </Box>
            <Box
              sx={{
                width: '100%',
                height: 210,
                bgcolor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Social card preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Typography variant="caption" color="text.secondary">
                  No preview image
                </Typography>
              )}
            </Box>
            <Box sx={{ p: 1.5 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  lineHeight: 1.35,
                  fontWeight: 700,
                  mb: 0.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {socialTitle}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {socialDescription}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SeoTab;
