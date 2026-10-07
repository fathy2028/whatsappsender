import { createTheme, alpha } from "@mui/material/styles";

/* ------------------------------------------------------------------ */
/*  Design tokens                                                      */
/* ------------------------------------------------------------------ */
export const tokens = {
  bg: "#080B14",
  bgElevated: "#0D1220",
  surface: "rgba(255, 255, 255, 0.04)",
  surfaceHover: "rgba(255, 255, 255, 0.07)",
  stroke: "rgba(255, 255, 255, 0.09)",
  strokeStrong: "rgba(255, 255, 255, 0.16)",
  emerald: "#10B981",
  emeraldLight: "#34D399",
  emeraldDark: "#059669",
  cyan: "#06B6D4",
  cyanLight: "#22D3EE",
  violet: "#8B5CF6",
  amber: "#F59E0B",
  rose: "#F43F5E",
  textPrimary: "#E9EEF7",
  textSecondary: "#92A0B5",
  textMuted: "#5F6D83",
  radius: 18,
  gradient: "linear-gradient(135deg, #10B981 0%, #06B6D4 100%)",
  gradientHover: "linear-gradient(135deg, #34D399 0%, #22D3EE 100%)",
  gradientText: "linear-gradient(135deg, #E9EEF7 0%, #34D399 50%, #22D3EE 100%)",
  glow: "0 8px 32px rgba(16, 185, 129, 0.28)",
  glowStrong: "0 12px 44px rgba(16, 185, 129, 0.42)",
  fontDisplay: '"Space Grotesk", "Inter", system-ui, sans-serif',
  fontBody: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
  fontMono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
};

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: tokens.emerald,
      light: tokens.emeraldLight,
      dark: tokens.emeraldDark,
      contrastText: "#04140E",
    },
    secondary: {
      main: tokens.cyan,
      light: tokens.cyanLight,
      contrastText: "#03121A",
    },
    success: { main: tokens.emerald },
    warning: { main: tokens.amber },
    error: { main: tokens.rose },
    info: { main: tokens.cyan },
    background: {
      default: tokens.bg,
      paper: tokens.bgElevated,
    },
    text: {
      primary: tokens.textPrimary,
      secondary: tokens.textSecondary,
      disabled: tokens.textMuted,
    },
    divider: tokens.stroke,
  },

  shape: { borderRadius: 14 },

  typography: {
    fontFamily: tokens.fontBody,
    h1: { fontFamily: tokens.fontDisplay, fontWeight: 700, letterSpacing: "-0.03em" },
    h2: { fontFamily: tokens.fontDisplay, fontWeight: 700, letterSpacing: "-0.03em" },
    h3: { fontFamily: tokens.fontDisplay, fontWeight: 700, letterSpacing: "-0.025em" },
    h4: { fontFamily: tokens.fontDisplay, fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontFamily: tokens.fontDisplay, fontWeight: 600, letterSpacing: "-0.015em" },
    h6: { fontFamily: tokens.fontDisplay, fontWeight: 600, letterSpacing: "-0.01em" },
    subtitle1: { color: tokens.textSecondary },
    subtitle2: { color: tokens.textSecondary, fontWeight: 500 },
    body1: { lineHeight: 1.65 },
    body2: { lineHeight: 1.6, color: tokens.textSecondary },
    button: { fontWeight: 600, letterSpacing: "0.01em", textTransform: "none" },
    overline: {
      fontWeight: 700,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      fontSize: "0.68rem",
      color: tokens.textMuted,
    },
  },

  components: {
    /* ---------------- baseline ---------------- */
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: tokens.bg,
          color: tokens.textPrimary,
          minHeight: "100vh",
          overflowX: "hidden",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
      },
    },

    /* ---------------- buttons ---------------- */
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: 20,
          position: "relative",
          overflow: "hidden",
          transition: "transform .22s cubic-bezier(.2,.8,.2,1), box-shadow .22s ease, background .22s ease, border-color .22s ease",
          "&:active": { transform: "translateY(0) scale(.985)" },
          "&.Mui-disabled": { opacity: 0.45, color: alpha("#fff", 0.5) },
        },
        contained: {
          background: tokens.gradient,
          color: "#04140E",
          boxShadow: "0 6px 20px rgba(16,185,129,.26), inset 0 1px 0 rgba(255,255,255,.22)",
          /* sheen sweep on hover */
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(110deg, transparent 20%, rgba(255,255,255,.38) 50%, transparent 80%)",
            transform: "translateX(-120%)",
            transition: "transform .7s ease",
          },
          "&:hover": {
            background: tokens.gradientHover,
            boxShadow: tokens.glowStrong,
            transform: "translateY(-2px)",
          },
          "&:hover::after": { transform: "translateX(120%)" },
        },
        outlined: {
          borderColor: tokens.strokeStrong,
          color: tokens.textPrimary,
          background: tokens.surface,
          backdropFilter: "blur(12px)",
          "&:hover": {
            borderColor: alpha(tokens.emerald, 0.6),
            background: alpha(tokens.emerald, 0.1),
            transform: "translateY(-2px)",
            boxShadow: "0 8px 24px rgba(0,0,0,.35)",
          },
        },
        text: {
          color: tokens.textSecondary,
          "&:hover": { background: tokens.surfaceHover, color: tokens.textPrimary },
        },
        sizeLarge: { paddingBlock: 13, fontSize: "0.98rem" },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          color: tokens.textSecondary,
          transition: "all .2s ease",
          "&:hover": { color: tokens.textPrimary, background: tokens.surfaceHover },
        },
      },
    },

    /* ---------------- surfaces ---------------- */
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
        outlined: { borderColor: tokens.stroke },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius,
          background: tokens.surface,
          backdropFilter: "blur(24px) saturate(140%)",
          WebkitBackdropFilter: "blur(24px) saturate(140%)",
          border: `1px solid ${tokens.stroke}`,
          boxShadow: "0 16px 44px rgba(0,0,0,.42)",
        },
      },
    },

    /* ---------------- inputs ---------------- */
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          background: "rgba(255,255,255,.035)",
          backdropFilter: "blur(10px)",
          transition: "background .2s ease, box-shadow .2s ease",
          "& fieldset": { borderColor: tokens.stroke, transition: "border-color .2s ease" },
          "&:hover": { background: "rgba(255,255,255,.055)" },
          "&:hover fieldset": { borderColor: tokens.strokeStrong },
          "&.Mui-focused": {
            background: "rgba(255,255,255,.06)",
            boxShadow: `0 0 0 3px ${alpha(tokens.emerald, 0.16)}`,
          },
          "&.Mui-focused fieldset": { borderColor: tokens.emerald, borderWidth: 1 },
        },
        input: {
          color: tokens.textPrimary,
          "&::placeholder": { color: tokens.textMuted, opacity: 1 },
        },
        notchedOutline: { borderColor: tokens.stroke },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: tokens.textSecondary,
          "&.Mui-focused": { color: tokens.emeraldLight },
        },
      },
    },

    MuiFormHelperText: {
      styleOverrides: { root: { color: tokens.textMuted, marginLeft: 2 } },
    },

    MuiSelect: { styleOverrides: { icon: { color: tokens.textSecondary } } },

    MuiMenu: {
      styleOverrides: {
        paper: {
          marginTop: 6,
          borderRadius: 14,
          background: "rgba(13,18,32,.92)",
          backdropFilter: "blur(24px)",
          border: `1px solid ${tokens.stroke}`,
          boxShadow: "0 20px 50px rgba(0,0,0,.6)",
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 9,
          margin: "3px 6px",
          color: tokens.textPrimary,
          fontSize: "0.92rem",
          "&:hover": { background: alpha(tokens.emerald, 0.12) },
          "&.Mui-selected": {
            background: alpha(tokens.emerald, 0.18),
            "&:hover": { background: alpha(tokens.emerald, 0.24) },
          },
        },
      },
    },

    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
          background: "rgba(13,18,32,.94)",
          backdropFilter: "blur(24px)",
          border: `1px solid ${tokens.stroke}`,
          boxShadow: "0 20px 50px rgba(0,0,0,.6)",
        },
        listbox: { padding: 6 },
        option: {
          borderRadius: 9,
          color: tokens.textPrimary,
          fontSize: "0.92rem",
          '&[aria-selected="true"]': { background: alpha(tokens.emerald, 0.18) },
          '&.Mui-focused, &[data-focus="true"]': { background: alpha(tokens.emerald, 0.12) },
        },
        clearIndicator: { color: tokens.textSecondary },
        popupIndicator: { color: tokens.textSecondary },
        noOptions: { color: tokens.textMuted, fontSize: "0.88rem" },
      },
    },

    /* ---------------- feedback / misc ---------------- */
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
          fontSize: "0.74rem",
          letterSpacing: "0.02em",
          border: `1px solid ${tokens.stroke}`,
          background: tokens.surface,
          backdropFilter: "blur(10px)",
        },
        label: { paddingInline: 11 },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: "rgba(13,18,32,.96)",
          border: `1px solid ${tokens.stroke}`,
          borderRadius: 10,
          fontSize: "0.78rem",
          backdropFilter: "blur(16px)",
          boxShadow: "0 10px 30px rgba(0,0,0,.5)",
          padding: "7px 11px",
        },
        arrow: { color: "rgba(13,18,32,.96)" },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 6, borderRadius: 999, background: "rgba(255,255,255,.07)" },
        bar: { borderRadius: 999, background: tokens.gradient },
      },
    },

    MuiDivider: { styleOverrides: { root: { borderColor: tokens.stroke } } },

    MuiLink: {
      styleOverrides: {
        root: {
          color: tokens.emeraldLight,
          textDecoration: "none",
          "&:hover": { textDecoration: "underline" },
        },
      },
    },

    MuiBackdrop: {
      styleOverrides: {
        root: { background: "rgba(4,6,12,.72)", backdropFilter: "blur(6px)" },
      },
    },

    MuiSkeleton: {
      styleOverrides: { root: { backgroundColor: "rgba(255,255,255,.06)" } },
    },
  },
});

export default theme;
