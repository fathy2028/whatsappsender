import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useMutation, useQuery } from "react-query";
import { getGroups, sendMessage } from "../api/api";
import { useParams } from "react-router-dom";
import { useState } from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { ThemeProvider } from "@mui/material/styles";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import NavBarComponent from "../components/NavBarComponent";
import theme from "../theme";

function GroupPage() {
  const [group, setGroup] = useState<{ label: string; id: string }>({
    label: "",
    id: "",
  });
  const [message, setMessage] = useState<string>("");
  const { username } = useParams();
  const { data, isLoading, isError } = useQuery(`groups ${username}`, () =>
    getGroups(username!)
  );
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate({ id: group.id, message, username: username! });
  };
  const mutation = useMutation(
    (submitData: { id: string; message: string; username: string }) => {
      const { id, message, username } = submitData;
      return sendMessage(id, message, username);
    },
    {
      onSuccess: () => {
        toast.success("Message Sent!");
      },
    }
  );
  if (isLoading)
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1A0800" }}>
        <Typography sx={{ color: "#D4AF37", fontFamily: "Georgia, serif", fontSize: "1.5rem" }}>Loading...</Typography>
      </Box>
    );
  if (isError)
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1A0800" }}>
        <Typography sx={{ color: "#D4AF37", fontFamily: "Georgia, serif", fontSize: "1.5rem" }}>Error loading groups</Typography>
      </Box>
    );
  return (
    <>
      <NavBarComponent />
      <ThemeProvider theme={theme}>
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
              Send Message to a Group
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 3, width: "100%" }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Autocomplete
                    disablePortal
                    fullWidth
                    id="combo-box-demo"
                    options={data}
                    value={group}
                    onChange={(_, newGroup) => {
                      setGroup(newGroup!);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} required label="Group" />
                    )}
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
                sx={{ mt: 3, mb: 2, py: 1.3, borderRadius: "8px" }}
              >
                Send Message
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
          theme="dark"
        />
      </ThemeProvider>
    </>
  );
}

export default GroupPage;
