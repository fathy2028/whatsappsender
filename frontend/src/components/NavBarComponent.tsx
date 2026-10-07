import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import useMediaQuery from "@mui/material/useMediaQuery";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import BrandMark from "./BrandMark";
import { navItems } from "./navItems";
import { tokens } from "../theme";

function NavBarComponent() {
  const { username } = useParams();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const compact = useMediaQuery("(max-width:1100px)");

  const isActive = (path: string) => pathname.startsWith(`/${path}/`);

  const brand = (
    <Box
      component={Link}
      to="/"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.4,
        textDecoration: "none",
        flexShrink: 0,
        "&:hover .brand-name": { color: tokens.emeraldLight },
      }}
    >
      <BrandMark size={34} />
      <Box sx={{ lineHeight: 1 }}>
        <Typography
          className="brand-name"
          sx={{
            fontFamily: tokens.fontDisplay,
            fontWeight: 700,
            fontSize: "1.02rem",
            letterSpacing: "-0.02em",
            color: tokens.textPrimary,
            transition: "color .2s ease",
          }}
        >
          Fathy Nassef
        </Typography>
        <Typography
          sx={{
            fontSize: "0.63rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: tokens.textMuted,
            fontWeight: 600,
            mt: "2px",
          }}
        >
          Sender Suite
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          top: 0,
          background: "rgba(8,11,20,.68)",
          backdropFilter: "blur(22px) saturate(160%)",
          WebkitBackdropFilter: "blur(22px) saturate(160%)",
          borderBottom: `1px solid ${tokens.stroke}`,
          zIndex: (t) => t.zIndex.drawer + 1,
        }}
      >
        <Toolbar
          sx={{
            maxWidth: 1320,
            width: "100%",
            mx: "auto",
            px: { xs: 2, sm: 3 },
            minHeight: { xs: 64, sm: 70 },
            gap: 2,
          }}
        >
          {brand}

          {/* ---- desktop links ---- */}
          {username && !compact && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: 3, flex: 1 }}>
              {navItems.map(({ short, path, icon: Icon }) => {
                const active = isActive(path);
                return (
                  <Button
                    key={path}
                    component={Link}
                    to={`/${path}/${username}`}
                    startIcon={<Icon sx={{ fontSize: "1.05rem !important" }} />}
                    sx={{
                      px: 1.5,
                      py: 0.85,
                      fontSize: "0.83rem",
                      borderRadius: "10px",
                      color: active ? tokens.emeraldLight : tokens.textSecondary,
                      background: active ? "rgba(16,185,129,.12)" : "transparent",
                      border: `1px solid ${active ? "rgba(16,185,129,.3)" : "transparent"}`,
                      "&:hover": {
                        background: active ? "rgba(16,185,129,.18)" : tokens.surfaceHover,
                        color: active ? tokens.emeraldLight : tokens.textPrimary,
                      },
                    }}
                  >
                    {short}
                  </Button>
                );
              })}
            </Box>
          )}

          <Box sx={{ flex: username && !compact ? 0 : 1 }} />

          {/* ---- session chip ---- */}
          {username && (
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 0.7,
                borderRadius: "999px",
                border: `1px solid ${tokens.stroke}`,
                background: tokens.surface,
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: tokens.gradient,
                  color: "#04140E",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                }}
              >
                {username.slice(0, 2)}
              </Box>
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: tokens.textPrimary,
                  maxWidth: 130,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {username}
              </Typography>
              <Tooltip title="Switch session" arrow>
                <IconButton component={Link} to="/" size="small" sx={{ ml: -0.3 }}>
                  <LogoutRoundedIcon sx={{ fontSize: "1rem" }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {/* ---- mobile burger ---- */}
          {username && compact && (
            <IconButton
              onClick={() => setOpen(true)}
              sx={{
                border: `1px solid ${tokens.stroke}`,
                borderRadius: "11px",
                background: tokens.surface,
              }}
            >
              <MenuRoundedIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* ---- mobile drawer ---- */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: 290,
            background: "rgba(10,14,24,.94)",
            backdropFilter: "blur(28px)",
            borderLeft: `1px solid ${tokens.stroke}`,
            backgroundImage: "none",
          },
        }}
      >
        <Box sx={{ p: 2.2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontFamily: tokens.fontDisplay, fontWeight: 700 }}>Navigate</Typography>
          <IconButton onClick={() => setOpen(false)}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        {username && (
          <Typography
            sx={{
              px: 2.4,
              pb: 1.4,
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: tokens.textMuted,
              fontWeight: 700,
            }}
          >
            {username}
          </Typography>
        )}

        <List sx={{ px: 1.2 }}>
          {navItems.map(({ label, path, icon: Icon, accent }) => {
            const active = isActive(path);
            return (
              <ListItemButton
                key={path}
                component={Link}
                to={`/${path}/${username}`}
                onClick={() => setOpen(false)}
                sx={{
                  borderRadius: "12px",
                  mb: 0.5,
                  py: 1.1,
                  background: active ? "rgba(16,185,129,.13)" : "transparent",
                  border: `1px solid ${active ? "rgba(16,185,129,.28)" : "transparent"}`,
                  "&:hover": { background: tokens.surfaceHover },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: active ? accent : tokens.textSecondary }}>
                  <Icon sx={{ fontSize: "1.25rem" }} />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    fontSize: "0.9rem",
                    fontWeight: active ? 700 : 500,
                    color: active ? tokens.emeraldLight : tokens.textPrimary,
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>

        <Box sx={{ mt: "auto", p: 2 }}>
          <Button
            component={Link}
            to="/"
            fullWidth
            variant="outlined"
            startIcon={<LogoutRoundedIcon />}
            onClick={() => setOpen(false)}
          >
            Switch session
          </Button>
        </Box>
      </Drawer>
    </>
  );
}

export default NavBarComponent;
