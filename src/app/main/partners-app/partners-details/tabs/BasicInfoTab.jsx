import { useEffect, useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import {
  Grid,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import { LocaleInput, localeInputTypes } from '../../../../shared-components/locale-input';
import { ImagePickerField } from '../../../../shared-components/image-picker';
import CustomTierField from '../components/CustomTierField';
import { FIXED_TIERS, getFixedTier, isFixedTier } from '../models/partnerTiers';

function BasicInfoTab({ control, errors, setValue }) {
  const partnershipType = useWatch({ control, name: 'partnership_type' });
  const cardSize = useWatch({ control, name: 'card_size' });

  const [category, setCategory] = useState(() => {
    if (!partnershipType) return '';
    return isFixedTier(partnershipType) ? partnershipType : 'other';
  });

  useEffect(() => {
    if (!partnershipType) {
      setCategory('');
    } else if (isFixedTier(partnershipType)) {
      setCategory(partnershipType);
    } else {
      setCategory('other');
    }
  }, [partnershipType]);

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    setCategory(value);
    if (value === 'other') {
      setValue('partnership_type', '', { shouldValidate: true });
      setValue('card_size', '', { shouldValidate: true });
    } else {
      const fixedTier = getFixedTier(value);
      setValue('partnership_type', fixedTier.label, { shouldValidate: true });
      setValue('card_size', fixedTier.card_size, { shouldValidate: true });
    }
  };

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
                label="Partner Name"
                required
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="slug"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textField}
                label="Slug"
                error={!!errors.slug}
                helperText={errors.slug?.message}
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
                label="Partner Logo / Image"
                required
                error={!!errors.image}
                helperText={errors.image?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth required error={!!errors.partnership_type}>
            <InputLabel required>Partnership Type</InputLabel>
            <Select label="Partnership Type" value={category} onChange={handleCategoryChange}>
              {FIXED_TIERS.map((tier) => (
                <MenuItem key={tier.value} value={tier.value}>
                  {tier.label}
                </MenuItem>
              ))}
            </Select>
            {!!errors.partnership_type && category !== 'other' && (
              <FormHelperText>{errors.partnership_type.message}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {category === 'other' && (
          <Grid item xs={12}>
            <CustomTierField
              name={partnershipType}
              cardSize={cardSize}
              error={!!errors.partnership_type || !!errors.card_size}
              helperText={errors.partnership_type?.message || errors.card_size?.message}
              onChange={({ name, card_size }) => {
                setValue('partnership_type', name, { shouldValidate: true });
                setValue('card_size', card_size, { shouldValidate: true });
              }}
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <Controller
            name="short_description"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textFieldMultiple}
                label="Short Description"
                minRows={2}
                error={!!errors.short_description}
                helperText={errors.short_description?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="long_description"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                type={localeInputTypes.textFieldMultiple}
                label="Long Description"
                minRows={4}
                error={!!errors.long_description}
                helperText={errors.long_description?.message}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default BasicInfoTab;