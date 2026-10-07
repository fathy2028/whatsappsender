import type { ReactNode } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

type SubmitButtonProps = {
  loading?: boolean;
  success?: boolean;
  disabled?: boolean;
  children: ReactNode;
  loadingLabel?: string;
  successLabel?: string;
};

/** Primary form action that reflects pending / succeeded state. */
function SubmitButton({
  loading = false,
  success = false,
  disabled = false,
  children,
  loadingLabel = "Sending…",
  successLabel = "Sent",
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      fullWidth
      size="large"
      variant="contained"
      disabled={loading || disabled}
      startIcon={
        loading ? (
          <CircularProgress size={17} thickness={5} sx={{ color: "#04140E" }} />
        ) : success ? (
          <CheckRoundedIcon />
        ) : (
          <SendRoundedIcon />
        )
      }
      sx={{ mt: 1, fontSize: "1rem", py: 1.5 }}
    >
      {loading ? loadingLabel : success ? successLabel : children}
    </Button>
  );
}

export default SubmitButton;
