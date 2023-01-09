import React, { useState } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Transaction from './Transaction';

const Block = (props) => {
  const { hash, timestamp, data } = props;
  const [showDetails, setShowDetails] = useState(false);

  const openModal  = () => setShowDetails(true);
  const closeModal = () => setShowDetails(false);

  return(
    <>
      <ListGroup.Item as="li" className="blockchain--block" onClick={openModal} action>
        <dl>
          <dt>Hash:</dt>
          <dd>{hash}</dd>
          <dt>Timestamp</dt>
          <dd>{new Date(timestamp).toISOString()}</dd>
        </dl>
      </ListGroup.Item>

      <Modal show={showDetails} onHide={closeModal} size="lg" scrollable centered>
        <Modal.Header closeButton>
          <Modal.Title>Block Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {
            data.map(transaction => (<div key={transaction.id}><Transaction {...transaction} /><hr /></div>))
          }
          {/* <pre> */}
          {/*   {JSON.stringify(data, null, 2)} */}
          {/* </pre> */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={closeModal}>OK</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Block;
