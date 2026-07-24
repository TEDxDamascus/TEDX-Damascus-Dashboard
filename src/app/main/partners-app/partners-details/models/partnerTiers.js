export const FIXED_TIERS = [
  { value: 'platinum', label: 'Platinum', card_size: 'large' },
  { value: 'gold', label: 'Gold', card_size: 'medium' },
  { value: 'silver', label: 'Silver', card_size: 'small' },
  { value: 'other', label: 'Other' },
];

export const CARD_SIZES = [
  { value: 'large', label: 'Large', description: 'Big feature card with image, description and buttons' },
  { value: 'medium', label: 'Medium', description: '2-up card with a short description' },
  { value: 'small', label: 'Small', description: 'Compact badge with just the name' },
];

export const getFixedTier = (value) => FIXED_TIERS.find((tier) => tier.value === value);

export const isFixedTier = (value) => FIXED_TIERS.some((tier) => tier.value === value && value !== 'other');
