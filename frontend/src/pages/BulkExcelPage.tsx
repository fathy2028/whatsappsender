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
import { sendXlsx } from "../api/api";
import { useMutation } from "react-query";
import { useParams } from "react-router-dom";
import NavBarComponent from "../components/NavBarComponent";
import MenuItem from "@mui/material/MenuItem";
import * as XLSX from "xlsx";

const defaultTheme = createTheme();

function BulkExcel() {
  const { username } = useParams();
  const [formData, setFormData] = useState({
    username: username!,
    message: "",
    colname: "",
    file: null as File | null,
  });
  const [columns, setColumns] = useState<string[]>([]);

  const extractColumns = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
      if (jsonData.length > 0) {
        const headers = jsonData[0] as string[];
        setColumns(headers);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData2 = new FormData();
    formData2.append("username", username!);
    formData2.append("message", formData.message);
    formData2.append("colname", formData.colname);
    formData2.append("file", formData.file!);
    mutation.mutate(formData2);
  };

  const mutation = useMutation(
    (formData3: FormData) => {
      return sendXlsx(formData3);
    },
    {
      onSuccess: () => {
        toast.success("Message Sent!");
      },
      onError: () => {
        toast.error("Error!");
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
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Button variant="contained" component="label">
                      Upload Excel
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        name="file"
                        hidden
                        onChange={(e) => {
                          const { name, files } = e.target;
                          if (files?.length === 0 || !files) return;
                          setFormData({ ...formData, [name]: files[0] });
                          extractColumns(files[0]);
                        }}
                      />
                    </Button>
                    {formData.file && (
                      <Typography variant="body2" color="text.secondary">
                        Selected file: {formData.file.name}
                      </Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    required
                    fullWidth
                    id="outlined-basic"
                    label="Phone Number Column Name"
                    variant="outlined"
                    name="colname"
                    value={formData.colname}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setFormData({ ...formData, [name]: value });
                    }}
                  >
                    {columns.map((column) => (
                      <MenuItem key={column} value={column}>
                        {column}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    required
                    fullWidth
                    id="outlined-basic"
                    label="Message Column Name"
                    variant="outlined"
                    name="message"
                    value={formData.message}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setFormData({ ...formData, [name]: value });
                    }}
                  >
                    {columns.map((column) => (
                      <MenuItem key={column} value={column}>
                        {column}
                      </MenuItem>
                    ))}
                  </TextField>
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

export default BulkExcel;
