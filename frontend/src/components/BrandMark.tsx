import Box from "@mui/material/Box";

/** Gradient paper-plane glyph used as the app logo. */
function BrandMark({ size = 36, glow = true }: { size?: number; glow?: boolean }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: `${size * 0.3}px`,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        background: "linear-gradient(135deg, #10B981 0%, #06B6D4 100%)",
        boxShadow: glow
          ? "0 6px 20px rgba(16,185,129,.42), inset 0 1px 0 rgba(255,255,255,.3)"
          : "inset 0 1px 0 rgba(255,255,255,.25)",
      }}
    >
      <svg
        width={size * 0.56}
        height={size * 0.56}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M21.4 2.6 2.9 9.3c-.9.3-.9 1.6 0 1.9l6.4 2.2 2.2 6.4c.3.9 1.6.9 1.9 0l6.7-18.5c.3-.8-.5-1.5-1.3-1.2l-.4.5Z"
          fill="#04140E"
          fillOpacity="0.9"
        />
        <path d="M9.6 13.6 21.6 2.4" stroke="#04140E" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </Box>
  );
}

export default BrandMark;
