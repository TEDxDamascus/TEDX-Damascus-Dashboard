import { Box, Typography } from '@mui/material';
import { CARD_SIZES } from '../models/partnerTiers';

function SizeGraphic({ size }) {
  if (size === 'large') {
    return (
      <Box className="flex h-16 w-full gap-2 rounded-md border border-gray-300 bg-white p-2">
        <Box className="h-full w-1/3 rounded bg-gray-300" />
        <Box className="flex flex-1 flex-col justify-center gap-1">
          <Box className="h-2 w-3/4 rounded bg-gray-400" />
          <Box className="h-1.5 w-full rounded bg-gray-200" />
          <Box className="h-1.5 w-5/6 rounded bg-gray-200" />
        </Box>
      </Box>
    );
  }

  if (size === 'medium') {
    return (
      <Box className="flex h-16 w-full flex-col gap-1 rounded-md border border-gray-300 bg-white p-2">
        <Box className="h-6 w-6 rounded bg-gray-300" />
        <Box className="h-1.5 w-2/3 rounded bg-gray-400" />
        <Box className="h-1.5 w-full rounded bg-gray-200" />
      </Box>
    );
  }

  return (
    <Box className="flex h-16 w-full items-center justify-center rounded-md border border-gray-300 bg-white p-2">
      <Box className="h-4 w-2/3 rounded-full bg-gray-300" />
    </Box>
  );
}

function TierSizePicker({ value, onChange }) {
  return (
    <Box className="flex gap-3">
      {CARD_SIZES.map((option) => {
        const isSelected = value === option.value;
        return (
          <Box
            key={option.value}
            onClick={() => onChange(option.value)}
            className="flex-1 cursor-pointer rounded-lg border-2 p-2 transition-colors"
            sx={{
              borderColor: isSelected ? 'var(--color-primary)' : '#e0e0e0',
              bgcolor: isSelected ? 'rgba(235, 0, 40, 0.04)' : 'transparent',
            }}
          >
            <SizeGraphic size={option.value} />
            <Typography
              variant="body2"
              className="mt-1 text-center font-medium"
              sx={{ color: isSelected ? 'var(--color-primary)' : 'text.secondary' }}
            >
              {option.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

export default TierSizePicker;
