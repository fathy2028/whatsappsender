import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";

function CardDashborad({ title, value }: { title: string; value: number }) {
  return (
    <Card
      sx={{
        width: 220,
        background: "linear-gradient(145deg, #3E1A00 0%, #2D1100 100%)",
        border: "1px solid rgba(212, 175, 55, 0.5)",
        boxShadow: "0 4px 20px rgba(212, 175, 55, 0.15)",
        borderRadius: "12px",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 30px rgba(212, 175, 55, 0.3)",
        },
      }}
    >
      <CardContent sx={{ textAlign: "center", py: 3 }}>
        <Typography
          sx={{ fontSize: 13, color: "rgba(212,175,55,0.75)", mb: 1, fontFamily: "Georgia, serif" }}
          gutterBottom
        >
          {title}
        </Typography>
        <Box
          sx={{
            fontSize: "2.8rem",
            fontWeight: "bold",
            color: "#D4AF37",
            fontFamily: "Georgia, serif",
            lineHeight: 1,
            textShadow: "0 2px 8px rgba(212, 175, 55, 0.4)",
          }}
        >
          {value}
        </Box>
      </CardContent>
    </Card>
  );
}

export default CardDashborad;
