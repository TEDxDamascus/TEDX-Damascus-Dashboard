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
import ServicesTab from './tabs/ServicesTab';
import PartnerModel from './models/PartnerModel';
import { ensureLocaleValue } from '../../../shared-components/locale-input';
import { getFixedTier, getTierDisplayLabel } from './models/partnerTiers';
import {
  assignOptionalArray,
  assignOptionalLocale,
  assignOptionalObject,
  assignOptionalString,
  getApiErrorMessage,
} from '../../../shared/apiError';

const translationDtoSchema = (fieldLabel = 'This field') =>
  z.object({
    en: z
      .string()
      .min(1, `${fieldLabel} (English) is required`)
      .min(4, `${fieldLabel} (English) must be at least 4 characters`)
      .max(1000, `${fieldLabel} (English) must not exceed 1000 characters`),
    ar: z
      .string()
      .min(1, `${fieldLabel} (Arabic) is required`)
      .min(4, `${fieldLabel} (Arabic) must be at least 4 characters`)
      .max(1000, `${fieldLabel} (Arabic) must not exceed 1000 characters`),
  });

const localeFieldSchema = z.object({
  en: z.string().optional().or(z.literal('')),
  ar: z.string().optional().or(z.literal('')),
});

const isLocaleEmpty = (val) => !val?.en?.trim() && !val?.ar?.trim();

const checkLocaleField = (value, label, basePath, ctx) => {
  ['en', 'ar'].forEach((locale) => {
    const text = value?.[locale]?.trim() || '';
    const localeName = locale === 'en' ? 'English' : 'Arabic';
    if (!text) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${label} (${localeName}) is required`,
        path: [...basePath, locale],
      });
    } else if (text.length < 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${label} (${localeName}) must be at least 4 characters`,
        path: [...basePath, locale],
      });
    }
  });
};

const partnerSchema = z.object({
  name: translationDtoSchema('Name'),
  slug: translationDtoSchema('Slug'),

  image: z.string().url('Image must be a valid URL').optional().or(z.literal('')),

  partner_ship_type: z
    .string()
    .min(4, 'Partner type must be at least 4 characters')
    .max(25, 'Partner type must not exceed 25 characters'),

  custom_card_size: z.string().optional(),

  year: z.coerce
    .number({ required_error: 'Year is required', invalid_type_error: 'Year must be a number' })
    .int('Year must be a whole number')
    .min(2026, 'Year must be 2026 or later')
    .max(2060, 'Year must be 2060 or earlier'),

  short_description: translationDtoSchema('Short description'),
  long_description: translationDtoSchema('Long description'),

  social_links: z
    .array(z.string().min(1, 'Link cannot be empty'))
    .optional(),

  contact_info: z
    .object({
      email: z.string().optional().or(z.literal('')),
      phone: z.string().optional().or(z.literal('')),
      address: z
        .object({
          en: z.string().optional().or(z.literal('')),
          ar: z.string().optional().or(z.literal('')),
        })
        .optional(),
    })
    .optional()
    .superRefine((val, ctx) => {
      if (!val) return;

      const hasAnyValue =
        !!val.email?.trim() ||
        !!val.phone?.trim() ||
        !!val.address?.en?.trim() ||
        !!val.address?.ar?.trim();

      if (!hasAnyValue) return;

      if (!val.email?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Email is required',
          path: ['email'],
        });
      } else if (!z.string().email().safeParse(val.email).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid email address',
          path: ['email'],
        });
      }

      if (!val.phone?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Phone number is required',
          path: ['phone'],
        });
      }
    }),

  services: z
    .array(
      z.object({
        title: localeFieldSchema,
        description: localeFieldSchema,
      }),
    )
    .optional()
    .superRefine((arr, ctx) => {
      if (!arr) return;
      arr.forEach((item, index) => {
        const empty = isLocaleEmpty(item.title) && isLocaleEmpty(item.description);
        if (empty) return;

        checkLocaleField(item.title, 'Service title', [index, 'title'], ctx);
        checkLocaleField(item.description, 'Service description', [index, 'description'], ctx);
      });
    }),
});

