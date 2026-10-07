import { Link, useParams } from "react-router-dom";
import { useQuery } from "react-query";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import PersonOffRoundedIcon from "@mui/icons-material/PersonOffRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { getSummary } from "../api/api";
import AuroraBackground from "../components/AuroraBackground";
import NavBarComponent from "../components/NavBarComponent";
import GlassCard from "../components/GlassCard";
import StatCard from "../components/StatCard";
import { navItems } from "../components/navItems";
import { tokens } from "../theme";

/** Everything except the dashboard itself becomes a launcher tile. */
const launchers = navItems.filter((item) => item.path !== "dashboard");

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: "100vh", position: "relative" }}>
      <AuroraBackground />
      <NavBarComponent />
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1160,
          mx: "auto",
          px: { xs: 2, sm: 3 },
          pt: { xs: 4, sm: 5.5 },
          pb: 9,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default function DashboardPage() {
  const { username } = useParams();
  const { data, isLoading, isError, refetch, isFetching } = useQuery(
    `summary ${username}`,
    () => getSummary(username!)
  );

  /* ---------------- loading ---------------- */
  if (isLoading)
    return (
      <Frame>
        <Skeleton variant="text" width={240} height={46} />
        <Skeleton variant="text" width={360} height={24} sx={{ mb: 4 }} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2.5,
            mb: 6,
          }}
        >
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={192} sx={{ borderRadius: "18px" }} />
          ))}
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
            gap: 2.5,
          }}
        >
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="rounded" height={132} sx={{ borderRadius: "18px" }} />
          ))}
        </Box>
      </Frame>
    );

  /* ---------------- error ---------------- */
  if (isError)
    return (
      <Frame>
        <GlassCard
          className="anim-pop"
          sx={{ maxWidth: 460, mx: "auto", textAlign: "center", mt: 6 }}
        >
          <Box
            sx={{
              width: 62,
              height: 62,
              mx: "auto",
              mb: 2.5,
              borderRadius: "18px",
              display: "grid",
              placeItems: "center",
              background: "rgba(244,63,94,.14)",
              border: "1px solid rgba(244,63,94,.35)",
            }}
          >
            <ErrorOutlineRoundedIcon sx={{ fontSize: "1.9rem", color: tokens.rose }} />
          </Box>
          <Typography variant="h5" sx={{ mb: 1 }}>
            Couldn’t load analytics
          </Typography>
          <Typography sx={{ color: tokens.textMuted, mb: 3.2, fontSize: "0.9rem" }}>
            The summary endpoint didn’t respond. Your session may need to be re-linked.
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
            <Button variant="contained" startIcon={<RefreshRoundedIcon />} onClick={() => refetch()}>
              Try again
            </Button>
            <Button variant="outlined" component={Link} to={`/scan/${username}`}>
              Re-scan QR
            </Button>
          </Box>
        </GlassCard>
      </Frame>
    );

  /* ---------------- data ---------------- */
  const total = Number(data?.totalMessages) || 0;
  const reachable = Number(data?.totalUsersUniqueWhatsAppUsers) || 0;
  const unreachable = Number(data?.totalUsersUniqueNonWhatsAppUsers) || 0;
  const audience = reachable + unreachable;
  const reachRate = audience > 0 ? reachable / audience : 0;

  return (
    <Frame>
      {/* ---------------- header ---------------- */}
      <Box
        className="anim-fade-up"
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "flex-end" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: { xs: 3.5, sm: 4.5 },
        }}
      >
        <Box>
          <Typography variant="overline">Workspace overview</Typography>
          <Typography
            variant="h3"
            sx={{ mt: 0.8, fontSize: { xs: "1.9rem", sm: "2.5rem" } }}
          >
            Welcome back,{" "}
            <Box component="span" className="grad-text">
              {username}
            </Box>
          </Typography>
          <Typography sx={{ mt: 0.9, color: tokens.textSecondary, fontSize: "0.95rem" }}>
            {total.toLocaleString()} messages delivered across {audience.toLocaleString()} unique
            contacts.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={
            <RefreshRoundedIcon
              sx={isFetching ? { animation: "spin-slow 1s linear infinite" } : undefined}
            />
          }
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing" : "Refresh"}
        </Button>
      </Box>

      {/* ---------------- stats ---------------- */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2.5,
          mb: { xs: 5, sm: 7 },
        }}
      >
        <Box className="anim-fade-up d-1">
          <StatCard
            title="Messages sent"
            value={total}
            icon={MarkEmailReadRoundedIcon}
            accent={tokens.emerald}
            hint="Total across every campaign"
          />
        </Box>
        <Box className="anim-fade-up d-2">
          <StatCard
            title="On WhatsApp"
            value={reachable}
            icon={VerifiedUserRoundedIcon}
            accent={tokens.cyan}
            share={reachRate}
            hint={`${Math.round(reachRate * 100)}% of your audience is reachable`}
          />
        </Box>
        <Box className="anim-fade-up d-3">
          <StatCard
            title="Not on WhatsApp"
            value={unreachable}
            icon={PersonOffRoundedIcon}
            accent={tokens.rose}
            share={audience > 0 ? unreachable / audience : 0}
            hint={`${Math.round((1 - reachRate) * 100)}% could not be reached`}
          />
        </Box>
      </Box>

      {/* ---------------- launcher ---------------- */}
      <Box
        className="anim-fade-up d-4"
        sx={{ display: "flex", alignItems: "center", gap: 1.4, mb: 2.6 }}
      >
        <TrendingUpRoundedIcon sx={{ fontSize: "1.1rem", color: tokens.emeraldLight }} />
        <Typography variant="overline" sx={{ color: tokens.textSecondary }}>
          Launch a campaign
        </Typography>
        <Box sx={{ flex: 1, height: "1px", background: tokens.stroke }} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
          gap: 2.5,
        }}
      >
        {launchers.map(({ label, path, icon: Icon, blurb, accent }, i) => (
          <GlassCard
            key={path}
            interactive
            component={Link}
            to={`/${path}/${username}`}
            className={`anim-fade-up d-${Math.min(i + 5, 8)}`}
            pad={2.8}
            sx={{
              display: "block",
              textDecoration: "none",
              "&:hover .go-arrow": { transform: "translateX(4px)", opacity: 1 },
              "&:hover .tile-icon": { transform: "scale(1.08) rotate(-4deg)" },
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(110% 80% at 0% 0%, ${accent}1A, transparent 58%)`,
                pointerEvents: "none",
              }}
            />
            <Box sx={{ position: "relative" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Box
                  className="tile-icon"
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "13px",
                    display: "grid",
                    placeItems: "center",
                    background: `linear-gradient(145deg, ${accent}30, ${accent}0D)`,
                    border: `1px solid ${accent}40`,
                    transition: "transform .3s cubic-bezier(.2,.8,.2,1)",
                  }}
                >
                  <Icon sx={{ fontSize: "1.35rem", color: accent }} />
                </Box>
                <ArrowForwardRoundedIcon
                  className="go-arrow"
                  sx={{
                    fontSize: "1.15rem",
                    color: accent,
                    opacity: 0.45,
                    transition: "all .28s ease",
                  }}
                />
              </Box>

              <Typography
                sx={{
                  fontFamily: tokens.fontDisplay,
                  fontWeight: 600,
                  fontSize: "1.05rem",
                  color: tokens.textPrimary,
                  mb: 0.7,
                }}
              >
                {label}
              </Typography>
              <Typography sx={{ fontSize: "0.86rem", color: tokens.textMuted, lineHeight: 1.55 }}>
                {blurb}
              </Typography>
            </Box>
          </GlassCard>
        ))}
      </Box>
    </Frame>
  );
}
