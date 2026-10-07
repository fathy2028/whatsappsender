import { useEffect, useRef, useState } from "react";
import type { SvgIconComponent } from "@mui/icons-material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { tokens } from "../theme";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`;
}

type FileDropzoneProps = {
  accept: string;
  label: string;
  hint?: string;
  file: File | null;
  onFile: (file: File | null) => void;
  icon?: SvgIconComponent;
  accent?: string;
  /** Render an image/video thumbnail once a file is chosen. */
  preview?: "image" | "video" | "none";
};

/**
 * Drag-and-drop upload surface with click-to-browse, thumbnail preview
 * and a clear-selection affordance.
 */
function FileDropzone({
  accept,
  label,
  hint,
  file,
  onFile,
  icon: Icon = CloudUploadRoundedIcon,
  accent = tokens.emerald,
  preview = "none",
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file || preview === "none") {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, preview]);

  const pick = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onFile(files[0]);
  };

  const clear = () => {
    onFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Box>
      <Box
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        sx={{
          position: "relative",
          cursor: "pointer",
          borderRadius: "16px",
          px: 3,
          py: file ? 2.4 : 4.2,
          textAlign: "center",
          border: `1.5px dashed ${dragging ? accent : file ? `${accent}66` : tokens.strokeStrong}`,
          background: dragging
            ? `${accent}1A`
            : file
            ? `${accent}0D`
            : "rgba(255,255,255,.028)",
          transition: "all .24s cubic-bezier(.2,.8,.2,1)",
          "&:hover": {
            borderColor: accent,
            background: `${accent}14`,
            transform: "translateY(-2px)",
          },
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          hidden
          onChange={(e) => pick(e.target.files)}
        />

        {!file ? (
          <>
            <Box
              className="anim-float"
              sx={{
                width: 52,
                height: 52,
                mx: "auto",
                mb: 1.6,
                borderRadius: "15px",
                display: "grid",
                placeItems: "center",
                background: `linear-gradient(145deg, ${accent}2E, ${accent}0A)`,
                border: `1px solid ${accent}3D`,
              }}
            >
              <Icon sx={{ fontSize: "1.55rem", color: accent }} />
            </Box>
            <Typography sx={{ fontWeight: 600, color: tokens.textPrimary, fontSize: "0.96rem" }}>
              {label}
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: "0.82rem", color: tokens.textMuted }}>
              {hint ?? "Drag & drop here, or click to browse"}
            </Typography>
          </>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, textAlign: "left" }}>
            {previewUrl && preview === "image" ? (
              <Box
                component="img"
                src={previewUrl}
                alt=""
                sx={{
                  width: 54,
                  height: 54,
                  borderRadius: "12px",
                  objectFit: "cover",
                  border: `1px solid ${tokens.stroke}`,
                  flexShrink: 0,
                }}
              />
            ) : previewUrl && preview === "video" ? (
              <Box
                component="video"
                src={previewUrl}
                muted
                sx={{
                  width: 54,
                  height: 54,
                  borderRadius: "12px",
                  objectFit: "cover",
                  border: `1px solid ${tokens.stroke}`,
                  flexShrink: 0,
                  background: "#000",
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: "12px",
                  display: "grid",
                  placeItems: "center",
                  background: `${accent}1F`,
                  border: `1px solid ${accent}3D`,
                  flexShrink: 0,
                }}
              >
                <CheckCircleRoundedIcon sx={{ color: accent, fontSize: "1.3rem" }} />
              </Box>
            )}

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: tokens.textPrimary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {file.name}
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", color: tokens.textMuted, mt: 0.2 }}>
                {formatBytes(file.size)} · ready to send
              </Typography>
            </Box>

            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                clear();
              }}
              aria-label="Remove file"
              sx={{ flexShrink: 0 }}
            >
              <CloseRoundedIcon sx={{ fontSize: "1.05rem" }} />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default FileDropzone;