const TAB_FIELDS = [
  [
    'name',
    'slug',
    'image',
    'partner_ship_type',
    'custom_card_size',
    'year',
    'short_description',
    'long_description',
  ],
  ['social_links', 'contact_info'],
  ['services'],
];

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
    register,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(partnerSchema),
    defaultValues: PartnerModel(),
  });

  useEffect(() => {
    if (partner && !isNew) {
      const rawType = partner.tier?.name || partner.partner_ship_type || '';

      reset({
        name: ensureLocaleValue(partner.name),
        slug: ensureLocaleValue(partner.slug),
        image: partner.image || '',
        partner_ship_type: getTierDisplayLabel(rawType),
        custom_card_size: partner.custom_card_size || partner.tier?.custom_card_size || '',
        year: partner.year || new Date().getFullYear(),
        short_description: ensureLocaleValue(partner.short_description),
        long_description: ensureLocaleValue(partner.long_description),
        social_links:
          Array.isArray(partner.social_links) && partner.social_links.length
            ? partner.social_links
            : [''],
        contact_info: {
          email: partner.contact_info?.email || '',
          phone: partner.contact_info?.phone || '',
          address: ensureLocaleValue(partner.contact_info?.address),
        },
        services: Array.isArray(partner.services)
          ? partner.services.map((s) => ({
              title: ensureLocaleValue(s.title),
              description: ensureLocaleValue(s.description),
            }))
          : [],
      });
    }
  }, [partner, isNew, reset]);

 const onSubmit = async (formData) => {
  try {
    const cleanedSocialLinks = (formData.social_links || [])
      .map((link) => (typeof link === 'string' ? link.trim() : ''))
      .filter((link) => link !== '');

    // =========================
    // CLEAN CONTACT INFO
    // =========================

    const email = formData.contact_info?.email?.trim() || '';
    const phone = formData.contact_info?.phone?.trim() || '';
    const addressEn = formData.contact_info?.address?.en?.trim() || '';
    const addressAr = formData.contact_info?.address?.ar?.trim() || '';

    const hasAddress = !!addressEn || !!addressAr;
    const hasContactInfo = !!email || !!phone || hasAddress;

    let cleanedContactInfo;
    if (hasContactInfo) {
      cleanedContactInfo = {};
      assignOptionalString(cleanedContactInfo, 'email', email, !isNew);
      assignOptionalString(cleanedContactInfo, 'phone', phone, !isNew);
      assignOptionalLocale(
        cleanedContactInfo,
        'address',
        { en: addressEn, ar: addressAr },
        !isNew,
        false,
      );
    }

    // =========================
    // CLEAN SERVICES
    // =========================

    const cleanedServices = (formData.services || []).filter(
      (s) =>
        s.title?.en?.trim() ||
        s.title?.ar?.trim() ||
        s.description?.en?.trim() ||
        s.description?.ar?.trim(),
    );

    // =========================
    // PARTNER TIER
    // =========================

    const rawType = formData.partner_ship_type || '';
    const fixedTier = getFixedTier(rawType);

    const tierEnumMap = {
      diamond: 'Diamond',
      platinum: 'Platinum',
      gold: 'Gold',
      silver: 'Silver',
    };

    const tierType = fixedTier
      ? tierEnumMap[fixedTier.value] || 'Other'
      : 'Other';

    // =========================
    // PAYLOAD
    // =========================

    const payload = {
      name: formData.name,
      slug: formData.slug,

      image: formData.image || undefined,

      tier: {
        type: tierType,
        name: rawType,
        size: formData.custom_card_size || undefined,
      },

      partner_ship_type: rawType,
      custom_card_size: formData.custom_card_size || undefined,

      year: formData.year,

      short_description: formData.short_description,
      long_description: formData.long_description,
    };

    assignOptionalObject(payload, 'contact_info', cleanedContactInfo, !isNew);
    assignOptionalArray(payload, 'social_links', cleanedSocialLinks, !isNew);
    assignOptionalArray(payload, 'services', cleanedServices, !isNew);

    // =========================
    // CREATE / UPDATE
    // =========================

    if (isNew) {
      await createPartner(payload).unwrap();

      enqueueSnackbar('Partner created successfully', {
        variant: 'success',
      });
    } else {
      await updatePartner({
        id: partnerId,
        data: payload,
      }).unwrap();

      enqueueSnackbar('Partner updated successfully', {
        variant: 'success',
      });
    }

    navigate('/partners');
  } catch (error) {
    console.error('Save failed:', error);

    enqueueSnackbar(
      getApiErrorMessage(error, `Failed to ${isNew ? 'create' : 'update'} partner`),
      {
        variant: 'error',
      },
    );
  }
};

  const onInvalid = (formErrors) => {
    enqueueSnackbar('Please fix the highlighted fields before saving', { variant: 'error' });

    const errorFieldNames = Object.keys(formErrors);
    const tabIndex = TAB_FIELDS.findIndex((fields) =>
      fields.some((f) => errorFieldNames.includes(f)),
    );

    if (tabIndex !== -1) {
      setCurrentTab(tabIndex);
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
            onClick={handleSubmit(onSubmit, onInvalid)}
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
          <Tab
            label="Partner Information"
            sx={{ color: TAB_FIELDS[0].some((f) => errors[f]) ? 'error.main' : undefined }}
          />
          <Tab
            label="Social & Contact Links"
            sx={{ color: TAB_FIELDS[1].some((f) => errors[f]) ? 'error.main' : undefined }}
          />
          <Tab
            label="Services"
            sx={{ color: TAB_FIELDS[2].some((f) => errors[f]) ? 'error.main' : undefined }}
          />
        </Tabs>
        <Box>
          {currentTab === 0 && (
            <BasicInfoTab control={control} errors={errors} setValue={setValue} />
          )}
          {currentTab === 1 && <SocialLinksTab control={control} errors={errors} />}
          {currentTab === 2 && (
            <ServicesTab control={control} register={register} errors={errors} />
          )}
        </Box>
      </Paper>
    </div>
  );
}

export default Partner;
