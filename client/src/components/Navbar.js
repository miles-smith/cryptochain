import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Wallet from './Wallet';

import logo from '../assets/logo.png';

const appName = "CryptoBro";
const brand =
  <>
    <img src={logo} className="app-logo d-inline-block me-2 align-top" width="30" height="30" alt={`${appName} logo`} />
    {appName}
  </>;

export default () => {
  return (
    <Navbar variant="dark" bg="dark" sticky="top" expand="false">
      <Container fluid>
        <Navbar.Brand>{brand}</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Offcanvas placement="end" className="text-bg-dark">
          <Offcanvas.Header closeButton closeVariant="white">
            <Offcanvas.Title>{brand}</Offcanvas.Title>
            <hr />
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Wallet />
            <hr />
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  )
}
