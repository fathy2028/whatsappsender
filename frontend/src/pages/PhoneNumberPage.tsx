import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation } from "react-query";
import { toast } from "react-toastify";
import ReactPhoneInput from "react-phone-input-material-ui";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import PageShell from "../components/PageShell";
import GlassCard from "../components/GlassCard";
import SubmitButton from "../components/SubmitButton";
import { sendMessageUsingPhoneNumer } from "../api/api";
import { tokens } from "../theme";

function PhoneNumberPage() {
  const { username } = useParams();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");

  const mutation = useMutation(
    (payload: { phoneNumber: string; message: string; username: string }) =>
      sendMessageUsingPhoneNumer(payload.phoneNumber, payload.message, payload.username),
    {
      onSuccess: () => {
      toast.success("Message sent");
    },
      onError: () => {
      toast.error("That number isn’t reachable on WhatsApp");
    },
    }
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast.error("Enter a phone number");
      return;
    }
    if (!message.trim()) {
      toast.error("Write a message first");
      return;
    }
    mutation.mutate({ phoneNumber, message, username: username! });
  };

  return (
    <PageShell
      title="Single Message"
      subtitle="Send a one-off WhatsApp message to a single number — handy for testing a template."
      icon={PersonRoundedIcon}
      accent={tokens.emeraldLight}
      badge="Direct"
      width={620}
    >
      <GlassCard topAccent className="anim-fade-up d-2" component="form" onSubmit={handleSubmit}>
        <Typography variant="overline" sx={{ display: "block", mb: 1.4 }}>
          Recipient
        </Typography>
        <ReactPhoneInput
          value={phoneNumber}
          onChange={(v: string) => setPhoneNumber(v)}
          country={"eg"}
          enableSearch
          component={TextField}
          containerStyle={{ width: "100%" }}
        />
        <Typography sx={{ mt: 1, fontSize: "0.76rem", color: tokens.textMuted }}>
          Pick the country, then type the local number.
        </Typography>

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
          placeholder="Type your message…"
        />
        <Typography sx={{ mt: 0.9, fontSize: "0.76rem", color: tokens.textMuted }}>
          {message.length} characters
        </Typography>

        <SubmitButton
          loading={mutation.isLoading}
          success={mutation.isSuccess}
          disabled={!phoneNumber.trim() || !message.trim()}
        >
          Send message
        </SubmitButton>
      </GlassCard>
    </PageShell>
  );
}

export default PhoneNumberPage;
