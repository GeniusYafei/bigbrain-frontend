// src/__test__/TestWrapper.jsx
import { NotificationProvider } from '../utils/NotificationProvider';
import { BrowserRouter } from 'react-router-dom';

export default function TestWrapper({ children }) {
  return (
    <NotificationProvider>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </NotificationProvider>
  );
}
