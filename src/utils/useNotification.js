// src/utils/Notification.jsx
import { useContext } from 'react';
import { NotificationContext } from './NotificationProvider';

// Function to using a notification with message, type.
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
