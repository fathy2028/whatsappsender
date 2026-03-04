import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import Button from "@mui/material/Button";
import NavBarComponent from "./components/NavBarComponent";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

function App() {
  const [username, setUsername] = useState("");
  const [usernames, setUsernames] = useState<string[]>([]);

  useEffect(() => {
    const fetchUsernames = async () => {
      try {
        const response = await axios.get("/usernames");
        setUsernames(response.data);
      } catch (error) {
        console.error("Error fetching usernames:", error);
      }
    };
    fetchUsernames();
  }, []);

  return (
    <>
      <NavBarComponent />
      <div className="login-wrapper">
        <div className="login-card">
          <div className="app-logo">✉</div>
          <h1 className="login-title">Fathy Nassef Sender APP</h1>
          <p className="login-subtitle">WhatsApp Bulk Messaging Platform</p>
          <div className="gold-divider" />
          <Autocomplete
            freeSolo
            id="username-autocomplete"
            options={usernames}
            value={username}
            onChange={(_, newValue) => {
              setUsername(newValue || "");
            }}
            onInputChange={(_, newInputValue) => {
              setUsername(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Username"
                variant="outlined"
                fullWidth
                sx={{ mb: 2.5 }}
              />
            )}
          />
          <Link to={`scan/${username}`} style={{ textDecoration: "none", display: "block" }}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              sx={{ py: 1.4, fontSize: "1rem", borderRadius: "8px" }}
            >
              Login &amp; Scan QR
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}

export default App;
