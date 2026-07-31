export const FIXED_TIERS = [
  {
    value: "diamond",
    label: "Diamond",
    size: null, // ✅ Diamond ما إلها size — القياس محدد بتصميم الموقع نفسه (full layout)
  },
  {
    value: "gold",
    label: "Gold",
    size: null,
  },
  {
    value: "silver",
    label: "Silver",
    size: null,
  },
];

export const CARD_SIZES = [
  {
    value: "large",
    label: "Large",
  },
  {
    value: "medium",
    label: "Medium",
  },
  {
    value: "small",
    label: "Small",
  },
];

export const getFixedTier = (value) =>
  FIXED_TIERS.find((tier) => tier.value === value);

export const isFixedTier = (value) =>
  FIXED_TIERS.some((tier) => tier.value === value);