import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";

const WS_URL =
  import.meta.env.VITE_WS_URL ||
  `${window.location.protocol === "https:" ? "wss" : "ws"}://${
    window.location.host
  }`;

function ScanPage() {
  const [QR, setQR] = useState(
    "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
  );
  const { username } = useParams();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const { sendMessage, readyState } = useWebSocket(WS_URL, {
    onOpen: () =>
      sendMessage(JSON.stringify({ type: "set-username", username })),
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "qr-code") {
        setQR(data.message);
      } else if (data.type === "authenticated") {
        setIsAuthenticated(true);
      }
    },
  });
  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  };
  return (
    <>
      <span>The WebSocket is currently {connectionStatus[readyState]}</span>
      <h1> Scan Code Below Using WhatsApp App</h1>
      {isAuthenticated ? (
        <>
          <h1>Authenticated Start Using it now</h1>
          <Link to={`/group/${username}`}>
            <Button variant="contained">Group</Button>
          </Link>
          <br />
          <br />
          <Link to={`/bulk/${username}`}>
            <Button variant="contained">Bulk</Button>
          </Link>
          <br />
          <br />
          <Link to={`/phone/${username}`}>
            <Button variant="contained">Phone Number</Button>
          </Link>
          <Navigate to={"/dashboard/" + username} />
        </>
      ) : (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img src={QR} id="qrcode_box" />
        </div>
      )}
    </>
  );
}

export default ScanPage;
