import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { toast } from "react-toastify";
import axios from "axios";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Collapse from "@mui/material/Collapse";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import PageShell from "../components/PageShell";
import GlassCard from "../components/GlassCard";
import AttachmentsInput from "../components/AttachmentsInput";
import NumbersInput from "../components/NumbersInput";
import JobProgress from "../components/JobProgress";
import SubmitButton from "../components/SubmitButton";
import { estimateRange } from "../utils/format";
import { parseNumbers } from "../utils/numbers";
import {
  getChannels,
  createChannel,
  importChannel,
  removeChannel,
  postToChannel,
  inviteToChannel,
  type Channel,
} from "../api/api";
import { tokens } from "../theme";

const ACCENT = tokens.violet;

/** The backend's own message plus WhatsApp's error, when there is one. */
const errorText = (e: unknown, fallback: string): string => {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data as { message?: string; error?: string } | undefined;
    if (data?.message) return data.error ? `${data.message} ${data.error}` : data.message;
  }
  return fallback;
};

/* ── Create / import forms ──────────────────────────────────────────────── */

function CreateChannelForm({ username, onDone }: { username: string; onDone: (jid: string) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [picture, setPicture] = useState<File | null>(null);

  const mutation = useMutation(createChannel, {
    onSuccess: (res) => {
      toast.success("Channel created");
      setName("");
      setDescription("");
      setPicture(null);
      onDone(res.jid);
    },
    onError: (e) => {
      toast.error(errorText(e, "Could not create the channel"));
    },
  });

  return (
    <Box
      component="form"
      onSubmit={(e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        mutation.mutate({ username, name: name.trim(), description, picture });
      }}
      sx={{ display: "grid", gap: 1.6, pt: 2.4 }}
    >
      <TextField
        label="Channel name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        inputProps={{ maxLength: 100 }}
      />
      <TextField
        label="Description"
        multiline
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.4, flexWrap: "wrap" }}>
        <Button variant="outlined" component="label" startIcon={<ImageRoundedIcon />}>
          {picture ? "Change picture" : "Add picture"}
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={(e) => setPicture(e.target.files?.[0] ?? null)}
          />
        </Button>
        {picture && (
          <Typography sx={{ fontSize: "0.8rem", color: tokens.textSecondary }}>
            {picture.name}
          </Typography>
        )}
      </Box>
      <SubmitButton
        loading={mutation.isLoading}
        disabled={!name.trim()}
        loadingLabel="Creating…"
      >
        Create channel
      </SubmitButton>
    </Box>
  );
}

function ImportChannelForm({ username, onDone }: { username: string; onDone: (jid: string) => void }) {
  const [link, setLink] = useState("");

  const mutation = useMutation(() => importChannel(username, link.trim()), {
    onSuccess: (res) => {
      toast.success("Channel added");
      setLink("");
      onDone(res.jid);
    },
    onError: (e) => {
      toast.error(errorText(e, "Could not add that channel"));
    },
  });

  return (
    <Box
      component="form"
      onSubmit={(e: React.FormEvent) => {
        e.preventDefault();
        if (link.trim()) mutation.mutate();
      }}
      sx={{ display: "grid", gap: 1.6, pt: 2.4 }}
    >
      <TextField
        label="Channel link"
        required
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="https://whatsapp.com/channel/…"
        helperText="In WhatsApp, open your channel → channel info → Channel link. This account must be its owner or an admin."
      />
      <SubmitButton loading={mutation.isLoading} disabled={!link.trim()} loadingLabel="Adding…">
        Add channel
      </SubmitButton>
    </Box>
  );
}

/* ── Post / invite panels ───────────────────────────────────────────────── */

function PostPanel({ username, channel }: { username: string; channel: Channel }) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const mutation = useMutation(postToChannel, {
    onSuccess: (res) => {
      if (res.failed > 0) {
        toast.warning(`${res.sent} posted, ${res.failed} failed`);
      } else {
        toast.success(`Posted to ${channel.name}`);
        setMessage("");
        setFiles([]);
      }
    },
    onError: (e) => {
      toast.error(errorText(e, "Could not post to the channel"));
    },
  });

  const posts = Math.max(files.length, 1);

  return (
    <Box
      component="form"
      onSubmit={(e: React.FormEvent) => {
        e.preventDefault();
        if (files.length === 0 && !message.trim()) {
          toast.error("Write a message or attach a file");
          return;
        }
        mutation.mutate({ username, jid: channel.jid, message, files });
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.9, mb: 1.1 }}>
        <ChatBubbleRoundedIcon sx={{ fontSize: "1rem", color: tokens.textMuted }} />
        <Typography variant="overline">{files.length > 0 ? "Caption" : "Message"}</Typography>
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
            : `Write the update to post in ${channel.name}…`
        }
      />

      <Divider sx={{ my: 3.4 }} />

      <Typography variant="overline" sx={{ display: "block", mb: 1.4 }}>
        Attachments
      </Typography>
      <AttachmentsInput files={files} onChange={setFiles} accent={ACCENT} />

      <Typography sx={{ mt: 2.4, fontSize: "0.8rem", color: tokens.textMuted }}>
        {posts === 1
          ? "Goes out as one post to every follower."
          : `Goes out as ${posts} separate posts, one per attachment.`}
      </Typography>

      <SubmitButton
        loading={mutation.isLoading}
        disabled={files.length === 0 && !message.trim()}
        loadingLabel="Posting…"
      >
        Post to channel
      </SubmitButton>
    </Box>
  );
}

