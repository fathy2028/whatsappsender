import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import PageShell from "../components/PageShell";
import GlassCard from "../components/GlassCard";
import SubmitButton from "../components/SubmitButton";
import { getGroups, sendMessage } from "../api/api";
import { tokens } from "../theme";

type Group = { label: string; id: string };

function GroupPage() {
  const { username } = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [message, setMessage] = useState("");

  const { data, isLoading, isError, refetch } = useQuery<Group[]>(
    `groups ${username}`,
    () => getGroups(username!)
  );

  const mutation = useMutation(
    (payload: { id: string; message: string; username: string }) =>
      sendMessage(payload.id, payload.message, payload.username),
    {
      onSuccess: () => {
      toast.success("Message posted to the group");
    },
      onError: () => {
      toast.error("Could not post to that group");
    },
    }
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!group?.id) {
      toast.error("Pick a group first");
      return;
    }
    if (!message.trim()) {
      toast.error("Write a message first");
      return;
    }
    mutation.mutate({ id: group.id, message, username: username! });
  };

  const shell = (children: React.ReactNode) => (
    <PageShell
      title="Group Message"
      subtitle="Post straight into one of the WhatsApp groups this session belongs to."
      icon={GroupsRoundedIcon}
      accent={tokens.rose}
      badge="Groups"
      width={620}
    >
      {children}
    </PageShell>
  );

  if (isLoading)
    return shell(
      <GlassCard topAccent>
        <Skeleton variant="text" width={120} height={20} />
        <Skeleton variant="rounded" height={56} sx={{ mt: 1.5, borderRadius: "12px" }} />
        <Divider sx={{ my: 3.4 }} />
        <Skeleton variant="text" width={100} height={20} />
        <Skeleton variant="rounded" height={132} sx={{ mt: 1.5, borderRadius: "12px" }} />
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

  const groups = Array.isArray(data) ? data : [];

  return shell(
    <GlassCard topAccent className="anim-fade-up d-2" component="form" onSubmit={handleSubmit}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.4,
          gap: 1,
        }}
      >
        <Typography variant="overline">Destination group</Typography>
        <Typography sx={{ fontSize: "0.76rem", color: tokens.textMuted }}>
          {groups.length} available
        </Typography>
      </Box>

      <Autocomplete
        fullWidth
        options={groups}
        value={group}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        getOptionLabel={(o) => o.label ?? ""}
        onChange={(_, next) => setGroup(next)}
        renderInput={(params) => (
          <TextField {...params} required label="Group" placeholder="Search your groups…" />
        )}
      />

      <Divider sx={{ my: 3.4 }} />

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.9, mb: 1.1 }}>
        <ChatBubbleRoundedIcon sx={{ fontSize: "1rem", color: tokens.textMuted }} />
        <Typography variant="overline">Message</Typography>
      </Box>
      <TextField
        required
        fullWidth
        multiline
        rows={5}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type the message to post in the group…"
      />
      <Typography sx={{ mt: 0.9, fontSize: "0.76rem", color: tokens.textMuted }}>
        {message.length} characters
      </Typography>

      <SubmitButton
        loading={mutation.isLoading}
        success={mutation.isSuccess}
        disabled={!group?.id || !message.trim()}
      >
        Post to group
      </SubmitButton>
    </GlassCard>
  );
}

export default GroupPage;
