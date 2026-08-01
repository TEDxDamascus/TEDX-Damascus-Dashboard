import { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { addCustomTier, selectCustomTiers } from '../../customTiersSlice';
import TierSizePicker from './TierSizePicker';
import { CARD_SIZES } from '../models/partnerTiers';

const DEFAULT_SIZE = CARD_SIZES[0]?.value || 'small';

function CustomTierField({
  name,
  cardSize,
  onChange,
  error,
  helperText,
}) {
  const dispatch = useDispatch();
  const customTiers = useSelector(selectCustomTiers);

  const [draftName, setDraftName] = useState(name || '');
  const [draftSize, setDraftSize] = useState(cardSize || DEFAULT_SIZE);

  const existingTier = useMemo(() => {
    const value = draftName.trim().toLowerCase();

    if (!value) return null;

    return customTiers.find(
      (tier) => tier.name.trim().toLowerCase() === value,
    );
  }, [customTiers, draftName]);

  useEffect(() => {
    if (!existingTier) return;

    onChange({
      name: existingTier.name,
      custom_card_size: existingTier.card_size,
    });
  }, [existingTier]);

  const handleNameChange = (e) => {
    const value = e.target.value;

    setDraftName(value);

    if (
      !customTiers.some(
        (tier) =>
          tier.name.trim().toLowerCase() === value.trim().toLowerCase(),
      )
    ) {
      onChange({
        name: value,
        custom_card_size: draftSize,
      });
    }
  };

  const handleSaveTier = () => {
    const trimmedName = draftName.trim();

    if (!trimmedName || existingTier) return;

    dispatch(
      addCustomTier({
        name: trimmedName,
        card_size: draftSize,
      }),
    );

    onChange({
      name: trimmedName,
      custom_card_size: draftSize,
    });
  };

  return (
    <Box className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <TextField
        label="Partner Type"
        value={draftName}
        onChange={handleNameChange}
        fullWidth
        size="small"
        error={!!error}
        helperText={helperText}
      />

      {existingTier ? (
        <>
          <Alert severity="info">
            This partner tier already exists.
          </Alert>

          <Typography variant="body2">
            Selected Card Size:{' '}
            <strong>{existingTier.card_size}</strong>
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="body2" className="font-medium text-gray-600">
            Card Size
          </Typography>

          <TierSizePicker
            value={draftSize}
            onChange={setDraftSize}
          />

          <Button
            variant="contained"
            onClick={handleSaveTier}
            disabled={!draftName.trim()}
            sx={{
              alignSelf: 'flex-start',
              bgcolor: 'var(--color-primary)',
              '&:hover': {
                bgcolor: 'var(--color-primary-dark)',
              },
            }}
          >
            Save Type
          </Button>
        </>
      )}
    </Box>
  );
}

export default CustomTierField;