function InvitePanel({ username, channel }: { username: string; channel: Channel }) {
  const [raw, setRaw] = useState("");
  const [note, setNote] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const count = new Set(parseNumbers(raw)).size;

  const mutation = useMutation(inviteToChannel, {
    onSuccess: (res) => {
      setJobId(res.jobId);
      toast.success(`Sending the channel link to ${count} number(s)`);
    },
    onError: (e) => {
      toast.error(errorText(e, "Could not start sending invites"));
    },
  });

  return (
    <Box
      component="form"
      onSubmit={(e: React.FormEvent) => {
        e.preventDefault();
        if (count === 0) {
          toast.error("Add at least one number");
          return;
        }
        mutation.mutate({
          username,
          jid: channel.jid,
          numbers: parseNumbers(raw),
          message: note,
        });
      }}
    >
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: "13px",
          background: `${ACCENT}14`,
          border: `1px solid ${ACCENT}38`,
        }}
      >
        <Typography sx={{ fontSize: "0.84rem", color: tokens.textSecondary, lineHeight: 1.6 }}>
          WhatsApp doesn’t let anyone add people to a channel, so each number gets a message
          with the channel link. They join by tapping it and pressing{" "}
          <b>Follow</b>.
        </Typography>
      </Box>

      <NumbersInput value={raw} onChange={setRaw} label="Numbers to invite" />

      <Divider sx={{ my: 3.4 }} />

      <Typography variant="overline" sx={{ display: "block", mb: 1.1 }}>
        Invite message
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={`Optional — e.g. "Follow ${channel.name} for our latest offers 👇"`}
        helperText={`The link ${channel.link || "to the channel"} is added at the end.`}
      />

      {count > 0 && (
        <Typography sx={{ mt: 2.4, fontSize: "0.8rem", color: tokens.textMuted }}>
          Paced 60–120s apart to reduce ban risk — about {estimateRange(count)}.
        </Typography>
      )}

      <SubmitButton loading={mutation.isLoading} disabled={count === 0}>
        Send link to {count} number{count === 1 ? "" : "s"}
      </SubmitButton>

      {jobId && <JobProgress jobId={jobId} />}
    </Box>
  );
}

/* ── Channel list row ───────────────────────────────────────────────────── */

function ChannelRow({
  channel,
  selected,
  onSelect,
  onRemove,
}: {
  channel: Channel;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  return (
    <Box
      onClick={onSelect}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.6,
        p: 1.4,
        borderRadius: "13px",
        cursor: "pointer",
        border: `1px solid ${selected ? `${ACCENT}66` : tokens.stroke}`,
        background: selected ? `${ACCENT}1A` : tokens.surface,
        transition: "background .15s, border-color .15s",
        "&:hover": { background: selected ? `${ACCENT}1F` : tokens.surfaceHover },
      }}
    >
      <Box
        sx={{
          width: 42,
          height: 42,
          flexShrink: 0,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          fontFamily: tokens.fontDisplay,
          fontWeight: 700,
          color: ACCENT,
          background: `${ACCENT}24`,
          border: `1px solid ${ACCENT}47`,
        }}
      >
        {(channel.name || "?").trim().charAt(0).toUpperCase()}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }} noWrap>
          {channel.name}
        </Typography>
        <Typography sx={{ fontSize: "0.78rem", color: tokens.textMuted }} noWrap>
          {channel.subscribers == null
            ? "Followers unavailable"
            : `${channel.subscribers} follower${channel.subscribers === 1 ? "" : "s"}`}
          {channel.description ? ` · ${channel.description}` : ""}
        </Typography>
      </Box>
      {channel.link && (
        <Tooltip title="Copy channel link">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard
                .writeText(channel.link)
                .then(() => toast.success("Link copied"))
                .catch(() => toast.error("Could not copy the link"));
            }}
          >
            <ContentCopyRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Remove from this app (the channel stays on WhatsApp)">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <DeleteOutlineRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

