import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import CheckBoxOutlineBlankRoundedIcon from "@mui/icons-material/CheckBoxOutlineBlankRounded";
import CheckBoxRoundedIcon from "@mui/icons-material/CheckBoxRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import ClearAllRoundedIcon from "@mui/icons-material/ClearAllRounded";
import { tokens } from "../theme";

export type Recipient = {
  /** Target jid — group (@g.us) or user (@s.whatsapp.net). */
  id: string;
  /** Display name. */
  name: string;
  /** Secondary line: phone number, or the group id. */
  detail?: string;
  /** Shown as a small tag on the row (e.g. "saved"). */
  tag?: string;
};

type RecipientPickerProps = {
  label: string;
  options: Recipient[];
  value: Recipient[];
  onChange: (next: Recipient[]) => void;
  accent?: string;
  placeholder?: string;
  emptyText?: string;
};

/**
 * Multi-select recipient chooser with checkboxes, search, and bulk
 * select-all / clear actions. Used for both groups and contacts.
 */
function RecipientPicker({
  label,
  options,
  value,
  onChange,
  accent = tokens.emerald,
  placeholder = "Search…",
  emptyText = "Nothing to choose from yet",
}: RecipientPickerProps) {
  const [query, setQuery] = useState("");

  /** Options matching the current search box text, for "select all filtered". */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        (o.detail ?? "").toLowerCase().includes(q)
    );
  }, [options, query]);

  const selectAll = () => {
    const merged = new Map(value.map((v) => [v.id, v]));
    filtered.forEach((o) => merged.set(o.id, o));
    onChange([...merged.values()]);
  };

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((o) => value.some((v) => v.id === o.id));

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          mb: 1.3,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="overline">{label}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
          <Chip
            size="small"
            label={`${value.length} selected`}
            sx={{
              color: value.length ? accent : tokens.textMuted,
              borderColor: value.length ? `${accent}66` : tokens.stroke,
              background: value.length ? `${accent}1A` : tokens.surface,
            }}
          />
          <Button
            size="small"
            startIcon={<DoneAllRoundedIcon sx={{ fontSize: "0.95rem !important" }} />}
            onClick={selectAll}
            disabled={filtered.length === 0 || allFilteredSelected}
            sx={{ fontSize: "0.76rem", py: 0.4 }}
          >
            {query.trim() ? `Select ${filtered.length} shown` : "Select all"}
          </Button>
          <Button
            size="small"
            startIcon={<ClearAllRoundedIcon sx={{ fontSize: "0.95rem !important" }} />}
            onClick={() => onChange([])}
            disabled={value.length === 0}
            sx={{ fontSize: "0.76rem", py: 0.4 }}
          >
            Clear
          </Button>
        </Box>
      </Box>

      <Autocomplete
        multiple
        disableCloseOnSelect
        fullWidth
        options={options}
        value={value}
        onChange={(_, next) => onChange(next as Recipient[])}
        inputValue={query}
        onInputChange={(_, v, reason) => {
          // Keep the typed query when picking an option, so you can tick
          // several matches from one search without retyping it.
          if (reason !== "reset") setQuery(v);
        }}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        getOptionLabel={(o) => o.name}
        noOptionsText={emptyText}
        limitTags={6}
        renderOption={(props, option, { selected }) => (
          <Box component="li" {...props} key={option.id} sx={{ gap: 0.5 }}>
            <Checkbox
              icon={<CheckBoxOutlineBlankRoundedIcon fontSize="small" />}
              checkedIcon={<CheckBoxRoundedIcon fontSize="small" />}
              checked={selected}
              sx={{ mr: 0.8, color: tokens.textMuted, "&.Mui-checked": { color: accent } }}
            />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                <Typography
                  sx={{
                    fontSize: "0.9rem",
                    color: tokens.textPrimary,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {option.name}
                </Typography>
                {option.tag && (
                  <Box
                    sx={{
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: accent,
                      border: `1px solid ${accent}55`,
                      background: `${accent}14`,
                      borderRadius: "5px",
                      px: 0.7,
                      py: "1px",
                      flexShrink: 0,
                    }}
                  >
                    {option.tag}
                  </Box>
                )}
              </Box>
              {option.detail && (
                <Typography
                  sx={{
                    fontFamily: tokens.fontMono,
                    fontSize: "0.68rem",
                    color: tokens.textMuted,
                  }}
                >
                  {option.detail}
                </Typography>
              )}
            </Box>
          </Box>
        )}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => {
            const { key, ...chipProps } = getTagProps({ index });
            return (
              <Chip
                {...chipProps}
                key={key}
                size="small"
                label={option.name}
                sx={{
                  color: accent,
                  borderColor: `${accent}55`,
                  background: `${accent}14`,
                  maxWidth: 190,
                }}
              />
            );
          })
        }
        renderInput={(params) => (
          <TextField {...params} placeholder={value.length ? "" : placeholder} />
        )}
      />
    </Box>
  );
}

export default RecipientPicker;
