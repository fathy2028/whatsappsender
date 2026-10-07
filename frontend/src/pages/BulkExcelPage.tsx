import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation } from "react-query";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import BackupTableRoundedIcon from "@mui/icons-material/BackupTableRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import PageShell from "../components/PageShell";
import GlassCard from "../components/GlassCard";
import FileDropzone from "../components/FileDropzone";
import SubmitButton from "../components/SubmitButton";
import { sendXlsx } from "../api/api";
import { tokens } from "../theme";

type Row = Record<string, unknown>;

function BulkExcel() {
  const { username } = useParams();
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [colname, setColname] = useState("");
  const [message, setMessage] = useState("");

  /** Read headers + rows locally so we can preview before sending. */
  const loadWorkbook = (picked: File | null) => {
    setFile(picked);
    setColumns([]);
    setRows([]);
    setColname("");
    setMessage("");
    if (!picked) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target?.result, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
        if (!matrix.length) {
          toast.error("That sheet looks empty");
          return;
        }
        const headers = (matrix[0] as string[]).map((h) => String(h ?? "").trim()).filter(Boolean);
        setColumns(headers);
        setRows(XLSX.utils.sheet_to_json(sheet) as Row[]);
      } catch {
        toast.error("Could not read that spreadsheet");
      }
    };
    reader.readAsBinaryString(picked);
  };

  const mutation = useMutation((fd: FormData) => sendXlsx(fd), {
    onSuccess: () => {
      toast.success(`Campaign queued for ${rows.length} row(s)`);
    },
    onError: () => {
      toast.error("Sending failed — check your columns and session");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      toast.error("Upload a spreadsheet first");
      return;
    }
    if (!colname || !message) {
      toast.error("Pick both the number and message columns");
      return;
    }

    const fd = new FormData();
    fd.append("username", username!);
    fd.append("message", message);
    fd.append("colname", colname);
    fd.append("file", file);
    mutation.mutate(fd);
  };

  /** First few resolved rows, so the mapping can be sanity-checked. */
  const preview = useMemo(() => {
    if (!colname || !message) return [];
    return rows.slice(0, 3).map((r) => ({
      number: String(r[colname] ?? "—"),
      text: String(r[message] ?? "—"),
    }));
  }, [rows, colname, message]);

  const ready = Boolean(file && colname && message);

  return (
    <PageShell
      title="Excel Campaign"
      subtitle="Upload a spreadsheet and map its columns — each recipient gets their own personalised message."
      icon={TableChartRoundedIcon}
      accent={tokens.cyanLight}
      badge="Personalised"
      width={820}
    >
      <GlassCard topAccent className="anim-fade-up d-2" component="form" onSubmit={handleSubmit}>
        <Typography variant="overline" sx={{ display: "block", mb: 1.4 }}>
          Spreadsheet
        </Typography>
        <FileDropzone
          accept=".xlsx,.xls,.csv"
          label="Drop your .xlsx or .csv here"
          hint="The first sheet is used — its header row becomes your columns"
          file={file}
          onFile={loadWorkbook}
          icon={BackupTableRoundedIcon}
          accent={tokens.cyanLight}
        />

        {columns.length > 0 && (
          <Box
            className="anim-fade-up"
            sx={{ mt: 2, display: "flex", gap: 0.8, flexWrap: "wrap", alignItems: "center" }}
          >
            <Chip
              size="small"
              label={`${rows.length} row${rows.length === 1 ? "" : "s"}`}
              sx={{
                color: tokens.emeraldLight,
                borderColor: "rgba(16,185,129,.4)",
                background: "rgba(16,185,129,.12)",
              }}
            />
            <Chip
              size="small"
              label={`${columns.length} column${columns.length === 1 ? "" : "s"} detected`}
              sx={{ color: tokens.textSecondary }}
            />
          </Box>
        )}

        <Divider sx={{ my: 3.4 }} />

        {/* ---- column mapping ---- */}
        <Typography variant="overline" sx={{ display: "block", mb: 1.6 }}>
          Column mapping
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2.2,
          }}
        >
          <TextField
            select
            required
            fullWidth
            label="Phone number column"
            value={colname}
            onChange={(e) => setColname(e.target.value)}
            disabled={!columns.length}
            helperText={columns.length ? "Must include country codes" : "Upload a file first"}
            InputProps={{
              startAdornment: (
                <PhoneRoundedIcon sx={{ fontSize: "1rem", color: tokens.textMuted, mr: 1 }} />
              ),
            }}
          >
            {columns.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            required
            fullWidth
            label="Message column"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!columns.length}
            helperText={columns.length ? "Per-row message body" : "Upload a file first"}
            InputProps={{
              startAdornment: (
                <ChatBubbleRoundedIcon sx={{ fontSize: "1rem", color: tokens.textMuted, mr: 1 }} />
              ),
            }}
          >
            {columns.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* ---- mapping preview ---- */}
        {preview.length > 0 && (
          <Box className="anim-fade-up" sx={{ mt: 3.4 }}>
            <Typography variant="overline" sx={{ display: "block", mb: 1.4 }}>
              Preview · first {preview.length} row(s)
            </Typography>
            <Box
              sx={{
                borderRadius: "13px",
                border: `1px solid ${tokens.stroke}`,
                overflow: "hidden",
              }}
            >
              {preview.map((p, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "180px 1fr" },
                    gap: { xs: 0.4, sm: 2 },
                    px: 2,
                    py: 1.5,
                    borderTop: i === 0 ? "none" : `1px solid ${tokens.stroke}`,
                    background: i % 2 ? "rgba(255,255,255,.015)" : "transparent",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: tokens.fontMono,
                      fontSize: "0.82rem",
                      color: tokens.emeraldLight,
                    }}
                  >
                    {p.number}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      color: tokens.textSecondary,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <SubmitButton
          loading={mutation.isLoading}
          success={mutation.isSuccess}
          disabled={!ready}
        >
          Run campaign{rows.length ? ` · ${rows.length} row(s)` : ""}
        </SubmitButton>
      </GlassCard>
    </PageShell>
  );
}

export default BulkExcel;
