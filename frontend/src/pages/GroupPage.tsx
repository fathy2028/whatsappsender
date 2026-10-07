import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import PageShell from "../components/PageShell";
import GlassCard from "../components/GlassCard";
import RecipientPicker, { type Recipient } from "../components/RecipientPicker";
import AttachmentsInput from "../components/AttachmentsInput";
import JobProgress from "../components/JobProgress";
import { estimateRange } from "../utils/format";
import SubmitButton from "../components/SubmitButton";
import { getGroups, sendCampaign, type Group } from "../api/api";
import { tokens } from "../theme";

const ACCENT = tokens.rose;

function GroupPage() {
  const { username } = useParams();
  const [selected, setSelected] = useState<Recipient[]>([]);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<Group[]>(
    `groups ${username}`,
    () => getGroups(username!)
  );

  const options: Recipient[] = useMemo(
    () =>
      (data ?? []).map((g) => ({
        id: g.id,
        name: g.name || "Untitled group",
        // Group names repeat, so the id is what tells them apart.
        detail: g.id.replace("@g.us", ""),
      })),
    [data]
  );

  const mutation = useMutation(sendCampaign, {
    onSuccess: (res) => {
      setJobId(res.jobId);
      toast.success(`Campaign started for ${selected.length} group(s)`);
    },
    onError: () => {
      toast.error("Could not start the campaign");
    },
  });

  const totalSends = selected.length * Math.max(files.length, 1);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selected.length === 0) {
      toast.error("Pick at least one group");
      return;
    }
    if (files.length === 0 && !message.trim()) {
      toast.error("Write a message or attach a file");
      return;
    }
    mutation.mutate({
      username: username!,
      targets: selected.map((s) => s.id),
      message,
      files,
    });
  };

  const shell = (children: React.ReactNode) => (
    <PageShell
      title="Group Campaign"
      subtitle="Pick any number of groups and send them text, images, video, audio or documents."
      icon={GroupsRoundedIcon}
      accent={ACCENT}
      badge="Groups"
      width={760}
    >
      {children}
    </PageShell>
  );

  if (isLoading)
    return shell(
      <GlassCard topAccent>
        <Skeleton variant="text" width={140} height={20} />
        <Skeleton variant="rounded" height={56} sx={{ mt: 1.5, borderRadius: "12px" }} />
        <Divider sx={{ my: 3.4 }} />
        <Skeleton variant="rounded" height={132} sx={{ borderRadius: "12px" }} />
        <Skeleton variant="rounded" height={52} sx={{ mt: 3, borderRadius: "12px" }} />
      </GlassCard>
    );

  if (isError)
    return shell(
      <GlassCard className="anim-pop" sx={{ textAlign: "center" }}>
        <Box
          sx={{
            width: 62,
            height: 62,
            mx: "auto",
            mb: 2.5,
            borderRadius: "18px",
            display: "grid",
            placeItems: "center",
            background: "rgba(244,63,94,.14)",
            border: "1px solid rgba(244,63,94,.35)",
          }}
        >
          <ErrorOutlineRoundedIcon sx={{ fontSize: "1.9rem", color: tokens.rose }} />
        </Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Couldn’t load your groups
        </Typography>
        <Typography sx={{ color: tokens.textMuted, mb: 3.2, fontSize: "0.9rem" }}>
          This usually means the session is no longer linked to WhatsApp.
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
          <Button variant="contained" startIcon={<RefreshRoundedIcon />} onClick={() => refetch()}>
            Try again
          </Button>
          <Button variant="outlined" component={Link} to={`/scan/${username}`}>
            Re-scan QR
          </Button>
        </Box>
      </GlassCard>
    );

  return shell(
    <GlassCard topAccent className="anim-fade-up d-2" component="form" onSubmit={handleSubmit}>
      <RecipientPicker
        label={`Groups · ${options.length} available`}
        options={options}
        value={selected}
        onChange={setSelected}
        accent={ACCENT}
        placeholder="Search and tick the groups to send to…"
        emptyText="No groups found for this session"
      />

      <Divider sx={{ my: 3.4 }} />

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.9, mb: 1.1 }}>
        <ChatBubbleRoundedIcon sx={{ fontSize: "1rem", color: tokens.textMuted }} />
        <Typography variant="overline">
          {files.length > 0 ? "Caption" : "Message"}
        </Typography>
      </Box>
      <TextField
        fullWidth
        multiline
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={
          files.length > 0
            ? "Optional caption sent with each attachment…"
            : "Type the message to post in the selected groups…"
        }
      />
      <Typography sx={{ mt: 0.9, fontSize: "0.76rem", color: tokens.textMuted }}>
        {message.length} characters
      </Typography>

      <Divider sx={{ my: 3.4 }} />

      <Typography variant="overline" sx={{ display: "block", mb: 1.4 }}>
        Attachments
      </Typography>
      <AttachmentsInput files={files} onChange={setFiles} accent={ACCENT} />

      {/* ---- send summary ---- */}
      {totalSends > 0 && (
        <Box
          sx={{
            mt: 3.2,
            p: 2,
            borderRadius: "13px",
            background: `${ACCENT}14`,
            border: `1px solid ${ACCENT}38`,
          }}
        >
          <Typography sx={{ fontSize: "0.87rem", color: tokens.textSecondary }}>
            <Box component="span" sx={{ color: ACCENT, fontWeight: 700 }}>
              {totalSends}
            </Box>{" "}
            message{totalSends === 1 ? "" : "s"} total — {Math.max(files.length, 1)} per group ×{" "}
            {selected.length} group{selected.length === 1 ? "" : "s"}
          </Typography>
          <Typography sx={{ mt: 0.6, fontSize: "0.77rem", color: tokens.textMuted }}>
            Paced 60–120s apart to reduce ban risk — about {estimateRange(totalSends)}.
          </Typography>
        </Box>
      )}

      <SubmitButton
        loading={mutation.isLoading}
        disabled={selected.length === 0 || (files.length === 0 && !message.trim())}
      >
        Send to {selected.length || 0} group{selected.length === 1 ? "" : "s"}
      </SubmitButton>

      {jobId && <JobProgress jobId={jobId} />}
    </GlassCard>
  );
}

export default GroupPage;
