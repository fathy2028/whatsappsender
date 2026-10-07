import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import MovieRoundedIcon from "@mui/icons-material/MovieRounded";
import AudiotrackRoundedIcon from "@mui/icons-material/AudiotrackRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import { tokens } from "../theme";
import { formatBytes, mediaKind } from "../utils/format";

const KIND_META = {
  image: { icon: ImageRoundedIcon, color: tokens.cyan, label: "Photo" },
  video: { icon: MovieRoundedIcon, color: tokens.amber, label: "Video" },
  audio: { icon: AudiotrackRoundedIcon, color: tokens.violet, label: "Audio" },
  file: { icon: DescriptionRoundedIcon, color: tokens.emerald, label: "File" },
} as const;

function Thumb({ file }: { file: File }) {
  const kind = mediaKind(file);
  const meta = KIND_META[kind];
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (kind !== "image" && kind !== "video") return;
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file, kind]);

  if (url && kind === "image")
    return (
      <Box
        component="img"
        src={url}
        alt=""
        sx={{ width: 44, height: 44, borderRadius: "10px", objectFit: "cover", flexShrink: 0 }}
      />
    );
  if (url && kind === "video")
    return (
      <Box
        component="video"
        src={url}
        muted
        sx={{
          width: 44,
          height: 44,
          borderRadius: "10px",
          objectFit: "cover",
          flexShrink: 0,
          background: "#000",
        }}
      />
    );

  const Icon = meta.icon;
  return (
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: "10px",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        background: `${meta.color}1F`,
        border: `1px solid ${meta.color}3D`,
      }}
    >
      <Icon sx={{ fontSize: "1.2rem", color: meta.color }} />
    </Box>
  );
}

type AttachmentsInputProps = {
  files: File[];
  onChange: (files: File[]) => void;
  accent?: string;
  /** Shown under the drop target. */
  hint?: string;
};

/**
 * Multi-file picker: any mime type, drag-and-drop, per-file preview and
 * removal. Each attachment becomes one WhatsApp message per recipient.
 */
function AttachmentsInput({
  files,
  onChange,
  accent = tokens.emerald,
  hint = "Images, video, audio, PDFs — anything. Each becomes its own message.",
}: AttachmentsInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const add = (picked: FileList | null) => {
    if (!picked || picked.length === 0) return;
    const incoming = Array.from(picked);
    // De-duplicate by name+size+mtime so re-picking the same file is a no-op.
    const key = (f: File) => `${f.name}:${f.size}:${f.lastModified}`;
    const seen = new Set(files.map(key));
    onChange([...files, ...incoming.filter((f) => !seen.has(key(f)))]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeAt = (i: number) => onChange(files.filter((_, idx) => idx !== i));

  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);

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
          add(e.dataTransfer.files);
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
          cursor: "pointer",
          borderRadius: "15px",
          px: 3,
          py: files.length ? 2.2 : 3.6,
          textAlign: "center",
          border: `1.5px dashed ${dragging ? accent : tokens.strokeStrong}`,
          background: dragging ? `${accent}1A` : "rgba(255,255,255,.028)",
          transition: "all .24s cubic-bezier(.2,.8,.2,1)",
          "&:hover": { borderColor: accent, background: `${accent}12` },
        }}
      >
        <input ref={inputRef} type="file" multiple hidden onChange={(e) => add(e.target.files)} />
        <Box
          sx={{
            width: 44,
            height: 44,
            mx: "auto",
            mb: 1.3,
            borderRadius: "13px",
            display: "grid",
            placeItems: "center",
            background: `linear-gradient(145deg, ${accent}2E, ${accent}0A)`,
            border: `1px solid ${accent}3D`,
          }}
        >
          <AttachFileRoundedIcon sx={{ fontSize: "1.3rem", color: accent }} />
        </Box>
        <Typography sx={{ fontWeight: 600, fontSize: "0.93rem", color: tokens.textPrimary }}>
          {files.length ? "Add more attachments" : "Attach media (optional)"}
        </Typography>
        <Typography sx={{ mt: 0.4, fontSize: "0.8rem", color: tokens.textMuted }}>{hint}</Typography>
      </Box>

      {files.length > 0 && (
        <Box sx={{ mt: 1.8 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 1,
              px: 0.4,
            }}
          >
            <Typography sx={{ fontSize: "0.76rem", color: tokens.textMuted }}>
              {files.length} attachment{files.length === 1 ? "" : "s"}
            </Typography>
            <Typography sx={{ fontSize: "0.76rem", color: tokens.textMuted }}>
              {formatBytes(totalBytes)} total
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gap: 1 }}>
            {files.map((f, i) => (
              <Box
                key={`${f.name}-${f.size}-${i}`}
                className="anim-fade-up"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.2,
                  borderRadius: "12px",
                  border: `1px solid ${tokens.stroke}`,
                  background: "rgba(255,255,255,.03)",
                }}
              >
                <Thumb file={f} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: "0.87rem",
                      fontWeight: 600,
                      color: tokens.textPrimary,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {f.name}
                  </Typography>
                  <Typography sx={{ fontSize: "0.74rem", color: tokens.textMuted }}>
                    {KIND_META[mediaKind(f)].label} · {formatBytes(f.size)}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => removeAt(i)} aria-label={`Remove ${f.name}`}>
                  <CloseRoundedIcon sx={{ fontSize: "1rem" }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default AttachmentsInput;
