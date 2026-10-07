import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation } from "react-query";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import PageShell from "../components/PageShell";
import GlassCard from "../components/GlassCard";
import NumbersInput from "../components/NumbersInput";
import { parseNumbers } from "../utils/numbers";
import FileDropzone from "../components/FileDropzone";
import SubmitButton from "../components/SubmitButton";
import { sendImage } from "../api/api";
import { tokens } from "../theme";

function BulkImage() {
  const { username } = useParams();
  const [raw, setRaw] = useState("");
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const numbers = parseNumbers(raw);

  const mutation = useMutation((fd: FormData) => sendImage(fd), {
    onSuccess: () => {
      toast.success("Image queued for delivery");
    },
    onError: () => {
      toast.error("Sending failed — check the numbers and your session");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!numbers.length) {
      toast.error("Add at least one phone number");
      return;
    }
    if (!image) {
      toast.error("Choose an image to send");
      return;
    }

    const fd = new FormData();
    fd.append("username", username!);
    fd.append("caption", caption);
    fd.append("image", image);
    fd.append("phoneNumbers", numbers.join("\n"));
    mutation.mutate(fd);
  };

  return (
    <PageShell
      title="Bulk Images"
      subtitle="Attach one image and a shared caption, then deliver it across your recipient list."
      icon={ImageRoundedIcon}
      accent={tokens.cyan}
      badge="Media"
    >
      <GlassCard topAccent className="anim-fade-up d-2" component="form" onSubmit={handleSubmit}>
        <NumbersInput value={raw} onChange={setRaw} rows={5} />

        <Divider sx={{ my: 3.4 }} />

        <Typography variant="overline" sx={{ display: "block", mb: 1.4 }}>
          Image
        </Typography>
        <FileDropzone
          accept="image/*"
          label="Drop an image here"
          hint="PNG, JPG, GIF or WebP — click to browse"
          file={image}
          onFile={setImage}
          icon={AddPhotoAlternateRoundedIcon}
          accent={tokens.cyan}
          preview="image"
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
            placeholder="Optional text shown beneath the image…"
          />
        </Box>

        <SubmitButton
          loading={mutation.isLoading}
          success={mutation.isSuccess}
          disabled={!numbers.length || !image}
        >
          Send image to {new Set(numbers).size || 0} recipient(s)
        </SubmitButton>
      </GlassCard>
    </PageShell>
  );
}

export default BulkImage;
