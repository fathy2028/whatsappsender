import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import ContactPhoneRoundedIcon from "@mui/icons-material/ContactPhoneRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import PageShell from "../components/PageShell";
import GlassCard from "../components/GlassCard";
import RecipientPicker, { type Recipient } from "../components/RecipientPicker";
import AttachmentsInput from "../components/AttachmentsInput";
import JobProgress from "../components/JobProgress";
import { estimateRange } from "../utils/format";
import SubmitButton from "../components/SubmitButton";
import { getContacts, syncContacts, sendCampaign } from "../api/api";
import { tokens } from "../theme";

const ACCENT = tokens.cyanLight;

function ContactsPage() {
  const { username } = useParams();
  const [savedOnly, setSavedOnly] = useState(true);
  const [selected, setSelected] = useState<Recipient[]>([]);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery(
    [`contacts ${username}`, savedOnly],
    () => getContacts(username!, savedOnly)
  );

  const options: Recipient[] = useMemo(
    () =>
      (data?.contacts ?? []).map((c) => ({
        id: c.jid,
        name: c.name,
        detail: `+${c.phoneNumber}`,
        tag: c.saved ? "saved" : undefined,
      })),
    [data]
  );

  const sync = useMutation(() => syncContacts(username!), {
    onSuccess: (res) => {
      toast.success(`Synced — ${res.saved} saved of ${res.total} contacts`);
      refetch();
    },
    onError: () => {
      toast.error("Contact sync failed — is the session still linked?");
    },
  });

  const mutation = useMutation(sendCampaign, {
    onSuccess: (res) => {
      setJobId(res.jobId);
      toast.success(`Campaign started for ${selected.length} contact(s)`);
    },
    onError: () => {
      toast.error("Could not start the campaign");
    },
  });

  const totalSends = selected.length * Math.max(files.length, 1);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selected.length === 0) {
      toast.error("Pick at least one contact");
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

  const empty = !isLoading && options.length === 0;

  return (
    <PageShell
      title="Contacts Campaign"
      subtitle="Send to the numbers saved in your WhatsApp address book — tick exactly who should receive it."
      icon={ContactPhoneRoundedIcon}
      accent={ACCENT}
      badge="Contacts"
      width={760}
    >
      <GlassCard topAccent className="anim-fade-up d-2" component="form" onSubmit={handleSubmit}>
        {/* ---- sync bar ---- */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            mb: 2.6,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: "0.88rem", fontWeight: 600, color: tokens.textPrimary }}>
              {data ? `${data.saved} saved · ${data.total} known` : "Loading contacts…"}
            </Typography>
            <Typography sx={{ fontSize: "0.76rem", color: tokens.textMuted }}>
              Contacts arrive from WhatsApp’s address-book sync.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => sync.mutate()}
            disabled={sync.isLoading}
            startIcon={
              <SyncRoundedIcon
                sx={sync.isLoading ? { animation: "spin-slow 1s linear infinite" } : undefined}
              />
            }
          >
            {sync.isLoading ? "Syncing…" : "Sync from WhatsApp"}
          </Button>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={savedOnly}
              onChange={(e) => {
                setSavedOnly(e.target.checked);
                setSelected([]);
              }}
              size="small"
            />
          }
          label={
            <Typography sx={{ fontSize: "0.84rem", color: tokens.textSecondary }}>
              Only numbers saved in my address book
            </Typography>
          }
          sx={{ mb: 2 }}
        />

        {isLoading ? (
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: "12px" }} />
        ) : empty ? (
          <Box
            sx={{
              p: 2.6,
              borderRadius: "13px",
              border: `1px dashed ${tokens.strokeStrong}`,
              background: "rgba(255,255,255,.028)",
              textAlign: "center",
            }}
          >
            <Typography sx={{ fontSize: "0.9rem", color: tokens.textPrimary, fontWeight: 600, mb: 0.6 }}>
              No contacts stored yet
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", color: tokens.textMuted }}>
              WhatsApp only pushes the address book during a sync. Press{" "}
              <strong>Sync from WhatsApp</strong> above — a session that paired a while ago needs
              this once.
            </Typography>
          </Box>
        ) : (
          <RecipientPicker
            label={`Contacts · ${options.length} available`}
            options={options}
            value={selected}
            onChange={setSelected}
            accent={ACCENT}
            placeholder="Search and tick the people to send to…"
            emptyText={isFetching ? "Loading…" : "No matching contacts"}
            itemNoun="contacts"
          />
        )}

        <Divider sx={{ my: 3.4 }} />

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
              : "Type the message to send…"
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
              message{totalSends === 1 ? "" : "s"} total — {Math.max(files.length, 1)} per person ×{" "}
              {selected.length} contact{selected.length === 1 ? "" : "s"}
            </Typography>
            <Typography sx={{ mt: 0.6, fontSize: "0.77rem", color: tokens.textMuted }}>
              Paced 60–120s apart to reduce ban risk — about {estimateRange(totalSends)}.
            </Typography>
            {totalSends > 60 && (
              <Typography
                sx={{ mt: 0.9, fontSize: "0.77rem", color: tokens.amber, fontWeight: 600 }}
              >
                ⚠ That is a long run. It continues on the server even if you close the page, but
                consider sending in smaller batches.
              </Typography>
            )}
          </Box>
        )}

        <SubmitButton
          loading={mutation.isLoading}
          disabled={selected.length === 0 || (files.length === 0 && !message.trim())}
        >
          Send to {selected.length || 0} contact{selected.length === 1 ? "" : "s"}
        </SubmitButton>

        {jobId && <JobProgress jobId={jobId} />}
      </GlassCard>
    </PageShell>
  );
}

export default ContactsPage;
