// src/utiles/Notification.jsx
import { createContext, useState, useCallback } from "react";
import { Alert, Slide, Box } from "@mui/material";

// Create a global notification context
export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifs, setNotifs] = useState([]);// Store active notifications

  // Function to show a notification with message, type, and duration
  const notify = useCallback((message, type = "info", duration = 3000) => {
    const id = `${type}-${Date.now()}`;

    // Prevent duplicate consecutive notifications
    setNotifs((prev) => {
      if (prev.length && prev[prev.length - 1].message === message) return prev;
      const newNotifs = [...prev, { id, message, type, duration }];
      return newNotifs.slice(-5); // Keep only last 5 notifications
    });

    // Auto-remove notification after duration
    setTimeout(() => {
      setNotifs((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  }, []);

  // Manual close handler
  const handleClose = (id) => () => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <Box
        sx={{
          position: "fixed",
          top: 20,
          right: 16,
          left: { xs: 16, sm: "auto" }, // Add horizontal margin on small screens
          zIndex: 1400,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 1.5,
          pointerEvents: "none", // Let clicks pass through background
        }}
      >
        {notifs.map((notif) => (
          <Slide key={notif.id} direction="down" in mountOnEnter unmountOnExit>
            <Alert
              severity={notif.type}
              variant="filled"
              onClose={handleClose(notif.id)}
              sx={{
                width: "100%", // Fill available container width
                maxWidth: 200, // But not more than 200px
                boxShadow: 3,
                borderRadius: 2,
                fontSize: "0.9rem",
                pointerEvents: "auto",  // Allow clicks on alert itself
                ...(notif.type === "info" && {
                  backgroundColor: "#ffa000",
                }),
              }}
            >
              {notif.message}
            </Alert>
          </Slide>
        ))}
      </Box>
    </NotificationContext.Provider>
  );
}
