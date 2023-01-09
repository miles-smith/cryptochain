import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Navbar from './Navbar';
import Header from './Header';
import Blockchain from './Blockchain';

const App = () => {
  return (
    <>
      <Navbar />

      <Container>
        <Header />
        <Row>
          <Col>
            <main>
              <Blockchain />
            </main>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default App;
