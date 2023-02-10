import React from 'react';
import ToastContainer from 'react-bootstrap/ToastContainer';
import Notification from './Notification';

const NotificationsContainer = ({ notifications }) => {
  return (
    <ToastContainer position="top-end">
      {
        notifications.map(notification => <Notification key={notification.id} { ...notification } />)
      }
    </ToastContainer>
  );
}

export default NotificationsContainer;
