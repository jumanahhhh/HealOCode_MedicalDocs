import { useState, useEffect } from 'react';
import { Notification, registerNotificationHandler, addNotification } from '@/lib/notification';

export default function NotificationsSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    const handleNotification = (title: string, message: string) => {
      const newNotification: Notification = {
        id: `notification-${Date.now()}`,
        title,
        message,
        timestamp: new Date(),
        isRead: false
      };
      
      setNotifications(prev => [newNotification, ...prev].slice(0, 10)); // Keep last 10 notifications
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        dismissNotification(newNotification.id);
      }, 5000);
    };

    // Register the notification handler when the component mounts
    registerNotificationHandler(handleNotification);
    
    // Make notification function available globally
    window.addNotification = (title: string, message: string) => {
      handleNotification(title, message);
      // Don't call addNotification here to avoid infinite loop
    };
    
    return () => {
      // Clean up when component unmounts
      window.addNotification = () => {
        console.warn('Notification system not initialized');
      };
    };
  }, []);
  
  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  if (notifications.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {notifications.map(notification => (
        <div 
          key={notification.id}
          className="bg-white rounded-md shadow-lg border border-gray-200 p-4 animate-fade-in" 
          style={{ 
            animation: 'slideIn 0.3s ease-out forwards',
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-DEFAULT flex items-center justify-center text-white">
                <span className="material-icons text-sm">notifications</span>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-900">{notification.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
              </div>
            </div>
            <button 
              onClick={() => dismissNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="material-icons text-sm">close</span>
            </button>
          </div>
        </div>
      ))}

    </div>
  );
}