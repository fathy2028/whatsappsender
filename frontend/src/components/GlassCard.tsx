import type { ElementType, FormEventHandler } from "react";
import Box from "@mui/material/Box";
import type { BoxProps } from "@mui/material/Box";
import { tokens } from "../theme";

type GlassCardProps = Omit<BoxProps, "component" | "onSubmit"> & {
  /** Adds a hover lift + brighter border. */
  interactive?: boolean;
  /** Draws a gradient hairline along the top edge. */
  topAccent?: boolean;
  /** Visual padding scale. */
  pad?: number | { xs: number; sm: number };
  /** Render as another element — e.g. react-router's Link. */
  component?: ElementType;
  /** Forwarded to `component` when it is a router Link. */
  to?: string;
  /** Used when rendered as `component="form"`. */
  onSubmit?: FormEventHandler<HTMLFormElement>;
};

/**
 * The single surface primitive the whole app is built from:
 * frosted glass, hairline border, soft depth shadow.
 */
function GlassCard({
  interactive = false,
  topAccent = false,
  pad = { xs: 3, sm: 4 },
  sx,
  children,
  ...rest
}: GlassCardProps) {
  return (
    <Box
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(rest as any)}
      sx={{
        position: "relative",
        p: pad,
        borderRadius: `${tokens.radius}px`,
        background: "rgba(255,255,255,.045)",
        backdropFilter: "blur(26px) saturate(150%)",
        WebkitBackdropFilter: "blur(26px) saturate(150%)",
        border: `1px solid ${tokens.stroke}`,
        boxShadow: "0 18px 50px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.06)",
        overflow: "hidden",
        transition:
          "transform .28s cubic-bezier(.2,.8,.2,1), box-shadow .28s ease, border-color .28s ease, background .28s ease",
        ...(topAccent && {
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: "8%",
            right: "8%",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(52,211,153,.85), rgba(34,211,238,.85), transparent)",
          },
        }),
        ...(interactive && {
          cursor: "pointer",
          "&:hover": {
            transform: "translateY(-5px)",
            borderColor: "rgba(52,211,153,.4)",
            background: "rgba(255,255,255,.07)",
            boxShadow: "0 26px 60px rgba(0,0,0,.55), 0 0 0 1px rgba(52,211,153,.12)",
          },
        }),
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export default GlassCard;
