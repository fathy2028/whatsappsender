import TextField from "@mui/material/TextField";
import { useState } from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import ReactPhoneInput from "react-phone-input-material-ui";
import { sendMessageUsingPhoneNumer } from "../api/api";
import { useMutation } from "react-query";
import { useParams } from "react-router-dom";

const defaultTheme = createTheme();

function PhoneNumberPage() {
  const [message, setMessage] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const { username } = useParams();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate({
      phoneNumber,
      message,
      username: username!,
    });
  };
  const mutation = useMutation(
    (submitData: {
      phoneNumber: string;
      message: string;
      username: string;
    }) => {
      const { phoneNumber, message, username } = submitData;
      return sendMessageUsingPhoneNumer(phoneNumber, message, username);
    },
    {
      onSuccess: () => {
        toast.success("Message Sent!");
      },
      onError: () => {
        toast.error("Phone Number was not found!");
      },
    }
  );
  return (
    <>
      <ThemeProvider theme={defaultTheme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography component="h1" variant="h5">
              Send Message to a Phone Number
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 3 }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ReactPhoneInput
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e);
                    }}
                    country={"eg"}
                    component={TextField}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="outlined-basic"
                    label="Message"
                    variant="outlined"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                    }}
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Send
              </Button>
            </Box>
          </Box>
        </Container>
        <ToastContainer
          position="bottom-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </ThemeProvider>
    </>
  );
}

export default PhoneNumberPage;
