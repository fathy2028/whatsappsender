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
import { sendMessageUsingPhoneNumers } from "../api/api";
import { useMutation } from "react-query";
import { useParams } from "react-router-dom";
import NavBarComponent from "../components/NavBarComponent";

const defaultTheme = createTheme();

function BulkPhoneNumberPage() {
  const [message, setMessage] = useState<string>("");
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const { username } = useParams();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate({
      phoneNumbers,
      message,
      username: username!,
    });
  };
  const mutation = useMutation(
    (submitData: {
      phoneNumbers: string[];
      message: string;
      username: string;
    }) => {
      const { phoneNumbers, message, username } = submitData;
      return sendMessageUsingPhoneNumers(phoneNumbers, message, username);
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
      <NavBarComponent />
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
                  <TextField
                    required
                    fullWidth
                    id="outlined-multiline-static"
                    label="Phone Numbers"
                    multiline
                    rows={4}
                    onChange={(e) => {
                      setPhoneNumbers(e.target.value.split("\n"));
                    }}
                    defaultValue={""}
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

export default BulkPhoneNumberPage;
