import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation } from "react-query";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import MovieRoundedIcon from "@mui/icons-material/MovieRounded";
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";
import PageShell from "../components/PageShell";
import GlassCard from "../components/GlassCard";
import NumbersInput from "../components/NumbersInput";
import { parseNumbers } from "../utils/numbers";
import FileDropzone from "../components/FileDropzone";
import SubmitButton from "../components/SubmitButton";
import { sendVideo } from "../api/api";
import { tokens } from "../theme";

function BulkVideo() {
  const { username } = useParams();
  const [raw, setRaw] = useState("");
  const [caption, setCaption] = useState("");
  const [video, setVideo] = useState<File | null>(null);

  const numbers = parseNumbers(raw);

  const mutation = useMutation((fd: FormData) => sendVideo(fd), {
    onSuccess: () => {
      toast.success("Video queued for delivery");
    },
    onError: (e) => {
      toast.error(`Sending failed — ${e}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!numbers.length) {
      toast.error("Add at least one phone number");
      return;
    }
    if (!video) {
      toast.error("Choose a video to send");
      return;
    }

    const fd = new FormData();
    fd.append("username", username!);
    fd.append("caption", caption);
    fd.append("video", video);
    fd.append("phoneNumbers", numbers.join("\n"));
    mutation.mutate(fd);
  };

  return (
    <PageShell
      title="Bulk Video"
      subtitle="Push a video with an optional caption to every number on your list."
      icon={MovieRoundedIcon}
      accent={tokens.amber}
      badge="Media"
    >
      <GlassCard topAccent className="anim-fade-up d-2" component="form" onSubmit={handleSubmit}>
        <NumbersInput value={raw} onChange={setRaw} rows={5} />

        <Divider sx={{ my: 3.4 }} />

        <Typography variant="overline" sx={{ display: "block", mb: 1.4 }}>
          Video
        </Typography>
        <FileDropzone
          accept="video/*"
          label="Drop a video here"
          hint="MP4 or WebM works best — click to browse"
          file={video}
          onFile={setVideo}
          icon={VideoCallRoundedIcon}
          accent={tokens.amber}
          preview="video"
        />

        <Box sx={{ mt: 3.4 }}>
          <Typography variant="overline" sx={{ display: "block", mb: 1.1 }}>
            Caption
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Optional text shown beneath the video…"
          />
        </Box>

        <SubmitButton
          loading={mutation.isLoading}
          success={mutation.isSuccess}
          disabled={!numbers.length || !video}
        >
          Send video to {new Set(numbers).size || 0} recipient(s)
        </SubmitButton>
      </GlassCard>
    </PageShell>
  );
}

export default BulkVideo;
