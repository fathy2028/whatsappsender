import TextField from "@mui/material/TextField";
import { useState } from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { ThemeProvider } from "@mui/material/styles";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { useMutation } from "react-query";
import { useParams } from "react-router-dom";
import { sendFile } from "../api/api";
import NavBarComponent from "../components/NavBarComponent";
import theme from "../theme";

function BulkFile() {
  const { username } = useParams();
  const [formData, setFormData] = useState({
    username: username!,
    phoneNumbers: "",
    file: null,
  });
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData2 = new FormData();
    formData2.append("username", username!);
    formData2.append("file", formData.file!);
    formData2.append("phoneNumbers", formData.phoneNumbers);
    mutation.mutate(formData2);
  };
  const mutation = useMutation(
    (formData3: FormData) => {
      return sendFile(formData3);
    },
    {
      onSuccess: () => {
        toast.success("File Sent!");
      },
      onError: () => {
        toast.error("Phone Number was not found!");
      },
    }
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
              Send Bulk Files
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 3, width: "100%" }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="outlined-multiline-static"
                    label="Phone Numbers (one per line)"
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
                  <Button variant="contained" component="label" fullWidth sx={{ py: 1.2, borderRadius: "8px" }}>
                    📁 Upload File
                    <input
                      type="file"
                      accept="*"
                      name="file"
                      hidden
                      onChange={(e) => {
                        const { name, files } = e.target;
                        if (files?.length === 0 || !files) return;
                        setFormData({ ...formData, [name]: files[0] });
                      }}
                    />
                  </Button>
                  {formData.file && (
                    <Typography variant="body2" sx={{ mt: 1, color: "rgba(212,175,55,0.7)", textAlign: "center" }}>
                      Selected: {(formData.file as File).name}
                    </Typography>
                  )}
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.3, borderRadius: "8px" }}
              >
                Send Files
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

export default BulkFile;
