import { useEffect, useRef, useState } from "react";
import type { SvgIconComponent } from "@mui/icons-material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import GlassCard from "./GlassCard";
import { tokens } from "../theme";

/** Counts from 0 to `target` with an ease-out curve. */
function useCountUp(target: number, duration = 1100) {
  const [value, setValue] = useState(0);
  const frame = useRef<number>();

  useEffect(() => {
    if (!Number.isFinite(target)) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    };
  }, [target, duration]);

  return value;
}

type StatCardProps = {
  title: string;
  value: number;
  icon: SvgIconComponent;
  accent?: string;
  /** Share of the total, 0-1 — drawn as a thin meter under the number. */
  share?: number;
  hint?: string;
};

function StatCard({ title, value, icon: Icon, accent = tokens.emerald, share, hint }: StatCardProps) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const display = useCountUp(safeValue);

  return (
    <GlassCard
      topAccent
      interactive
      pad={0}
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      {/* accent wash */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(120% 90% at 100% 0%, ${accent}1F, transparent 62%)`,
          pointerEvents: "none",
        }}
      />

      <Box sx={{ position: "relative", p: { xs: 2.6, sm: 3 }, flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.2 }}>
          <Typography
            sx={{
              fontSize: "0.72rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: tokens.textMuted,
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "12px",
              display: "grid",
              placeItems: "center",
              background: `${accent}1F`,
              border: `1px solid ${accent}3D`,
            }}
          >
            <Icon sx={{ fontSize: "1.2rem", color: accent }} />
          </Box>
        </Box>

        <Typography
          sx={{
            fontFamily: tokens.fontDisplay,
            fontSize: { xs: "2.4rem", sm: "2.85rem" },
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.035em",
            color: tokens.textPrimary,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {display.toLocaleString()}
        </Typography>

        {typeof share === "number" && (
          <Box sx={{ mt: 2.2 }}>
            <Box
              sx={{
                height: 5,
                borderRadius: 999,
                background: "rgba(255,255,255,.07)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${Math.max(0, Math.min(1, share)) * 100}%`,
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${accent}, ${accent}80)`,
                  boxShadow: `0 0 12px ${accent}80`,
                  transition: "width 1.1s cubic-bezier(.2,.8,.2,1)",
                }}
              />
            </Box>
            <Typography sx={{ mt: 1, fontSize: "0.76rem", color: tokens.textMuted }}>
              {hint ?? `${Math.round(Math.max(0, Math.min(1, share)) * 100)}% of total`}
            </Typography>
          </Box>
        )}

        {typeof share !== "number" && hint && (
          <Typography sx={{ mt: 1.6, fontSize: "0.78rem", color: tokens.textMuted }}>{hint}</Typography>
        )}
      </Box>
    </GlassCard>
  );
}

export default StatCard;
