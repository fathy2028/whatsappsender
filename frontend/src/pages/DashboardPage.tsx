import CardDashborad from "../components/CardDashborad";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useQuery } from "react-query";
import { Link, useParams } from "react-router-dom";
import { getSummary } from "../api/api";
import NavBarComponent from "../components/NavBarComponent";

const navButtons = [
  { label: "📨 Bulk Messages", path: "bulk" },
  { label: "🖼️ Bulk Images", path: "bulkimage" },
  { label: "📁 Bulk Files", path: "bulkfile" },
  { label: "🎬 Bulk Video", path: "bulkvideo" },
  { label: "📊 Bulk Excel", path: "bulkexcel" },
];

export default function DashboardPage() {
  const { username } = useParams();
  const { data, isLoading, isError } = useQuery(`summary ${username}`, () =>
    getSummary(username!)
  );

  if (isLoading)
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(ellipse at center, #2D1100 0%, #1A0800 70%)",
        }}
      >
        <Typography sx={{ color: "#D4AF37", fontSize: "1.5rem", fontFamily: "Georgia, serif" }}>
          Loading...
        </Typography>
      </Box>
    );

  if (isError)
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1A0800",
        }}
      >
        <Typography sx={{ color: "#D4AF37", fontSize: "1.5rem" }}>Error loading data</Typography>
      </Box>
    );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at top, #2D1100 0%, #1A0800 60%)",
      }}
    >
      <NavBarComponent />

      <Box sx={{ maxWidth: 900, mx: "auto", px: 3, py: 5 }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            color: "#D4AF37",
            fontFamily: "Georgia, serif",
            fontWeight: "bold",
            mb: 0.5,
            textShadow: "0 2px 8px rgba(212,175,55,0.4)",
          }}
        >
          Dashboard
        </Typography>
        <Box
          sx={{
            width: 60,
            height: 3,
            background: "linear-gradient(90deg, transparent, #D4AF37, transparent)",
            mx: "auto",
            mb: 4,
            borderRadius: 2,
          }}
        />

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ justifyContent: "center", mb: 6 }}>
          <Grid item>
            <CardDashborad title="Total Messages Sent" value={data.totalMessages} />
          </Grid>
          <Grid item>
            <CardDashborad
              title="Users on WhatsApp"
              value={data.totalUsersUniqueWhatsAppUsers}
            />
          </Grid>
          <Grid item>
            <CardDashborad
              title="Users not on WhatsApp"
              value={data.totalUsersUniqueNonWhatsAppUsers}
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            color: "rgba(212,175,55,0.75)",
            fontFamily: "Georgia, serif",
            mb: 3,
            letterSpacing: "0.5px",
          }}
        >
          Send Messages
        </Typography>
        <Grid container spacing={2} sx={{ justifyContent: "center" }}>
          {navButtons.map(({ label, path }) => (
            <Grid item key={path}>
              <Link to={`/${path}/${username}`} style={{ textDecoration: "none" }}>
                <Button
                  variant="contained"
                  sx={{
                    minWidth: 160,
                    py: 1.4,
                    px: 2.5,
                    fontSize: "0.9rem",
                    borderRadius: "10px",
                    fontFamily: "Georgia, serif",
                  }}
                >
                  {label}
                </Button>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
