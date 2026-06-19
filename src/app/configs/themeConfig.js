import { createTheme } from '@mui/material/styles';

const themeConfig = createTheme({
  palette: {
    primary: {
      main: '#EB0028',
      dark: '#C00020',
      light: '#FF1744',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1a1a1a',
      light: '#333333',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    // Date/Time picker popups use the primary colour (red) for selected dates,
    // today indicator, clock hands, etc.
    MuiPickersDay: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#EB0028',
            '&:hover': { backgroundColor: '#C00020' },
            '&:focus': { backgroundColor: '#EB0028' },
          },
          '&.MuiPickersDay-today:not(.Mui-selected)': {
            borderColor: '#EB0028',
            color: '#EB0028',
          },
        },
      },
    },
    MuiClock: {
      styleOverrides: {
        pin: { backgroundColor: '#EB0028' },
      },
    },
    MuiClockPointer: {
      styleOverrides: {
        root: { backgroundColor: '#EB0028' },
        thumb: {
          backgroundColor: '#EB0028',
          borderColor: '#EB0028',
        },
      },
    },
    MuiClockNumber: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#EB0028',
          },
        },
      },
    },
    MuiDateCalendar: {
      styleOverrides: {
        root: {
          '& .MuiPickersYear-yearButton.Mui-selected': {
            backgroundColor: '#EB0028',
            '&:hover': { backgroundColor: '#C00020' },
          },
          '& .MuiPickersMonth-monthButton.Mui-selected': {
            backgroundColor: '#EB0028',
            '&:hover': { backgroundColor: '#C00020' },
          },
        },
      },
    },
  },
});

export default themeConfig;
