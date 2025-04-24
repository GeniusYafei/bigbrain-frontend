import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { NotificationProvider } from './utils/NotificationProvider.jsx';
import App from './App.jsx'

// main reader .jsx page
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </StrictMode>,
)
