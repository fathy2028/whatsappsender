import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link, useParams } from "react-router-dom";

const navStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #2D1100 0%, #1A0800 100%)",
  borderBottom: "2px solid #D4AF37",
  boxShadow: "0 2px 15px rgba(212, 175, 55, 0.25)",
  padding: "0.6rem 0",
};

const brandStyle: React.CSSProperties = {
  color: "#D4AF37",
  fontWeight: "bold",
  fontFamily: '"Georgia", "Times New Roman", serif',
  fontSize: "1.25rem",
  letterSpacing: "0.5px",
  textShadow: "0 1px 6px rgba(212, 175, 55, 0.4)",
  textDecoration: "none",
};

const linkStyle: React.CSSProperties = {
  textDecoration: "none",
  color: "#D4AF37",
  fontWeight: "600",
  fontFamily: '"Georgia", serif',
  letterSpacing: "0.3px",
  padding: "0.4rem 0.8rem",
  borderRadius: "6px",
  transition: "background 0.2s",
};

function NavBarComponent() {
  const { username } = useParams();
  if (username === undefined)
    return (
      <>
        <Navbar expand="lg" style={navStyle}>
          <Container>
            <Navbar.Brand href="/" style={brandStyle}>
              ✉ Fathy Nassef Sender APP
            </Navbar.Brand>
            <Navbar.Toggle
              aria-controls="basic-navbar-nav"
              style={{ borderColor: "#D4AF37", filter: "invert(70%) sepia(60%) saturate(400%) hue-rotate(5deg)" }}
            />
          </Container>
        </Navbar>
      </>
    );

  return (
    <Navbar expand="lg" style={navStyle}>
      <Container>
        <Navbar.Brand href="/" style={brandStyle}>
          ✉ Fathy Nassef Sender APP
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          style={{ borderColor: "#D4AF37", filter: "invert(70%) sepia(60%) saturate(400%) hue-rotate(5deg)" }}
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Link style={linkStyle} to={`/dashboard/${username}`}>
              Dashboard
            </Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBarComponent;
