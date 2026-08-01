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
  TextField,
} from '@mui/material';

import { LocaleInput, localeInputTypes } from '../../../../shared-components/locale-input';
import { ImagePickerField } from '../../../../shared-components/image-picker';
import CustomTierField from '../components/CustomTierField';
import { FIXED_TIERS, getFixedTier, isFixedTier } from '../models/partnerTiers';

function BasicInfoTab({ control, errors, setValue }) {
  const partnershipType = useWatch({ control, name: 'partner_ship_type' });
  const cardSize = useWatch({ control, name: 'custom_card_size' });

  const [category, setCategory] = useState('');

  useEffect(() => {
    if (!partnershipType) {
      setCategory('');
      return;
    }
    setCategory(isFixedTier(partnershipType) ? partnershipType : 'other');
  }, [partnershipType]);

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    setCategory(value);

    if (value === 'other') {
      setValue('partner_ship_type', '', { shouldValidate: true });
      setValue('custom_card_size', '', { shouldValidate: true });
      return;
    }

    const tier = getFixedTier(value);
    setValue('partner_ship_type', value, { shouldValidate: true });
    setValue('custom_card_size', tier.size || '', { shouldValidate: true });
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
                helperText={errors.name?.en?.message || errors.name?.ar?.message}
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
                required
                error={!!errors.slug}
                helperText={errors.slug?.en?.message || errors.slug?.ar?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="year"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Year"
                required
                fullWidth
                error={!!errors.year}
                helperText={errors.year?.message}
                onChange={(e) => field.onChange(e.target.value)}
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
          <FormControl fullWidth required error={!!errors.partner_ship_type}>
            <InputLabel>Partnership Type</InputLabel>
            <Select value={category} label="Partnership Type" onChange={handleCategoryChange}>
              {FIXED_TIERS.map((tier) => (
                <MenuItem key={tier.value} value={tier.value}>
                  {tier.label}
                </MenuItem>
              ))}
              <MenuItem value="other">Other</MenuItem>
            </Select>
            {errors.partner_ship_type && (
              <FormHelperText>{errors.partner_ship_type.message}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {category === 'other' && (
          <Grid item xs={12}>
            <CustomTierField
              name={partnershipType}
              cardSize={cardSize}
              error={!!errors.partner_ship_type || !!errors.custom_card_size}
              helperText={errors.partner_ship_type?.message || errors.custom_card_size?.message}
              onChange={({ name, custom_card_size }) => {
                setValue('partner_ship_type', name, { shouldValidate: true });
                setValue('custom_card_size', custom_card_size, { shouldValidate: true });
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
                required
                minRows={2}
                error={!!errors.short_description}
                helperText={
                  errors.short_description?.en?.message || errors.short_description?.ar?.message
                }
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
                required
                minRows={4}
                error={!!errors.long_description}
                helperText={
                  errors.long_description?.en?.message || errors.long_description?.ar?.message
                }
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default BasicInfoTab;