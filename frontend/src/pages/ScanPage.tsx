import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PhoneAndroidRoundedIcon from "@mui/icons-material/PhoneAndroidRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AuroraBackground from "../components/AuroraBackground";
import NavBarComponent from "../components/NavBarComponent";
import GlassCard from "../components/GlassCard";
import { tokens } from "../theme";

const BLANK_QR = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

const WS_URL =
  import.meta.env.VITE_WS_URL ||
  `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;

const steps = [
  { icon: PhoneAndroidRoundedIcon, text: "Open WhatsApp on your phone" },
  { icon: LinkRoundedIcon, text: "Go to Settings → Linked devices" },
  { icon: QrCode2RoundedIcon, text: "Tap “Link a device” and scan this code" },
];

function ScanPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [QR, setQR] = useState(BLANK_QR);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const { sendMessage, readyState } = useWebSocket(WS_URL, {
    onOpen: () => sendMessage(JSON.stringify({ type: "set-username", username })),
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "qr-code") {
        setQR(data.message);
      } else if (data.type === "authenticated") {
        setIsAuthenticated(true);
      }
    },
  });

  // Let the success state land for a beat before moving to the dashboard.
  useEffect(() => {
    if (!isAuthenticated) return;
    const t = setTimeout(() => navigate(`/dashboard/${username}`), 1400);
    return () => clearTimeout(t);
  }, [isAuthenticated, navigate, username]);

  const statusLabel = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Live",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Disconnected",
    [ReadyState.UNINSTANTIATED]: "Idle",
  }[readyState];

  const statusColor =
    readyState === ReadyState.OPEN
      ? tokens.emeraldLight
      : readyState === ReadyState.CONNECTING
      ? tokens.amber
      : tokens.rose;

  const waitingForQr = QR === BLANK_QR;

  return (
    <Box sx={{ minHeight: "100vh", position: "relative" }}>
      <AuroraBackground />
      <NavBarComponent />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          py: { xs: 4, sm: 7 },
          minHeight: "calc(100vh - 70px)",
        }}
      >
        <GlassCard
          topAccent
          className="anim-pop"
          pad={{ xs: 3.2, sm: 4.5 }}
          sx={{ width: "100%", maxWidth: 520, textAlign: "center" }}
        >
          {/* ---- status pill ---- */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 1.6,
              py: 0.6,
              mb: 3,
              borderRadius: "999px",
              border: `1px solid ${statusColor}4D`,
              background: `${statusColor}14`,
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: statusColor,
                boxShadow: `0 0 8px ${statusColor}`,
                ...(readyState === ReadyState.OPEN && { animation: "pulse-ring 2s infinite" }),
              }}
            />
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: statusColor,
              }}
            >
              {statusLabel}
            </Typography>
          </Box>

          {isAuthenticated ? (
            /* ---------------- authenticated ---------------- */
            <Box className="anim-pop">
              <Box
                sx={{
                  width: 86,
                  height: 86,
                  mx: "auto",
                  mb: 3,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: "linear-gradient(145deg, rgba(16,185,129,.26), rgba(6,182,212,.12))",
                  border: "1px solid rgba(16,185,129,.45)",
                  boxShadow: tokens.glowStrong,
                  animation: "pulse-ring 2s infinite",
                }}
              >
                <CheckCircleRoundedIcon sx={{ fontSize: "2.7rem", color: tokens.emeraldLight }} />
              </Box>

              <Typography variant="h4" sx={{ mb: 1.2, fontSize: { xs: "1.6rem", sm: "1.9rem" } }}>
                Device linked
              </Typography>
              <Typography sx={{ color: tokens.textSecondary, mb: 3.5 }}>
                Session <strong style={{ color: tokens.emeraldLight }}>{username}</strong> is
                authenticated and ready to send.
              </Typography>

              <Button
                variant="contained"
                size="large"
                fullWidth
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => navigate(`/dashboard/${username}`)}
              >
                Open dashboard
              </Button>
              <Typography sx={{ mt: 1.8, fontSize: "0.78rem", color: tokens.textMuted }}>
                Redirecting automatically…
              </Typography>
            </Box>
          ) : (
            /* ---------------- awaiting scan ---------------- */
            <>
              <Typography variant="overline">Step 02 — Link device</Typography>
              <Typography
                variant="h4"
                sx={{ mt: 1, mb: 1, fontSize: { xs: "1.6rem", sm: "1.95rem" } }}
              >
                Scan to connect
              </Typography>
              <Typography sx={{ color: tokens.textMuted, fontSize: "0.9rem", mb: 3.5 }}>
                Session <strong style={{ color: tokens.textSecondary }}>{username}</strong>
              </Typography>

              {/* ---- QR frame: outer layer carries the halo, inner layer clips the scan line ---- */}
              <Box sx={{ position: "relative", display: "inline-block" }}>
                {/* gradient halo — must sit outside any clipping box */}
                <Box
                  aria-hidden
                  sx={{
                    position: "absolute",
                    inset: -3,
                    borderRadius: "25px",
                    background: tokens.gradient,
                    filter: "blur(14px)",
                    opacity: 0.7,
                  }}
                />
                <Box
                  sx={{
                    position: "relative",
                    p: 2.2,
                    borderRadius: "22px",
                    background: "#fff",
                    boxShadow: "0 18px 50px rgba(0,0,0,.5)",
                    overflow: "hidden",
                  }}
                >
                  {waitingForQr ? (
                    <Box
                      sx={{
                        width: 232,
                        height: 232,
                        display: "grid",
                        placeItems: "center",
                        gap: 1.5,
                      }}
                    >
                      <CircularProgress size={34} thickness={4} sx={{ color: tokens.emerald }} />
                      <Typography sx={{ fontSize: "0.8rem", color: "#5F6D83", fontWeight: 600 }}>
                        Generating QR code…
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Box
                        component="img"
                        src={QR}
                        alt="WhatsApp pairing QR code"
                        id="qrcode_box"
                        sx={{ width: 232, height: 232, display: "block" }}
                      />
                      {/* animated scan line */}
                      <Box
                        aria-hidden
                        sx={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: 0,
                          height: 24,
                          borderRadius: "99px",
                          background:
                            "linear-gradient(180deg, rgba(16,185,129,0), rgba(16,185,129,.6), rgba(16,185,129,0))",
                          animation: "scan-line 2.6s ease-in-out infinite",
                          pointerEvents: "none",
                        }}
                      />
                    </>
                  )}
                </Box>
              </Box>

              {/* ---- steps ---- */}
              <Box sx={{ mt: 4, textAlign: "left", display: "grid", gap: 1.2 }}>
                {steps.map(({ icon: Icon, text }, i) => (
                  <Box
                    key={text}
                    className={`anim-fade-up d-${i + 2}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.6,
                      p: 1.4,
                      borderRadius: "12px",
                      background: "rgba(255,255,255,.03)",
                      border: `1px solid ${tokens.stroke}`,
                    }}
                  >
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        flexShrink: 0,
                        borderRadius: "9px",
                        display: "grid",
                        placeItems: "center",
                        background: "rgba(16,185,129,.14)",
                        border: "1px solid rgba(16,185,129,.28)",
                      }}
                    >
                      <Icon sx={{ fontSize: "0.95rem", color: tokens.emeraldLight }} />
                    </Box>
                    <Typography sx={{ fontSize: "0.87rem", color: tokens.textSecondary }}>
                      <Box
                        component="span"
                        sx={{ color: tokens.textMuted, fontWeight: 700, mr: 0.8 }}
                      >
                        {i + 1}.
                      </Box>
                      {text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}
        </GlassCard>
      </Box>
    </Box>
  );
}

export default ScanPage;
