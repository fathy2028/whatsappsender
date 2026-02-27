import CardDashborad from "../components/CardDashborad";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { useQuery } from "react-query";
import { Link, useParams } from "react-router-dom";
import { getSummary } from "../api/api";
import NavBarComponent from "../components/NavBarComponent";
// import Box from "@mui/material/Box";

export default function DashboardPage() {
  const { username } = useParams();
  const { data, isLoading, isError } = useQuery(`summary ${username}`, () =>
    getSummary(username!)
  );
  if (isLoading) return <h1>Loading</h1>;
  if (isError) return <h1>Error</h1>;
  return (
    <>
      <NavBarComponent />
      <Grid
        container
        spacing={{ xs: 0, md: 20 }}
        columns={{ xs: 0, sm: 0, md: 0 }}
        sx={{ justifyContent: "center" }}
      >
        <Grid item xs={12} sm={4} md={4}>
          <CardDashborad
            title="Total Message Sent"
            value={data.totalMessages}
          ></CardDashborad>
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <CardDashborad
            title="Total Users on whatsapp"
            value={data.totalUsersUniqueWhatsAppUsers}
          ></CardDashborad>
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <CardDashborad
            title="Total Users not on whatsapp"
            value={data.totalUsersUniqueNonWhatsAppUsers}
          ></CardDashborad>
        </Grid>
      </Grid>
      <br />
      <br />
      <Link to={`/bulk/${username}`}>
        <Button variant="contained">Bulk Messages</Button>
      </Link>
      <br />
      <br />
      <Link to={`/bulkimage/${username}`}>
        <Button variant="contained">Bulk Images</Button>
      </Link>
      <br />
      <br />
      <Link to={`/bulkfile/${username}`}>
        <Button variant="contained">Bulk Files</Button>
      </Link>
      <br />
      <br />
      <Link to={`/bulkvideo/${username}`}>
        <Button variant="contained">Bulk Video</Button>
      </Link>
      <br />
      <br />
      <Link to={`/bulkexcel/${username}`}>
        <Button variant="contained">Bulk Excel</Button>
      </Link>
    </>
  );
}
