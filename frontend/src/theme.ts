import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#D4AF37",
      light: "#F0D060",
      dark: "#B8860B",
      contrastText: "#1A0800",
    },
    secondary: {
      main: "#8B5E00",
    },
    background: {
      default: "#1A0800",
      paper: "#2D1100",
    },
    text: {
      primary: "#F5E6C8",
      secondary: "#D4AF37",
    },
  },
  typography: {
    fontFamily: '"Georgia", "Times New Roman", serif',
    h1: { color: "#D4AF37" },
    h4: { color: "#D4AF37" },
    h5: { color: "#D4AF37" },
    h6: { color: "#D4AF37" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#1A0800",
          minHeight: "100vh",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
          color: "#1A0800",
          fontWeight: "bold",
          letterSpacing: "0.8px",
          boxShadow: "0 4px 15px rgba(212, 175, 55, 0.35)",
          "&:hover": {
            background: "linear-gradient(135deg, #F0D060 0%, #D4AF37 100%)",
            boxShadow: "0 6px 20px rgba(212, 175, 55, 0.55)",
            transform: "translateY(-1px)",
          },
          transition: "all 0.2s ease",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: "linear-gradient(145deg, #3E1A00 0%, #2D1100 100%)",
          border: "1px solid rgba(212, 175, 55, 0.45)",
          boxShadow: "0 4px 20px rgba(212, 175, 55, 0.12)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "rgba(212, 175, 55, 0.5)" },
            "&:hover fieldset": { borderColor: "#D4AF37" },
            "&.Mui-focused fieldset": { borderColor: "#D4AF37" },
            color: "#F5E6C8",
          },
          "& .MuiInputLabel-root": { color: "rgba(212, 175, 55, 0.8)" },
          "& .MuiInputLabel-root.Mui-focused": { color: "#D4AF37" },
          "& .MuiInputBase-input": { color: "#F5E6C8" },
          "& .MuiSelect-icon": { color: "#D4AF37" },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          background: "#2D1100",
          border: "1px solid rgba(212, 175, 55, 0.3)",
        },
        option: {
          color: "#F5E6C8",
          "&:hover": { background: "rgba(212, 175, 55, 0.1)" },
        },
        clearIndicator: { color: "#D4AF37" },
        popupIndicator: { color: "#D4AF37" },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: "#F5E6C8",
          "&:hover": { background: "rgba(212, 175, 55, 0.1)" },
          "&.Mui-selected": { background: "rgba(212, 175, 55, 0.2)" },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "#F5E6C8",
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
        },
      },
    },
  },
});

export default theme;
