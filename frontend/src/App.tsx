import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import AuroraBackground from "./components/AuroraBackground";
import BrandMark from "./components/BrandMark";
import GlassCard from "./components/GlassCard";
import { tokens } from "./theme";

const highlights = [
  {
    icon: BoltRoundedIcon,
    accent: tokens.emerald,
    title: "Bulk at speed",
    body: "Thousands of recipients from a single paste, queued with human-like pacing.",
  },
  {
    icon: LayersRoundedIcon,
    accent: tokens.cyan,
    title: "Every media type",
    body: "Text, images, video and documents — or drive it all from a spreadsheet.",
  },
  {
    icon: InsightsRoundedIcon,
    accent: tokens.violet,
    title: "Live analytics",
    body: "Track delivery, reachable numbers and campaign totals in real time.",
  },
  {
    icon: ShieldRoundedIcon,
    accent: tokens.amber,
    title: "Ban-aware sending",
    body: "Randomised delays between messages keep your session healthy.",
  },
];

function App() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [usernames, setUsernames] = useState<string[]>([]);

  useEffect(() => {
    const fetchUsernames = async () => {
      try {
        const response = await axios.get("/usernames");
        setUsernames(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching usernames:", error);
      }
    };
    fetchUsernames();
  }, []);

  const trimmed = username.trim();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    navigate(`/scan/${encodeURIComponent(trimmed)}`);
  };

  return (
    <Box sx={{ minHeight: "100vh", position: "relative" }}>
      <AuroraBackground />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.05fr 460px" },
          alignItems: "center",
          gap: { xs: 6, lg: 8 },
          maxWidth: 1240,
          mx: "auto",
          px: { xs: 2.5, sm: 4 },
          py: { xs: 6, lg: 4 },
        }}
      >
        {/* ---------------- left: brand story ---------------- */}
        <Box sx={{ textAlign: { xs: "center", lg: "left" } }}>
          <Box
            className="anim-fade-up"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 1.6,
              py: 0.7,
              mb: 3.5,
              borderRadius: "999px",
              border: "1px solid rgba(16,185,129,.3)",
              background: "rgba(16,185,129,.1)",
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: tokens.emeraldLight,
                animation: "pulse-ring 2s infinite",
              }}
            />
            <Typography
              sx={{
                fontSize: "0.73rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: tokens.emeraldLight,
              }}
            >
              WhatsApp automation platform
            </Typography>
          </Box>

          <Box
            className="anim-fade-up d-1"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2.5,
              justifyContent: { xs: "center", lg: "flex-start" },
            }}
          >
            <BrandMark size={54} />
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.3rem", sm: "3.1rem", lg: "3.5rem" },
                lineHeight: 1.04,
              }}
            >
              <span className="grad-text">Sender Suite</span>
            </Typography>
          </Box>

          <Typography
            className="anim-fade-up d-2"
            sx={{
              fontSize: { xs: "1.02rem", sm: "1.14rem" },
              color: tokens.textSecondary,
              maxWidth: 560,
              mx: { xs: "auto", lg: 0 },
              mb: 5,
            }}
          >
            The command centre for Fathy Nassef bulk messaging — launch text, media and
            spreadsheet-driven WhatsApp campaigns from one polished dashboard.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
              maxWidth: 640,
              mx: { xs: "auto", lg: 0 },
            }}
          >
            {highlights.map(({ icon: Icon, accent, title, body }, i) => (
              <GlassCard
                key={title}
                pad={2.4}
                className={`anim-fade-up d-${i + 3}`}
                sx={{ textAlign: "left" }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    mb: 1.6,
                    borderRadius: "11px",
                    display: "grid",
                    placeItems: "center",
                    background: `${accent}1F`,
                    border: `1px solid ${accent}3D`,
                  }}
                >
                  <Icon sx={{ fontSize: "1.15rem", color: accent }} />
                </Box>
                <Typography
                  sx={{
                    fontFamily: tokens.fontDisplay,
                    fontWeight: 600,
                    fontSize: "0.98rem",
                    mb: 0.6,
                  }}
                >
                  {title}
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", color: tokens.textMuted, lineHeight: 1.55 }}>
                  {body}
                </Typography>
              </GlassCard>
            ))}
          </Box>
        </Box>

        {/* ---------------- right: session card ---------------- */}
        <GlassCard
          topAccent
          className="anim-pop d-3"
          pad={{ xs: 3.2, sm: 4.2 }}
          sx={{ width: "100%", maxWidth: 460, mx: "auto" }}
        >
          <Typography variant="overline">Step 01 — Session</Typography>
          <Typography
            variant="h5"
            sx={{ mt: 1, mb: 0.8, fontSize: "1.5rem", color: tokens.textPrimary }}
          >
            Open your workspace
          </Typography>
          <Typography sx={{ fontSize: "0.9rem", color: tokens.textMuted, mb: 3.4 }}>
            Pick an existing session or type a new name to provision one.
          </Typography>

          <Box component="form" onSubmit={submit}>
            <Autocomplete
              freeSolo
              id="username-autocomplete"
              options={usernames}
              value={username}
              onChange={(_, newValue) => setUsername(newValue || "")}
              onInputChange={(_, newInputValue) => setUsername(newInputValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Session name"
                  placeholder="e.g. pharmacy-campaign"
                  variant="outlined"
                  fullWidth
                  autoFocus
                  helperText={
                    usernames.length
                      ? `${usernames.length} saved session${usernames.length === 1 ? "" : "s"} available`
                      : "No saved sessions yet — this will create the first one"
                  }
                />
              )}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={!trimmed}
              startIcon={<QrCodeScannerRoundedIcon />}
              sx={{ mt: 3, py: 1.55, fontSize: "1rem" }}
            >
              Continue to QR scan
            </Button>
          </Box>

          <Divider sx={{ my: 3.2 }} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
            <ShieldRoundedIcon sx={{ fontSize: "1.05rem", color: tokens.textMuted }} />
            <Typography sx={{ fontSize: "0.79rem", color: tokens.textMuted, lineHeight: 1.5 }}>
              Your session stays on this server. Nothing is shared with third parties.
            </Typography>
          </Box>
        </GlassCard>
      </Box>
    </Box>
  );
}

export default App;
