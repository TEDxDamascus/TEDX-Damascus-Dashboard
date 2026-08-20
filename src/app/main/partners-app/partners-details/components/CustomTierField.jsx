import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import TierSizePicker from './TierSizePicker';
import {
  CARD_SIZES,
  isFixedTier,
} from '../models/partnerTiers';

import partnersApi, {
  useUpdatePartnerMutation,
} from '../../PartnersApi';

const DEFAULT_SIZE =
  CARD_SIZES[0]?.value || 'small';

const FETCH_PAGE_SIZE = 100;
const MAX_PAGES = 50;

function CustomTierField({
  name,
  cardSize,
  onChange,
  error,
  helperText,
}) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const [updatePartner] =
    useUpdatePartnerMutation();

  const [allPartners, setAllPartners] =
    useState([]);

  const [tiersLoading, setTiersLoading] =
    useState(true);

  const [isApplyingToAll, setIsApplyingToAll] =
    useState(false);

  const [draftName, setDraftName] =
    useState(name || '');

  const [draftSize, setDraftSize] =
    useState(cardSize || DEFAULT_SIZE);


  const fetchAllPartners = useCallback(
    async () => {
      setTiersLoading(true);

      let page = 1;
      let collected = [];

      try {
        while (page <= MAX_PAGES) {
          const res = await dispatch(
            partnersApi.endpoints.getPartners.initiate(
              {
                page,
                pageSize: FETCH_PAGE_SIZE,
              },
              {
                forceRefetch: true,
              }
            )
          ).unwrap();

          const items =
            res?.data?.items ?? [];

          const total =
            res?.data?.total ??
            items.length;

          collected =
            collected.concat(items);

          if (
            items.length < FETCH_PAGE_SIZE ||
            collected.length >= total
          ) {
            break;
          }

          page += 1;
        }

        setAllPartners(collected);
      } catch (e) {
        console.error(
          'Failed to load partner types',
          e
        );
      } finally {
        setTiersLoading(false);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    fetchAllPartners();
  }, [fetchAllPartners]);

  const tiersMap = useMemo(() => {
    const map = new Map();

    allPartners.forEach((partner) => {
   
      const rawName =
        partner.tier?.name?.trim() ||
        partner.partner_ship_type?.trim();

      if (!rawName) {
        return;
      }

      const normalizedName =
        rawName.toLowerCase();
      if (
        isFixedTier(normalizedName)
      ) {
        return;
      }

      const key = normalizedName;

      const partnerSize =
        partner.tier?.size ||
        partner.custom_card_size ||
        DEFAULT_SIZE;

      const entry =
        map.get(key) || {
          name: rawName,
          card_size: partnerSize,
          partnerIds: [],
        };
      if (
        partner.tier?.size ||
        partner.custom_card_size
      ) {
        entry.card_size =
          partner.tier?.size ||
          partner.custom_card_size;
      }
      if (partner._id) {
        entry.partnerIds.push(
          partner._id
        );
      }

      map.set(key, entry);
    });

    return map;
  }, [allPartners]);
  const tiers = useMemo(
    () => Array.from(tiersMap.values()),
    [tiersMap]
  );
  const existingTier =
    tiersMap.get(
      draftName
        .trim()
        .toLowerCase()
    ) || null;
  useEffect(() => {
    if (!existingTier) {
      return;
    }

    if (
      draftSize !==
      existingTier.card_size
    ) {
      setDraftSize(
        existingTier.card_size
      );
    }
  }, [
    existingTier?.name,
    existingTier?.card_size,
  ]);


  const handleNameChange = (value) => {
    const newName = value || '';

    setDraftName(newName);

    const normalizedValue =
      newName.trim().toLowerCase();

    const matched =
      tiersMap.get(normalizedValue);

    if (matched) {
      setDraftSize(
        matched.card_size
      );

      onChange({
        name: matched.name,
        custom_card_size:
          matched.card_size,
      });

      return;
    }

    onChange({
      name: newName,
      custom_card_size:
        draftSize,
    });
  };


  const handleSizeChange = (size) => {
    setDraftSize(size);

    onChange({
      name: draftName,
      custom_card_size: size,
    });
  };

  const sizeChanged =
    !!existingTier &&
    draftSize !==
      existingTier.card_size;

  const handleApplyToAll = async () => {
    if (
      !existingTier?.partnerIds?.length
    ) {
      return;
    }

    setIsApplyingToAll(true);

    try {
      await Promise.all(
        existingTier.partnerIds.map(
          (id) =>
            updatePartner({
              id,
              data: {
                custom_card_size:
                  draftSize,
              },
            }).unwrap()
        )
      );

      enqueueSnackbar(
        `Updated ${existingTier.partnerIds.length} partner(s)`,
        {
          variant: 'success',
        }
      );

      await fetchAllPartners();
    } catch (e) {
      console.error(
        'Failed to update partner sizes',
        e
      );

      enqueueSnackbar(
        'Failed to update some partners',
        {
          variant: 'error',
        }
      );
    } finally {
      setIsApplyingToAll(false);
    }
  };

  return (
    <Box className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">

      {/* Partner Type Selector */}

      <Autocomplete
        freeSolo
        loading={tiersLoading}
        options={tiers.map(
          (tier) => tier.name
        )}
        inputValue={draftName}
        onInputChange={(
          _event,
          value
        ) => {
          handleNameChange(
            value || ''
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Partner Type"
            fullWidth
            size="small"
            error={!!error}
            helperText={helperText}
            inputProps={{
              ...params.inputProps,
              autoComplete: 'off',
            }}
          />
        )}
      />

      {/* Existing Type Info */}

      {existingTier && (
        <Alert severity="info">
          This type is already used by{' '}
          {existingTier.partnerIds.length}{' '}
          partner(s) — its card size
          was loaded automatically.
        </Alert>
      )}

      {/* Card Size */}

      <Typography
        variant="body2"
        className="font-medium text-gray-600"
      >
        Card Size
      </Typography>

      <TierSizePicker
        value={draftSize}
        onChange={
          handleSizeChange
        }
      />

      {/* Apply to all */}

      {sizeChanged && (
        <Button
          variant="outlined"
          onClick={
            handleApplyToAll
          }
          disabled={
            isApplyingToAll
          }
          startIcon={
            isApplyingToAll ? (
              <CircularProgress
                size={14}
              />
            ) : null
          }
        >
          {isApplyingToAll
            ? 'Updating...'
            : `Apply "${draftSize}" size to all ${existingTier.partnerIds.length} partner(s) of this type`}
        </Button>
      )}
    </Box>
  );
}

export default CustomTierField;