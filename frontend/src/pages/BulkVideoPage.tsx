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
import { sendVideo } from "../api/api";
import { useMutation } from "react-query";
import { useParams } from "react-router-dom";
import NavBarComponent from "../components/NavBarComponent";

const defaultTheme = createTheme();

function BulkVideo() {
  const { username } = useParams();
  const [formData, setFormData] = useState({
    username: username!,
    phoneNumbers: "",
    caption: "",
    video: null,
  });
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData2 = new FormData();
    formData2.append("username", username!);
    formData2.append("caption", formData.caption);
    formData2.append("video", formData.video!);
    formData2.append("phoneNumbers", formData.phoneNumbers);
    mutation.mutate(formData2);
  };
  const mutation = useMutation(
    (formData3: FormData) => {
      return sendVideo(formData3);
    },
    {
      onSuccess: () => {
        toast.success("Message Sent!");
      },
      onError: (e) => {
        toast.error("Error!" + e);
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
                    name="phoneNumbers"
                    multiline
                    rows={4}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setFormData({ ...formData, [name]: value });
                    }}
                    defaultValue={""}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="outlined-basic"
                    label="Caption"
                    variant="outlined"
                    name="caption"
                    value={formData.caption}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setFormData({ ...formData, [name]: value });
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" component="label">
                    Upload Video
                    <input
                      type="file"
                      accept="video/*"
                      name="video"
                      hidden
                      onChange={(e) => {
                        const { name, files } = e.target;
                        if (files?.length === 0 || !files) return;
                        setFormData({ ...formData, [name]: files[0] });
                      }}
                    />
                  </Button>
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

export default BulkVideo;
