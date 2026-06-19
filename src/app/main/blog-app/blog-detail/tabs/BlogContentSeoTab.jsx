import { Controller, useFieldArray, useWatch } from 'react-hook-form';
import {
  Autocomplete,
  Box,
  Grid,
  TextField,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Stack,
  Chip,
  LinearProgress,
  IconButton,
} from '@mui/material';
import { ExpandMore, Add, DeleteOutline } from '@mui/icons-material';
import {
  LocaleInput,
  localeInputTypes,
  ensureLocaleValue,
} from '../../../../shared-components/locale-input';
import RichTextEditor from '../../../../shared-components/rich-text-editor/RichTextEditor';
import {
  ImagePickerField,
  mediaFormValueToPreviewSrc,
} from '../../../../shared-components/image-picker';
import { CustomAutocomplete } from '../../../../shared-components/custom-autocomplete';

function BlogContentSeoTab({
  control,
  errors,
  onGenerateSlug,
  slugPreviewBase = '/blog',
  fetchRelatedBlogsOptions,
  fetchUserOptions,
  fetchCategoryOptions,
}) {
  const titleValue = useWatch({ control, name: 'title' });
  const descriptionValue = useWatch({ control, name: 'description' });
  const metaDescriptionValue = useWatch({ control, name: 'meta_description' });
  const metaKeywordsValue = useWatch({ control, name: 'meta_keywords' });
  const ogTitleValue = useWatch({ control, name: 'og_title' });
  const ogDescriptionValue = useWatch({ control, name: 'og_description' });
  const coverImage = useWatch({ control, name: 'blog_image' });
  const ogImage = useWatch({ control, name: 'og_image' });
  const coverPreview = mediaFormValueToPreviewSrc(coverImage);
  const ogPreview = mediaFormValueToPreviewSrc(ogImage);
  const previewImage = ogPreview || coverPreview || '';
  const usesCoverFallback = !ogPreview && !!coverPreview;
  const seoImageValue = ogPreview || coverPreview;

  const { fields, append, remove } = useFieldArray({ control, name: 'blog_references' });
  const watchedReferences = useWatch({ control, name: 'blog_references' });

  const getPreferredLocaleText = (value) => {
    const localized = ensureLocaleValue(value);
    return localized.en?.trim() || localized.ar?.trim() || '';
  };

  const titleLength = getPreferredLocaleText(titleValue).length;
  const descriptionLength = getPreferredLocaleText(metaDescriptionValue).length;
  const keywordsLength = getPreferredLocaleText(metaKeywordsValue).length;
  const socialPreviewTitle =
    getPreferredLocaleText(ogTitleValue) ||
    getPreferredLocaleText(titleValue) ||
    'Article title preview';
  const socialPreviewDescription =
    getPreferredLocaleText(ogDescriptionValue) ||
    getPreferredLocaleText(metaDescriptionValue) ||
    getPreferredLocaleText(descriptionValue) ||
    'Article description preview';
  const socialPreviewImage = previewImage;

  const getLengthStatus = (len, min, max) => {
    if (len === 0) return 'red';
    if (len >= min && len <= max) return 'green';
    return 'yellow';
  };

  const titleStatus = getLengthStatus(titleLength, 50, 60);
  const descriptionStatus = getLengthStatus(descriptionLength, 150, 160);
  const ogImageStatus = seoImageValue ? 'green' : 'red';
  const keywordsStatus = keywordsLength > 0 ? 'green' : 'red';

  const scoreMap = { green: 2, yellow: 1, red: 0 };
  const seoScoreRaw =
    scoreMap[titleStatus] +
    scoreMap[descriptionStatus] +
    scoreMap[ogImageStatus] +
    scoreMap[keywordsStatus];
  const seoScorePercent = Math.round((seoScoreRaw / 8) * 100);

  const scoreColor =
    seoScorePercent >= 75 ? 'success' : seoScorePercent >= 40 ? 'warning' : 'error';
  const statusColor = (status) =>
    status === 'green' ? 'success' : status === 'yellow' ? 'warning' : 'error';
  const statusLabel = (status) =>
    status === 'green' ? 'Good' : status === 'yellow' ? 'Needs tweak' : 'Missing';

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
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
              <Chip label={`${seoScorePercent}%`} color={scoreColor} size="small" />
            </Box>
            <LinearProgress
              variant="determinate"
              value={seoScorePercent}
              color={scoreColor}
              sx={{ height: 8, borderRadius: 999, mb: 1.5 }}
            />
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2">Title length (50-60 chars): {titleLength}</Typography>
                <Chip
                  label={statusLabel(titleStatus)}
                  color={statusColor(titleStatus)}
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  Meta description length (150-160 chars): {descriptionLength}
                </Typography>
                <Chip
                  label={statusLabel(descriptionStatus)}
                  color={statusColor(descriptionStatus)}
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2">OG image available</Typography>
                <Chip
                  label={statusLabel(ogImageStatus)}
                  color={statusColor(ogImageStatus)}
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2">Meta keywords provided</Typography>
                <Chip
                  label={statusLabel(keywordsStatus)}
                  color={statusColor(keywordsStatus)}
                  size="small"
                />
              </Box>
            </Stack>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textField}
                label="Title"
                required
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="slug"
            control={control}
            render={({ field }) => {
              const slugValue = ensureLocaleValue(field.value);
              const enPreview = slugValue.en?.trim()
                ? `${slugPreviewBase}/${slugValue.en.trim()}`
                : `${slugPreviewBase}/`;
              const arPreview = slugValue.ar?.trim()
                ? `${slugPreviewBase}/${slugValue.ar.trim()}`
                : `${slugPreviewBase}/`;

              return (
                <Stack spacing={1.25}>
                  <LocaleInput
                    {...field}
                    type={localeInputTypes.textField}
                    label="Slug"
                    error={!!errors.slug}
                    helperText={errors.slug?.message}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button size="small" variant="outlined" onClick={onGenerateSlug}>
                      Auto-generate from title
                    </Button>
                  </Box>
                  <Box sx={{ px: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      URL Preview (EN): {enPreview}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      URL Preview (AR): {arPreview}
                    </Typography>
                  </Box>
                </Stack>
              );
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value === 'published' ? 'published' : 'draft'}
                onChange={(e) => field.onChange(e.target.value)}
                select
                fullWidth
                label="Publication status"
                error={!!errors.status}
                helperText={
                  errors.status?.message ||
                  (field.value === 'published'
                    ? 'Article is visible when published on the site (per your backend rules).'
                    : 'Draft: save without publishing; you can publish later.')
                }
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
              </TextField>
            )}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            name="read_time"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Reading Time (minutes)"
                type="number"
                fullWidth
                inputProps={{ min: 1, step: 1 }}
                error={!!errors.read_time}
                helperText={errors.read_time?.message || 'Example: 5 min read'}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={Array.isArray(field.value) ? field.value : []}
                onChange={(_, newValue) => {
                  field.onChange(
                    (newValue || []).map((tag) => String(tag || '').trim()).filter(Boolean),
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Type and press Enter..."
                    helperText="Optional. Add multiple tags as text."
                    error={!!errors.tags}
                  />
                )}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Controller
            name="blog_category"
            control={control}
            render={({ field }) => (
              <CustomAutocomplete
                {...field}
                value={field.value ?? null}
                scope="blog-category-picker"
                fetchOptions={fetchCategoryOptions}
                label="Category"
                placeholder="Search categories..."
                helperText="Optional. Choose from blog categories managed under Blog → Categories."
                error={errors.blog_category}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Controller
            name="author_user"
            control={control}
            render={({ field }) => (
              <CustomAutocomplete
                {...field}
                value={field.value ?? null}
                scope="blog-author-user"
                fetchOptions={fetchUserOptions}
                label="Author (user)"
                placeholder="Search users..."
                helperText="Optional. Link this article to a dashboard user as author."
                error={errors.author_user}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="related_blogs"
            control={control}
            render={({ field }) => (
              <CustomAutocomplete
                {...field}
                scope="blog-related-blogs"
                multiple
                fetchOptions={fetchRelatedBlogsOptions}
                label="Related Blogs"
                placeholder="Search and select related blog articles..."
                helperText="Selected items are shown as tags and saved as related blog links."
                error={errors.related_blogs}
                filterSelectedOptions
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Accordion
            defaultExpanded={Boolean(fields.length)}
            disableGutters
            sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>References & sources</Typography>
                <Typography variant="caption" color="text.secondary">
                  Optional external links (name, description, URL). New rows are sent to the API
                  when you save the article.
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {fields.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No references yet. Add one or more for citations and further reading.
                  </Typography>
                )}
                {fields.map((item, index) => {
                  const row = watchedReferences?.[index];
                  const isSynced = Boolean(row?.reference_id);
                  const nameErr = errors.blog_references?.[index]?.name;
                  const urlErr = errors.blog_references?.[index]?.url;
                  return (
                    <Box
                      key={item.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 2,
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ mb: 1.5 }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="subtitle2">Reference {index + 1}</Typography>
                          {isSynced && (
                            <Chip size="small" label="Saved" color="success" variant="outlined" />
                          )}
                        </Stack>
                        <IconButton
                          size="small"
                          aria-label="Remove reference"
                          onClick={() => remove(index)}
                          color="default"
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Stack>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Controller
                            name={`blog_references.${index}.name`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                value={field.value ?? ''}
                                label="Name"
                                fullWidth
                                size="small"
                                placeholder="e.g. TED Talk source"
                                error={!!nameErr}
                                helperText={nameErr?.message}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} md={8}>
                          <Controller
                            name={`blog_references.${index}.url`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                value={field.value ?? ''}
                                label="URL"
                                fullWidth
                                size="small"
                                placeholder="https://"
                                error={!!urlErr}
                                helperText={urlErr?.message || 'Required for new references'}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Controller
                            name={`blog_references.${index}.desc`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                value={field.value ?? ''}
                                label="Description"
                                fullWidth
                                size="small"
                                multiline
                                minRows={2}
                                placeholder="Short note about this source"
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  );
                })}
                <Box>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => append({ name: '', desc: '', url: '', reference_id: undefined })}
                  >
                    Add reference
                  </Button>
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textFieldMultiple}
                label="Description"
                minRows={10}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="content"
            control={control}
            render={({ field }) => {
              const localeValue = ensureLocaleValue(field.value);
              return (
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}
                  >
                    Content (English)
                  </Typography>
                  <RichTextEditor
                    value={localeValue.en ?? ''}
                    onChange={(html) => field.onChange({ ...localeValue, en: html })}
                    placeholder="Write article content in English..."
                  />
                  <Typography
                    variant="subtitle2"
                    sx={{ mt: 3, mb: 1, fontWeight: 600, color: 'text.secondary' }}
                  >
                    Content (Arabic)
                  </Typography>
                  <RichTextEditor
                    value={localeValue.ar ?? ''}
                    onChange={(html) => field.onChange({ ...localeValue, ar: html })}
                    placeholder="اكتب محتوى المقال بالعربية..."
                  />
                  {errors.content && (
                    <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, mx: 1.5 }}>
                      {errors.content.message}
                    </Box>
                  )}
                </Box>
              );
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="blog_image"
            control={control}
            render={({ field }) => (
              <ImagePickerField
                valueMode="mediaRef"
                value={field.value}
                onChange={field.onChange}
                label="Cover Image"
                error={!!errors.blog_image}
                helperText={
                  errors.blog_image?.message || 'Used as article cover and OG fallback image.'
                }
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Accordion
            defaultExpanded={false}
            disableGutters
            sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>SEO Settings</Typography>
                <Typography variant="caption" color="text.secondary">
                  Manage metadata, canonical URL, and Open Graph fields.
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
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
                        helperText={errors.meta_title?.message}
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
                        helperText={errors.meta_keywords?.message}
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
                        placeholder="https://example.com/blog/article-slug"
                        error={!!errors.canonical_url}
                        helperText={errors.canonical_url?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="og_image"
                    control={control}
                    render={({ field }) => (
                      <ImagePickerField
                        valueMode="mediaRef"
                        value={field.value}
                        onChange={field.onChange}
                        label="OG Image"
                        error={!!errors.og_image}
                        helperText={
                          errors.og_image?.message ||
                          (usesCoverFallback
                            ? 'Fallback active: cover image will be used for social preview.'
                            : 'Select a dedicated image for social sharing. If empty, cover image is used.')
                        }
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{
                      border: '1px dashed',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 1.5,
                      bgcolor: 'background.default',
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mb: 1 }}
                    >
                      Social image preview source:{' '}
                      {ogImage
                        ? 'OG image (custom)'
                        : coverImage
                          ? 'Cover image fallback'
                          : 'No image selected'}
                    </Typography>
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Social preview"
                        style={{
                          width: '100%',
                          maxHeight: 180,
                          objectFit: 'cover',
                          borderRadius: 8,
                        }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Select cover image and/or OG image to preview social thumbnail.
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      bgcolor: 'background.paper',
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
                    <Box sx={{ p: 1.5 }}>
                      <Box
                        sx={{
                          width: '100%',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1.5,
                          overflow: 'hidden',
                          maxWidth: 540,
                          bgcolor: 'background.paper',
                        }}
                      >
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
                          {socialPreviewImage ? (
                            <img
                              src={socialPreviewImage}
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
                            {socialPreviewTitle}
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
                            {socialPreviewDescription}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
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
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Box>
  );
}

export default BlogContentSeoTab;
