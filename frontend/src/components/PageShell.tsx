import type { ReactNode } from "react";
import type { SvgIconComponent } from "@mui/icons-material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import { Link, useParams } from "react-router-dom";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import AuroraBackground from "./AuroraBackground";
import NavBarComponent from "./NavBarComponent";
import { tokens } from "../theme";

type PageShellProps = {
  title: string;
  subtitle?: string;
  icon?: SvgIconComponent;
  /** Accent colour for the icon tile + title underline. */
  accent?: string;
  /** Max content width in px. */
  width?: number;
  /** Small pill rendered beside the title (e.g. "Excel · personalised"). */
  badge?: string;
  children: ReactNode;
};

/**
 * Standard page frame: aurora backdrop, sticky nav, breadcrumb,
 * icon + title header block, then the page body.
 */
function PageShell({
  title,
  subtitle,
  icon: Icon,
  accent = tokens.emerald,
  width = 760,
  badge,
  children,
}: PageShellProps) {
  const { username } = useParams();

  return (
    <Box sx={{ minHeight: "100vh", position: "relative" }}>
      <AuroraBackground />
      <NavBarComponent />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: width,
          mx: "auto",
          px: { xs: 2, sm: 3 },
          pt: { xs: 3.5, sm: 5 },
          pb: 8,
        }}
      >
        {username && (
          <Breadcrumbs
            separator={<NavigateNextRoundedIcon sx={{ fontSize: "0.9rem" }} />}
            sx={{
              mb: 2.5,
              "& .MuiBreadcrumbs-separator": { color: tokens.textMuted, mx: 0.6 },
            }}
            className="anim-fade-up"
          >
            <Box
              component={Link}
              to={`/dashboard/${username}`}
              sx={{
                fontSize: "0.8rem",
                color: tokens.textMuted,
                textDecoration: "none",
                "&:hover": { color: tokens.emeraldLight },
              }}
            >
              Dashboard
            </Box>
            <Typography sx={{ fontSize: "0.8rem", color: tokens.textSecondary, fontWeight: 600 }}>
              {title}
            </Typography>
          </Breadcrumbs>
        )}

        {/* ---- header ---- */}
        <Box
          className="anim-fade-up d-1"
          sx={{ display: "flex", alignItems: "flex-start", gap: 2.2, mb: { xs: 3.5, sm: 4.5 } }}
        >
          {Icon && (
            <Box
              sx={{
                width: 54,
                height: 54,
                flexShrink: 0,
                borderRadius: "16px",
                display: "grid",
                placeItems: "center",
                background: `linear-gradient(145deg, ${accent}2E, ${accent}0F)`,
                border: `1px solid ${accent}4D`,
                boxShadow: `0 10px 30px ${accent}26`,
              }}
            >
              <Icon sx={{ fontSize: "1.65rem", color: accent }} />
            </Box>
          )}

          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flexWrap: "wrap" }}>
              <Typography
                variant="h4"
                sx={{ fontSize: { xs: "1.6rem", sm: "2rem" }, color: tokens.textPrimary }}
              >
                {title}
              </Typography>
              {badge && (
                <Chip
                  label={badge}
                  size="small"
                  sx={{ color: accent, borderColor: `${accent}55`, background: `${accent}14` }}
                />
              )}
            </Box>
            {subtitle && (
              <Typography sx={{ mt: 0.7, color: tokens.textSecondary, fontSize: "0.94rem", maxWidth: 560 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {children}
      </Box>
    </Box>
  );
}

export default PageShell;