function ChannelsPage() {
  const { username } = useParams();
  const [selectedJid, setSelectedJid] = useState<string | null>(null);
  const [panel, setPanel] = useState<"post" | "invite">("post");
  const [form, setForm] = useState<"create" | "import" | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<Channel[]>(
    `channels ${username}`,
    () => getChannels(username!)
  );
  const channels = useMemo(() => data ?? [], [data]);
  const selected = channels.find((c) => c.jid === selectedJid) ?? null;

  // Pick the newest channel by default so the composer is ready to use.
  useEffect(() => {
    if (!selectedJid && channels.length > 0) setSelectedJid(channels[0].jid);
  }, [channels, selectedJid]);

  const removal = useMutation((jid: string) => removeChannel(username!, jid), {
    onSuccess: (_, jid) => {
      if (jid === selectedJid) setSelectedJid(null);
      refetch();
    },
    onError: (e) => {
      toast.error(errorText(e, "Could not remove the channel"));
    },
  });

  const added = (jid: string) => {
    setForm(null);
    setSelectedJid(jid);
    refetch();
  };

  const toggleForm = (next: "create" | "import") =>
    setForm((cur) => (cur === next ? null : next));

  const shell = (children: React.ReactNode) => (
    <PageShell
      title="Channels"
      subtitle="Create WhatsApp Channels, post text or any media to them, and invite numbers in bulk."
      icon={CampaignRoundedIcon}
      accent={ACCENT}
      badge="Channels"
      width={760}
    >
      {children}
    </PageShell>
  );

  if (isLoading)
    return shell(
      <GlassCard topAccent>
        <Skeleton variant="text" width={160} height={20} />
        <Skeleton variant="rounded" height={64} sx={{ mt: 1.5, borderRadius: "13px" }} />
        <Skeleton variant="rounded" height={64} sx={{ mt: 1.2, borderRadius: "13px" }} />
      </GlassCard>
    );

  if (isError)
    return shell(
      <GlassCard className="anim-pop" sx={{ textAlign: "center" }}>
        <ErrorOutlineRoundedIcon sx={{ fontSize: "2rem", color: tokens.rose, mb: 1.5 }} />
        <Typography variant="h5" sx={{ mb: 1 }}>
          Couldn’t load your channels
        </Typography>
        <Box sx={{ mt: 2.5, display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
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
    <>
      <GlassCard topAccent className="anim-fade-up d-2">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            flexWrap: "wrap",
            mb: channels.length > 0 || form ? 2 : 0,
          }}
        >
          <Typography variant="overline">Your channels · {channels.length}</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              size="small"
              variant={form === "create" ? "contained" : "outlined"}
              startIcon={<AddRoundedIcon />}
              onClick={() => toggleForm("create")}
            >
              New channel
            </Button>
            <Button
              size="small"
              variant={form === "import" ? "contained" : "outlined"}
              startIcon={<LinkRoundedIcon />}
              onClick={() => toggleForm("import")}
            >
              Add existing
            </Button>
          </Box>
        </Box>

        <Collapse in={form === "create"} unmountOnExit>
          <CreateChannelForm username={username!} onDone={added} />
          <Divider sx={{ my: 3 }} />
        </Collapse>
        <Collapse in={form === "import"} unmountOnExit>
          <ImportChannelForm username={username!} onDone={added} />
          <Divider sx={{ my: 3 }} />
        </Collapse>

        {channels.length === 0 && !form && (
          <Typography sx={{ mt: 2, fontSize: "0.88rem", color: tokens.textMuted }}>
            No channels yet. Create a new one, or add a channel you already own by its link.
          </Typography>
        )}

        <Box sx={{ display: "grid", gap: 1.1 }}>
          {channels.map((c) => (
            <ChannelRow
              key={c.jid}
              channel={c}
              selected={c.jid === selectedJid}
              onSelect={() => setSelectedJid(c.jid)}
              onRemove={() => {
                if (window.confirm(`Remove "${c.name}" from this app? It stays on WhatsApp.`)) {
                  removal.mutate(c.jid);
                }
              }}
            />
          ))}
        </Box>
      </GlassCard>

      {selected && (
        <GlassCard topAccent className="anim-fade-up d-3" sx={{ mt: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.5,
              flexWrap: "wrap",
              mb: 3,
            }}
          >
            <Typography sx={{ fontFamily: tokens.fontDisplay, fontWeight: 600, fontSize: "1.1rem" }}>
              {selected.name}
            </Typography>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={panel}
              onChange={(_, v) => v && setPanel(v)}
            >
              <ToggleButton value="post">
                <ChatBubbleRoundedIcon sx={{ fontSize: "1rem", mr: 0.8 }} />
                Post
              </ToggleButton>
              <ToggleButton value="invite">
                <PersonAddAlt1RoundedIcon sx={{ fontSize: "1rem", mr: 0.8 }} />
                Invite numbers
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Keyed by channel so switching channels starts from a clean form. */}
          {panel === "post" ? (
            <PostPanel key={selected.jid} username={username!} channel={selected} />
          ) : (
            <InvitePanel key={selected.jid} username={username!} channel={selected} />
          )}
        </GlassCard>
      )}
    </>
  );
}

export default ChannelsPage;
