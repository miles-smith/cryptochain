import React from 'react';
import Toast from 'react-bootstrap/Toast';
import { useNotification } from '../hooks/useNotification';

import logo from '../assets/logo.png';

const Notification = ({ id, ts, message }) => {
  const { removeNotification } = useNotification();

  return (
    <Toast autohide delay={5000} onClose={() => removeNotification(id)}>
      <Toast.Header>
        <img src={logo} className="rounded me-2" alt="cryptobro-logo" width={20} height={20} />
        <strong className="me-auto">Cryptobro</strong>
        <small>{new Date(ts).toLocaleString()}</small>
      </Toast.Header>
      <Toast.Body>{message}</Toast.Body>
    </Toast>
  );
}

export default Notification;
