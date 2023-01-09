import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Block from './Block';

const Blockchain = () => {
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('http://localhost:3000/api/v1/blocks');
      const data = await response.json();

      setBlocks(data);
    }

    fetchData()
      .catch(console.error);
  }, []);

  return(
    <Card className="blockchain">
      <Card.Header>
        <header className="text-center">
          <h2>Blocks</h2>
        </header>
      </Card.Header>
      <ListGroup className="blockchain--blocklist" as="ol" variant="flush" numbered>
        {
          blocks.map(block => <Block {...block} key={block.hash} />)
        }
      </ListGroup>
    </Card>
 );
}

export default Blockchain;
