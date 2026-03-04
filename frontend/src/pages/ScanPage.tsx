import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const WS_URL =
  import.meta.env.VITE_WS_URL ||
  `${window.location.protocol === "https:" ? "wss" : "ws"}://${
    window.location.host
  }`;

function ScanPage() {
  const [QR, setQR] = useState(
    "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
  );
  const { username } = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const { sendMessage, readyState } = useWebSocket(WS_URL, {
    onOpen: () =>
      sendMessage(JSON.stringify({ type: "set-username", username })),
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "qr-code") {
        setQR(data.message);
      } else if (data.type === "authenticated") {
        setIsAuthenticated(true);
      }
    },
  });

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  };

  const statusColor =
    readyState === ReadyState.OPEN
      ? "#4caf50"
      : readyState === ReadyState.CONNECTING
      ? "#D4AF37"
      : "#ef5350";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at center, #2D1100 0%, #1A0800 70%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Box
        sx={{
          background: "linear-gradient(145deg, #3E1A00 0%, #2D1100 100%)",
          border: "1px solid rgba(212,175,55,0.5)",
          borderRadius: "16px",
          boxShadow: "0 8px 40px rgba(212,175,55,0.2)",
          p: { xs: 3, sm: 5 },
          maxWidth: 440,
          width: "100%",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "#D4AF37",
            fontFamily: "Georgia, serif",
            fontWeight: "bold",
            mb: 1,
            textShadow: "0 2px 8px rgba(212,175,55,0.4)",
          }}
        >
          ✉ Fathy Nassef Sender APP
        </Typography>

        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.8,
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(212,175,55,0.25)",
            borderRadius: "20px",
            px: 2,
            py: 0.5,
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: statusColor,
              boxShadow: `0 0 6px ${statusColor}`,
            }}
          />
          <Typography sx={{ color: statusColor, fontSize: "0.8rem", fontFamily: "Georgia, serif" }}>
            WebSocket: {connectionStatus[readyState]}
          </Typography>
        </Box>

        {isAuthenticated ? (
          <>
            <Typography
              variant="h5"
              sx={{ color: "#D4AF37", fontFamily: "Georgia, serif", mb: 3 }}
            >
              Authenticated! You're ready to go.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
              <Link to={`/group/${username}`} style={{ textDecoration: "none" }}>
                <Button variant="contained" sx={{ borderRadius: "8px" }}>
                  Group
                </Button>
              </Link>
              <Link to={`/bulk/${username}`} style={{ textDecoration: "none" }}>
                <Button variant="contained" sx={{ borderRadius: "8px" }}>
                  Bulk
                </Button>
              </Link>
              <Link to={`/phone/${username}`} style={{ textDecoration: "none" }}>
                <Button variant="contained" sx={{ borderRadius: "8px" }}>
                  Phone Number
                </Button>
              </Link>
            </Box>
            <Navigate to={"/dashboard/" + username} />
          </>
        ) : (
          <>
            <Typography
              sx={{
                color: "rgba(212,175,55,0.8)",
                fontFamily: "Georgia, serif",
                mb: 2.5,
                fontSize: "1rem",
              }}
            >
              Scan the QR code below using your WhatsApp app
            </Typography>
            <Box
              sx={{
                display: "inline-block",
                p: 2,
                background: "#fff",
                borderRadius: "12px",
                border: "3px solid #D4AF37",
                boxShadow: "0 4px 20px rgba(212,175,55,0.3)",
              }}
            >
              <img src={QR} id="qrcode_box" style={{ width: 220, height: 220, display: "block" }} />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

export default ScanPage;
