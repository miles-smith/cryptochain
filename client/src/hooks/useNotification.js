import { useContext } from 'react';
import { NotificationsContext } from '../context/NotificationsProvider';

export function useNotification() {
  const notificationHelpers = useContext(NotificationsContext);

  return notificationHelpers;
}

