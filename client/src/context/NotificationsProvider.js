import { v4 as uuid } from 'uuid';
import React, { useState, useCallback } from 'react';
import NotificationsContainer from '../components/NoticationContainer';

const NotificationsContext = React.createContext(null);

const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback(message => {
    setNotifications(currentState => [
      ...currentState,
      { id: uuid(), ts: Date.now(), message },
    ]);
  }, [setNotifications]);

  const removeNotification = useCallback(id => {
    setNotifications(currentState => currentState.filter(notification => notification.id !== id))
  }, [setNotifications]);

  return(
    <NotificationsContext.Provider value={{ addNotification, removeNotification }}>
      <NotificationsContainer notifications={notifications} />
      {children}
    </NotificationsContext.Provider>
  )
}

export { NotificationsContext };
export default NotificationsProvider;
