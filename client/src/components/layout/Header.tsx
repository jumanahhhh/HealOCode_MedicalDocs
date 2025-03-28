import { useState } from "react";

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
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
              className="text-neutral-500 hover:text-neutral-700"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowSettings(false);
              }}
            >
              <span className="material-icons">notifications</span>
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="text-lg font-medium">Notifications</h4>
                </div>
                <div className="p-2">
                  <div className="p-2 hover:bg-gray-50 rounded-md">
                    <p className="text-sm font-medium">New patient record added</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                  <div className="p-2 hover:bg-gray-50 rounded-md">
                    <p className="text-sm font-medium">Prescription processed</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
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
