import React, { useState, useEffect, useRef } from 'react';
import { IconButton, Menu, MenuItem, TextField, InputAdornment, Box } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';

export default function FilterIcon({ items, filters, onFiltered }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [value, setValue] = useState('');
  const [inputVisible, setInputVisible] = useState(false);
  const lastSentDataRef = useRef(null);

  const open = Boolean(anchorEl);

  const handleFilterButtonClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => setAnchorEl(null);

  const handleSelectFilter = (filter) => {
    setActiveFilter(filter);
    setValue('');
    setInputVisible(true);
    handleCloseMenu();
  };

  useEffect(() => {
    const currentItems = Array.isArray(items) ? items : [];
    let result = currentItems;

    if (activeFilter && value) {
      result = currentItems.filter((item) => {
        const itemValue = item[activeFilter.key];

        if (activeFilter.type === 'text') {
          return String(itemValue || '')
            .toLowerCase()
            .includes(value.toLowerCase());
        }

        if (activeFilter.type === 'date') {
          if (!itemValue) return false;

          const itemYear = new Date(itemValue).getFullYear().toString();
          return itemYear === value;
        }

        return true;
      });
    }

    const resultString = JSON.stringify(result);
    if (lastSentDataRef.current !== resultString) {
      lastSentDataRef.current = resultString;
      onFiltered(result);
    }
  }, [value, activeFilter, items, onFiltered]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton onClick={handleFilterButtonClick} color={inputVisible ? 'primary' : 'default'}>
        <TuneIcon fontSize="medium" />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
        {filters.map((filter) => (
          <MenuItem key={filter.key} onClick={() => handleSelectFilter(filter)}>
            {filter.label}
          </MenuItem>
        ))}
      </Menu>

      {inputVisible && activeFilter && (
        <TextField
          select={activeFilter.type === 'date'}
          label={activeFilter.label}
          variant="outlined"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => {
                    setValue('');
                    setInputVisible(false);
                    setActiveFilter(null);
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: 200,

            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
          }}
        >
          {activeFilter.type === 'date' && activeFilter.options
            ? activeFilter.options.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))
            : null}
        </TextField>
      )}
    </Box>
  );
}
