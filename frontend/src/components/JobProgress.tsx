import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Collapse from "@mui/material/Collapse";
import Button from "@mui/material/Button";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import PersonOffRoundedIcon from "@mui/icons-material/PersonOffRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { getJob, type BulkJob } from "../api/api";
import { tokens } from "../theme";
import { estimateRange } from "../utils/format";

type JobProgressProps = {
  jobId: string;
  onDone?: (job: BulkJob) => void;
};

/**
 * Polls /jobs/:id while a campaign runs. Sends are paced 60-120s apart, so a
 * large campaign takes hours — without this the UI would look frozen.
 */
function JobProgress({ jobId, onDone }: JobProgressProps) {
  const [job, setJob] = useState<BulkJob | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const next = await getJob(jobId);
        if (!active) return;
        setJob(next);
        if (next.status === "completed") {
          onDone?.(next);
          return;
        }
      } catch {
        // Transient failures are fine — just try again on the next tick.
      }
      if (active) timer = setTimeout(poll, 3000);
    };

    poll();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [jobId, onDone]);

  if (!job) return null;

  const done = job.sent + job.notOnWhatsapp + job.failed;
  const pct = job.total > 0 ? (done / job.total) * 100 : 0;
  const running = job.status === "running";
  const remaining = Math.max(0, job.total - done);

  const stats = [
    { label: "Sent", value: job.sent, color: tokens.emeraldLight, icon: CheckCircleRoundedIcon },
    { label: "Unreachable", value: job.notOnWhatsapp, color: tokens.amber, icon: PersonOffRoundedIcon },
    { label: "Failed", value: job.failed, color: tokens.rose, icon: ErrorOutlineRoundedIcon },
  ];

  return (
    <Box
      className="anim-fade-up"
      sx={{
        mt: 3,
        p: 2.4,
        borderRadius: "15px",
        border: `1px solid ${running ? "rgba(16,185,129,.3)" : tokens.stroke}`,
        background: running ? "rgba(16,185,129,.07)" : "rgba(255,255,255,.03)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          mb: 1.6,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          {running && (
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: tokens.emeraldLight,
                animation: "pulse-ring 2s infinite",
              }}
            />
          )}
          <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", color: tokens.textPrimary }}>
            {running ? "Campaign running" : "Campaign finished"}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: "0.82rem", color: tokens.textSecondary }}>
          {done} / {job.total} messages
        </Typography>
      </Box>

      <LinearProgress variant="determinate" value={pct} />

      <Box
        sx={{
          mt: 2,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1.2,
        }}
      >
        {stats.map(({ label, value, color, icon: Icon }) => (
          <Box
            key={label}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 1.1,
              borderRadius: "10px",
              background: "rgba(0,0,0,.2)",
              border: `1px solid ${tokens.stroke}`,
            }}
          >
            <Icon sx={{ fontSize: "1rem", color, flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: "1rem", fontWeight: 700, color, lineHeight: 1.1 }}>
                {value}
              </Typography>
              <Typography sx={{ fontSize: "0.68rem", color: tokens.textMuted }}>{label}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {running && remaining > 0 && (
        <Typography sx={{ mt: 1.6, fontSize: "0.78rem", color: tokens.textMuted }}>
          {remaining} left · roughly {estimateRange(remaining)} remaining. You can leave this page —
          the campaign keeps running on the server.
        </Typography>
      )}

      {job.errors.length > 0 && (
        <Box sx={{ mt: 1.6 }}>
          <Button
            size="small"
            onClick={() => setShowErrors((v) => !v)}
            endIcon={
              <ExpandMoreRoundedIcon
                sx={{
                  transform: showErrors ? "rotate(180deg)" : "none",
                  transition: "transform .2s",
                }}
              />
            }
            sx={{ fontSize: "0.78rem", color: tokens.rose }}
          >
            {job.errors.length} error{job.errors.length === 1 ? "" : "s"}
          </Button>
          <Collapse in={showErrors}>
            <Box
              sx={{
                mt: 1,
                p: 1.4,
                borderRadius: "10px",
                background: "rgba(244,63,94,.08)",
                border: "1px solid rgba(244,63,94,.22)",
                maxHeight: 180,
                overflowY: "auto",
              }}
            >
              {job.errors.slice(0, 50).map((e, i) => (
                <Typography
                  key={i}
                  sx={{
                    fontFamily: tokens.fontMono,
                    fontSize: "0.72rem",
                    color: tokens.textSecondary,
                    wordBreak: "break-all",
                  }}
                >
                  {e}
                </Typography>
              ))}
            </Box>
          </Collapse>
        </Box>
      )}
    </Box>
  );
}

export default JobProgress;
