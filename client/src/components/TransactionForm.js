import React from 'react';
import { useRef } from 'react';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Button from 'react-bootstrap/Button';
import { useNotification } from '../hooks/useNotification';

const TransactionForm = () => {
  const recipientRef = useRef();
  const amountRef    = useRef();
  const { addNotification } = useNotification();

  function handleSubmit(e) {
    e.preventDefault();

    const transactionData = {
      recipient: recipientRef.current.value,
      amount:    +amountRef.current.value,
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transaction: transactionData
      })
    }

    fetch('http://localhost:3000/api/v1/transactions', requestOptions)
      .then(e.target.reset())
      .then(addNotification(`Transaction created! Sending ${transactionData.amount} to ${transactionData.recipient}`))
      .catch(console.error)
  }

  return (
    <Form onSubmit={handleSubmit}>
        <FloatingLabel className="mb-3 text-bg-light" label="Recipient">
          <Form.Control ref={recipientRef} type="text" name="transaction[recipient]" required size="sm" placeholder="Recipient" />
        </FloatingLabel>
        <FloatingLabel className="mb-3 text-bg-light" label="Amount">
          <Form.Control ref={amountRef} type="number" name="transaction[amount]" required min="0" size="sm" placeholder="Amount" />
        </FloatingLabel>
      <Button variant="success" type="submit">Send</Button>
    </Form>
  )
}

export default TransactionForm;
