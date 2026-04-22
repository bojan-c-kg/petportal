import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#1565C0', contrastText: '#ffffff' },
    error: { main: '#B71C1C', contrastText: '#ffffff' },
    success: { main: '#1B5E20', contrastText: '#ffffff' },
    warning: { main: '#8C4A00', contrastText: '#ffffff' },
    text: { primary: '#1a1a1a', secondary: '#4a4a4a' },
    background: { default: '#ffffff', paper: '#ffffff' },
  },
  typography: {
    fontFamily: `Roboto, system-ui, -apple-system, 'Segoe UI', sans-serif`,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none' },
      },
    },
  },
});
