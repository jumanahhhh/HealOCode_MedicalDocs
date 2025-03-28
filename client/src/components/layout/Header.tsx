import { useState, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";

interface Notification {
  id: number;
  title: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "New patient record added",
      content: "Patient record for Emma Wilson has been created",
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      isRead: false
    },
    {
      id: 2,
      title: "Prescription processed",
      content: "Prescription #RX-2023-0042 has been processed successfully",
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      isRead: false
    }
  ]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  
  // Function to add a new notification
  const addNotification = (title: string, content: string) => {
    const newNotification: Notification = {
      id: notifications.length + 1,
      title,
      content,
      timestamp: new Date(),
      isRead: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setHasUnreadNotifications(true);
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    setHasUnreadNotifications(false);
  };
  
  // Expose addNotification function to window for testing
  useEffect(() => {
    // @ts-ignore
    window.addNotification = addNotification;
  }, []);
  
  // Add patient creation notification function
  const createPatientNotification = () => {
    addNotification(
      "Create New Patient", 
      "Click here to create a new patient record"
    );
  };
  
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <svg className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <h1 className="ml-2 text-2xl font-serif font-bold text-neutral-800">MediSecure</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button 
              className="text-neutral-500 hover:text-neutral-700 relative"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowSettings(false);
                if (showNotifications) {
                  markAllAsRead();
                }
              }}
            >
              <span className="material-icons">notifications</span>
              {hasUnreadNotifications && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 max-h-[70vh] overflow-auto">
                <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-20">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium">Notifications</h4>
                    <button 
                      className="text-xs text-primary-DEFAULT hover:text-primary-dark"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </button>
                  </div>
                </div>
                <div className="p-2">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div key={notification.id} className={`p-3 hover:bg-gray-50 rounded-md border-l-4 mb-2 ${notification.isRead ? 'border-transparent' : 'border-primary-DEFAULT'}`}>
                        <div className="flex justify-between items-start">
                          <p className={`text-sm font-medium ${notification.isRead ? 'text-neutral-700' : 'text-neutral-900'}`}>
                            {notification.title}
                          </p>
                          <span className="text-xs text-gray-500">
                            {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{notification.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-neutral-500">
                      <span className="material-icons text-neutral-400 text-3xl mb-2">notifications_off</span>
                      <p>No notifications</p>
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-200 p-3 sticky bottom-0 bg-white">
                  <button 
                    className="text-sm text-primary-DEFAULT hover:text-primary-dark flex items-center justify-center w-full"
                    onClick={createPatientNotification}
                  >
                    <span className="material-icons text-sm mr-1">add</span>
                    Create Patient (Demo)
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button 
              className="text-neutral-500 hover:text-neutral-700"
              onClick={() => {
                setShowSettings(!showSettings);
                setShowNotifications(false);
              }}
            >
              <span className="material-icons">settings</span>
            </button>
            
            {showSettings && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="p-2">
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    Profile Settings
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    Account Settings
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                    Privacy Controls
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md">
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
              SC
            </div>
            <span className="ml-2 text-neutral-700 font-medium hidden sm:block">Dr. Sarah Chen</span>
          </div>
        </div>
      </div>
    </header>
  );
}
