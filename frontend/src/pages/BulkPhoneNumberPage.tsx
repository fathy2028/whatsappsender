import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation } from "react-query";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import PageShell from "../components/PageShell";
import GlassCard from "../components/GlassCard";
import NumbersInput from "../components/NumbersInput";
import { parseNumbers } from "../utils/numbers";
import SubmitButton from "../components/SubmitButton";
import { sendMessageUsingPhoneNumers } from "../api/api";
import { tokens } from "../theme";

function BulkPhoneNumberPage() {
  const { username } = useParams();
  const [raw, setRaw] = useState("");
  const [message, setMessage] = useState("");

  const numbers = parseNumbers(raw);

  const mutation = useMutation(
    (payload: { phoneNumbers: string[]; message: string; username: string }) =>
      sendMessageUsingPhoneNumers(payload.phoneNumbers, payload.message, payload.username),
    {
      onSuccess: () => {
      toast.success(`Queued for ${numbers.length} recipient(s)`);
    },
      onError: () => {
      toast.error("Sending failed — check the numbers and your session");
    },
    }
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!numbers.length) {
      toast.error("Add at least one phone number");
      return;
    }
    if (!message.trim()) {
      toast.error("Write a message first");
      return;
    }
    mutation.mutate({ phoneNumbers: numbers, message, username: username! });
  };

  return (
    <PageShell
      title="Bulk Messages"
      subtitle="Send the same text message to a whole list of numbers. Delivery is paced automatically to keep your session safe."
      icon={SendRoundedIcon}
      accent={tokens.emerald}
      badge="Text"
    >
      <GlassCard topAccent className="anim-fade-up d-2" component="form" onSubmit={handleSubmit}>
        <NumbersInput value={raw} onChange={setRaw} rows={7} />

        <Divider sx={{ my: 3.4 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.9, mb: 1.1 }}>
          <ChatBubbleRoundedIcon sx={{ fontSize: "1rem", color: tokens.textMuted }} />
          <Typography variant="overline">Message</Typography>
        </Box>
        <TextField
          required
          fullWidth
          multiline
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type the message your recipients will receive…"
        />
        <Typography sx={{ mt: 0.9, fontSize: "0.76rem", color: tokens.textMuted }}>
          {message.length} characters
        </Typography>

        {/* ---- send summary ---- */}
        <Box
          sx={{
            mt: 3.4,
            p: 2,
            borderRadius: "13px",
            background: "rgba(16,185,129,.08)",
            border: "1px solid rgba(16,185,129,.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography sx={{ fontSize: "0.86rem", color: tokens.textSecondary }}>
            Ready to deliver to{" "}
            <Box component="span" sx={{ color: tokens.emeraldLight, fontWeight: 700 }}>
              {new Set(numbers).size}
            </Box>{" "}
            unique number(s)
          </Typography>
          <Typography sx={{ fontSize: "0.76rem", color: tokens.textMuted }}>
            Randomised delay between sends
          </Typography>
        </Box>

        <SubmitButton
          loading={mutation.isLoading}
          success={mutation.isSuccess}
          disabled={!numbers.length || !message.trim()}
        >
          Send to {new Set(numbers).size || 0} recipient(s)
        </SubmitButton>
      </GlassCard>
    </PageShell>
  );
}

export default BulkPhoneNumberPage;
