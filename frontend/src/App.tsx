import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import NavBarComponent from "./components/NavBarComponent";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";

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
      <NavBarComponent></NavBarComponent>
      <h1>Welcome to Whatsapp API</h1>
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
            sx={{ width: 300, mb: 2 }}
          />
        )}
      />
      <Box></Box>
      <Link to={`scan/${username}`}>
        <Button variant="contained">Login!</Button>
      </Link>
    </>
  );
}

export default App;
