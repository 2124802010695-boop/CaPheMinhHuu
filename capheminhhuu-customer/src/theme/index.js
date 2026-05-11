import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary:    { main: '#3D1A0A', light: '#6B3A2A', dark: '#1C0A00', contrastText: '#FDF6EE' },
    secondary:  { main: '#C8860A', light: '#E5A82A', dark: '#9A6508', contrastText: '#1C0A00' },
    background: { default: '#FDF6EE', paper: '#FFFFFF' },
    text:       { primary: '#1C0A00', secondary: '#9C7B5E' },
    success:    { main: '#2D6A4F', contrastText: '#fff' },
    error:      { main: '#C0392B', contrastText: '#fff' },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontFamily: "'Playfair Display', serif", fontWeight: 700 },
    h2: { fontFamily: "'Playfair Display', serif", fontWeight: 700 },
    h3: { fontFamily: "'Playfair Display', serif", fontWeight: 700 },
    h4: { fontFamily: "'Playfair Display', serif", fontWeight: 700 },
    h5: { fontFamily: "'Playfair Display', serif", fontWeight: 600 },
    h6: { fontFamily: "'Playfair Display', serif", fontWeight: 600 },
    subtitle1: { fontFamily: "'Inter', sans-serif", fontWeight: 500 },
    subtitle2: { fontFamily: "'Inter', sans-serif", fontWeight: 500 },
    body1:     { fontFamily: "'Inter', sans-serif", fontWeight: 400 },
    body2:     { fontFamily: "'Inter', sans-serif", fontWeight: 400 },
    button:    { fontFamily: "'Inter', sans-serif", fontWeight: 600, textTransform: 'none' },
    caption:   { fontFamily: "'Inter', sans-serif", fontWeight: 400 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(61,26,10,0.10)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #3D1A0A 0%, #6B3A2A 100%)',
          '&:hover': { background: 'linear-gradient(135deg, #1C0A00 0%, #3D1A0A 100%)' },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #C8860A 0%, #E5A82A 100%)',
          '&:hover': { background: 'linear-gradient(135deg, #9A6508 0%, #C8860A 100%)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 8, fontFamily: "'Inter', sans-serif", fontWeight: 500 } },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            fontFamily: "'Inter', sans-serif",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
  },
});

export default theme;
