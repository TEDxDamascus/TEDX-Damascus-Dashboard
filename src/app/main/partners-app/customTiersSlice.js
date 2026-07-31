import { createSlice } from '@reduxjs/toolkit';

const CUSTOM_TIERS_STORAGE_KEY = 'tedx_custom_partner_tiers';

const getStoredCustomTiers = () => {
  try {
    const stored = localStorage.getItem(CUSTOM_TIERS_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persistCustomTiers = (tiers) => {
  try {
    localStorage.setItem(CUSTOM_TIERS_STORAGE_KEY, JSON.stringify(tiers));
  } catch {
    /* storage unavailable */
  }
};

const initialState = {
  tiers: getStoredCustomTiers(),
};

const customTiersSlice = createSlice({
  name: 'customTiers',
  initialState,
  reducers: {
    addCustomTier: {
      prepare: ({ name, card_size }) => ({
        payload: { id: `tier_${Date.now()}_${Math.round(Math.random() * 1e6)}`, name, card_size },
      }),
      reducer: (state, action) => {
        const { name } = action.payload;
        const existing = state.tiers.find(
          (tier) => tier.name.trim().toLowerCase() === name.trim().toLowerCase(),
        );
        if (existing) {
          existing.card_size = action.payload.card_size;
        } else {
          state.tiers.push(action.payload);
        }
        persistCustomTiers(state.tiers);
      },
    },
    removeCustomTier: (state, action) => {
      state.tiers = state.tiers.filter((tier) => tier.id !== action.payload);
      persistCustomTiers(state.tiers);
    },
  },
});

export const { addCustomTier, removeCustomTier } = customTiersSlice.actions;
export const selectCustomTiers = (state) => state.customTiers.tiers;
export default customTiersSlice.reducer;