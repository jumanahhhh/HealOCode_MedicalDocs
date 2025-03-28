// Notification utility for global access

// Define the notification type
export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

// Extend Window interface
declare global {
  interface Window {
    addNotification: (title: string, message: string) => void;
  }
}

// Define the notification callback type
type NotificationCallback = (title: string, message: string) => void;

// Store the callback function
let notificationCallback: NotificationCallback | null = null;

// Register a notification handler
export function registerNotificationHandler(callback: NotificationCallback): void {
  notificationCallback = callback;
}

// Add a notification
export function addNotification(title: string, message: string): void {
  if (notificationCallback) {
    notificationCallback(title, message);
  } else {
    console.warn('No notification handler registered');
  }
}

// Initialize a default notification function in the global scope
if (typeof window !== 'undefined' && !window.addNotification) {
  window.addNotification = (title: string, message: string) => {
    // This will be overridden when NotificationsSystem component mounts
    console.warn('Notification system not initialized yet');
    addNotification(title, message);
  };
}