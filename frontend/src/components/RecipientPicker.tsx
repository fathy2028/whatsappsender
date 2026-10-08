import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import CheckBoxOutlineBlankRoundedIcon from "@mui/icons-material/CheckBoxOutlineBlankRounded";
import CheckBoxRoundedIcon from "@mui/icons-material/CheckBoxRounded";
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
  /** Plural noun for the master toggle, e.g. "groups" / "contacts". */
  itemNoun?: string;
};

/**
 * Cap how many rows the dropdown renders at once. With ~1700 contacts an
 * unbounded listbox makes every keystroke janky; "select all" still applies to
 * every match, not just the rendered slice.
 */
const LISTBOX_LIMIT = 150;

const filterOptions = createFilterOptions<Recipient>({
  limit: LISTBOX_LIMIT,
  stringify: (o) => `${o.name} ${o.detail ?? ""}`,
});

/**
 * Multi-select recipient chooser with per-row checkboxes, search, and a master
 * select-all toggle. Shared by the group and contact campaign pages.
 */
function RecipientPicker({
  label,
  options,
  value,
  onChange,
  accent = tokens.emerald,
  placeholder = "Search…",
  emptyText = "Nothing to choose from yet",
  itemNoun = "items",
}: RecipientPickerProps) {
  const [query, setQuery] = useState("");

  /** Set lookup — `value` can hold well over a thousand entries. */
  const selectedIds = useMemo(() => new Set(value.map((v) => v.id)), [value]);

  /** Options matching the search box, so the master toggle follows the filter. */
  const matching = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(q) || (o.detail ?? "").toLowerCase().includes(q)
    );
  }, [options, query]);

  const matchedSelected = useMemo(
    () => matching.reduce((n, o) => (selectedIds.has(o.id) ? n + 1 : n), 0),
    [matching, selectedIds]
  );

  const allMatchedSelected = matching.length > 0 && matchedSelected === matching.length;
  const someMatchedSelected = matchedSelected > 0 && !allMatchedSelected;
  const searching = query.trim().length > 0;

  /** Tick or untick every option currently matching the search. */
  const toggleAll = () => {
    if (allMatchedSelected) {
      const drop = new Set(matching.map((o) => o.id));
      onChange(value.filter((v) => !drop.has(v.id)));
      return;
    }
    const merged = new Map(value.map((v) => [v.id, v]));
    matching.forEach((o) => merged.set(o.id, o));
    onChange([...merged.values()]);
  };

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
        <Chip
          size="small"
          label={`${value.length} selected`}
          sx={{
            color: value.length ? accent : tokens.textMuted,
            borderColor: value.length ? `${accent}66` : tokens.stroke,
            background: value.length ? `${accent}1A` : tokens.surface,
          }}
        />
      </Box>

      {/* ---- master select-all bar ---- */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          mb: 1.4,
          pl: 0.5,
          pr: 1.2,
          py: 0.6,
          borderRadius: "12px",
          border: `1px solid ${allMatchedSelected ? `${accent}55` : tokens.stroke}`,
          background: allMatchedSelected ? `${accent}12` : "rgba(255,255,255,.028)",
          transition: "background .2s ease, border-color .2s ease",
        }}
      >
        <Checkbox
          checked={allMatchedSelected}
          indeterminate={someMatchedSelected}
          onChange={toggleAll}
          disabled={matching.length === 0}
          icon={<CheckBoxOutlineBlankRoundedIcon fontSize="small" />}
          checkedIcon={<CheckBoxRoundedIcon fontSize="small" />}
          inputProps={{ "aria-label": `Select all ${itemNoun}` }}
          sx={{
            color: tokens.textMuted,
            "&.Mui-checked, &.MuiCheckbox-indeterminate": { color: accent },
          }}
        />
        <Box
          onClick={matching.length === 0 ? undefined : toggleAll}
          sx={{
            flex: 1,
            minWidth: 0,
            cursor: matching.length === 0 ? "default" : "pointer",
            userSelect: "none",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.88rem",
              fontWeight: 600,
              color: matching.length === 0 ? tokens.textMuted : tokens.textPrimary,
            }}
          >
            {allMatchedSelected ? "Deselect" : "Select"} all{" "}
            {searching ? `${matching.length} matching` : matching.length} {itemNoun}
          </Typography>
          {searching && (
            <Typography sx={{ fontSize: "0.72rem", color: tokens.textMuted }}>
              Applies to your current search only
            </Typography>
          )}
        </Box>

        <Button
          size="small"
          startIcon={<ClearAllRoundedIcon sx={{ fontSize: "0.95rem !important" }} />}
          onClick={() => onChange([])}
          disabled={value.length === 0}
          sx={{ fontSize: "0.76rem", py: 0.4, flexShrink: 0 }}
        >
          Clear
        </Button>
      </Box>

      <Autocomplete
        multiple
        disableCloseOnSelect
        fullWidth
        disableListWrap
        options={options}
        value={value}
        filterOptions={filterOptions}
        onChange={(_, next) => onChange(next as Recipient[])}
        inputValue={query}
        onInputChange={(_, v, reason) => {
          // Keep the typed query when picking an option, so several matches can
          // be ticked from one search without retyping it.
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

      {matching.length > LISTBOX_LIMIT && (
        <Typography sx={{ mt: 0.9, fontSize: "0.74rem", color: tokens.textMuted }}>
          Showing the first {LISTBOX_LIMIT} of {matching.length} — search to narrow the list. The
          checkbox above still selects all {matching.length}.
        </Typography>
      )}
    </Box>
  );
}

export default RecipientPicker;
