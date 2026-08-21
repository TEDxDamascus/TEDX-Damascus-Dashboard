export const FIXED_TIERS = [
  {
    value: 'platinum',
    label: 'Diamond',
    size: null,
  },
  {
    value: 'gold',
    label: 'Gold',
    size: null,
  },
  {
    value: 'silver',
    label: 'Silver',
    size: null,
  },
];

export const CARD_SIZES = [
  { value: 'large', label: 'Large' },
  { value: 'medium', label: 'Medium' },
  { value: 'small', label: 'Small' },
];

export const getFixedTier = (value) => {
  const normalizedValue = value?.trim().toLowerCase();

  return FIXED_TIERS.find(
    (tier) =>
      tier.value === normalizedValue ||
      tier.label.toLowerCase() === normalizedValue
  );
};

export const isFixedTier = (value) => !!getFixedTier(value);

export const getTierDisplayLabel = (value) => {
  const fixed = getFixedTier(value);

  return fixed ? fixed.label : value;
};