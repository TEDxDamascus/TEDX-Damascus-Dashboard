import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Typography,
  Divider,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { addCustomTier, selectCustomTiers } from '../../customTiersSlice';
import TierSizePicker from './TierSizePicker';

const CREATE_NEW_VALUE = '__create_new__';

function CustomTierField({ name, cardSize, onChange, error, helperText }) {
  const dispatch = useDispatch();
  const customTiers = useSelector(selectCustomTiers);

  const matchingTier = useMemo(
    () => customTiers.find((tier) => tier.name === name && tier.card_size === cardSize),
    [customTiers, name, cardSize],
  );

  const [mode, setMode] = useState(matchingTier ? matchingTier.id : customTiers.length ? '' : CREATE_NEW_VALUE);
  const [draftName, setDraftName] = useState(matchingTier ? '' : name || '');
  const [draftSize, setDraftSize] = useState(matchingTier ? 'small' : cardSize || 'small');

  const handleSelectExisting = (event) => {
    const selected = event.target.value;
    setMode(selected);
    if (selected === CREATE_NEW_VALUE) {
      setDraftName('');
      setDraftSize('small');
      return;
    }
    const tier = customTiers.find((t) => t.id === selected);
    if (tier) {
      onChange({ name: tier.name, card_size: tier.card_size });
    }
  };

  const handleSaveTier = () => {
    const trimmedName = draftName.trim();
    if (!trimmedName) return;
    dispatch(addCustomTier({ name: trimmedName, card_size: draftSize }));
    onChange({ name: trimmedName, card_size: draftSize });
  };

  return (
    <Box className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      {customTiers.length > 0 && (
        <FormControl fullWidth size="small" className="mb-3">
          <InputLabel>Custom Partner Type</InputLabel>
          <Select label="Custom Partner Type" value={mode} onChange={handleSelectExisting}>
            {customTiers.map((tier) => (
              <MenuItem key={tier.id} value={tier.id}>
                {tier.name} · {tier.card_size}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem value={CREATE_NEW_VALUE}>
              <Add fontSize="small" className="mr-1" /> Create new type
            </MenuItem>
          </Select>
        </FormControl>
      )}

      {(mode === CREATE_NEW_VALUE || customTiers.length === 0) && (
        <Box className="flex flex-col gap-3">
          <TextField
            label="Custom Type Name (e.g. Media Sponsor)"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            fullWidth
            size="small"
            error={!!error}
            helperText={helperText}
          />
          <Typography variant="body2" className="font-medium text-gray-600">
            Card Size
          </Typography>
          <TierSizePicker value={draftSize} onChange={setDraftSize} />
          <Button
            variant="contained"
            onClick={handleSaveTier}
            disabled={!draftName.trim()}
            sx={{
              alignSelf: 'flex-start',
              bgcolor: 'var(--color-primary)',
              '&:hover': { bgcolor: 'var(--color-primary-dark)' },
            }}
          >
            Save Type
          </Button>
        </Box>
      )}

      {name && cardSize && mode !== CREATE_NEW_VALUE && customTiers.length > 0 && (
        <Typography variant="caption" className="text-gray-500">
          Selected: {name} ({cardSize})
        </Typography>
      )}
    </Box>
  );
}

export default CustomTierField;
