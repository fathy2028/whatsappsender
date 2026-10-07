import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import { tokens } from "../theme";
import { parseNumbers } from "../utils/numbers";

type NumbersInputProps = {
  value: string;
  onChange: (raw: string) => void;
  rows?: number;
  label?: string;
};

/** Multiline recipient list with a live, de-duplicated recipient count. */
function NumbersInput({
  value,
  onChange,
  rows = 6,
  label = "Recipients",
}: NumbersInputProps) {
  const numbers = parseNumbers(value);
  const unique = new Set(numbers).size;
  const dupes = numbers.length - unique;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.1,
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.9 }}>
          <PhoneRoundedIcon sx={{ fontSize: "1rem", color: tokens.textMuted }} />
          <Typography
            sx={{
              fontSize: "0.72rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: tokens.textMuted,
            }}
          >
            {label}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 0.7 }}>
          <Chip
            size="small"
            label={`${unique} number${unique === 1 ? "" : "s"}`}
            sx={{
              color: unique ? tokens.emeraldLight : tokens.textMuted,
              borderColor: unique ? "rgba(16,185,129,.4)" : tokens.stroke,
              background: unique ? "rgba(16,185,129,.12)" : tokens.surface,
            }}
          />
          {dupes > 0 && (
            <Chip
              size="small"
              label={`${dupes} duplicate${dupes === 1 ? "" : "s"}`}
              sx={{
                color: tokens.amber,
                borderColor: "rgba(245,158,11,.4)",
                background: "rgba(245,158,11,.12)",
              }}
            />
          )}
        </Box>
      </Box>

      <TextField
        required
        fullWidth
        multiline
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"201234567890\n201234567891\n201234567892"}
        InputProps={{
          sx: { fontFamily: tokens.fontMono, fontSize: "0.88rem", lineHeight: 1.75 },
        }}
      />
      <Typography sx={{ mt: 0.9, fontSize: "0.76rem", color: tokens.textMuted }}>
        One number per line — commas and semicolons work too. Include the country code.
      </Typography>
    </Box>
  );
}

export default NumbersInput;
