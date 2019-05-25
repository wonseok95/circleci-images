import React from 'react';

import { Container, Row, Col, Navbar, NavbarBrand } from 'reactstrap';

function App() {
  return (
    <>
    <Navbar color="dark" dark>
    <Container>
    <NavbarBrand href="#">CircleCI Image Browser</NavbarBrand>
    </Container>
    </Navbar>
    <Container>
      <Row>
      <Col className="p-3">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
      </Col>
      </Row>
    </Container>
    </>
  );
}

export default App;
