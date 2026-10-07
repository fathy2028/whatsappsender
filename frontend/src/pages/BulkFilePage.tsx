import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation } from "react-query";
import { toast } from "react-toastify";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import PageShell from "../components/PageShell";
import GlassCard from "../components/GlassCard";
import NumbersInput from "../components/NumbersInput";
import { parseNumbers } from "../utils/numbers";
import FileDropzone from "../components/FileDropzone";
import SubmitButton from "../components/SubmitButton";
import { sendFile } from "../api/api";
import { tokens } from "../theme";

function BulkFile() {
  const { username } = useParams();
  const [raw, setRaw] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const numbers = parseNumbers(raw);

  const mutation = useMutation((fd: FormData) => sendFile(fd), {
    onSuccess: () => {
      toast.success("Document queued for delivery");
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
    if (!file) {
      toast.error("Choose a file to send");
      return;
    }

    const fd = new FormData();
    fd.append("username", username!);
    fd.append("file", file);
    fd.append("phoneNumbers", numbers.join("\n"));
    mutation.mutate(fd);
  };

  return (
    <PageShell
      title="Bulk Files"
      subtitle="Deliver any document — PDF, archive, spreadsheet or audio — to your recipient list."
      icon={DescriptionRoundedIcon}
      accent={tokens.violet}
      badge="Documents"
    >
      <GlassCard topAccent className="anim-fade-up d-2" component="form" onSubmit={handleSubmit}>
        <NumbersInput value={raw} onChange={setRaw} rows={6} />

        <Divider sx={{ my: 3.4 }} />

        <Typography variant="overline" sx={{ display: "block", mb: 1.4 }}>
          Attachment
        </Typography>
        <FileDropzone
          accept="*"
          label="Drop a file here"
          hint="Any file type — click to browse"
          file={file}
          onFile={setFile}
          icon={UploadFileRoundedIcon}
          accent={tokens.violet}
        />

        <SubmitButton
          loading={mutation.isLoading}
          success={mutation.isSuccess}
          disabled={!numbers.length || !file}
        >
          Send file to {new Set(numbers).size || 0} recipient(s)
        </SubmitButton>
      </GlassCard>
    </PageShell>
  );
}

export default BulkFile;
