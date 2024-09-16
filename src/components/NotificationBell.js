import React, { useState, useEffect , useCallback} from "react";
import { BellIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const userId = localStorage.getItem("userId");

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/dashboard/notifications/${userId}`);
      const data = await response.json();
      setNotifications(data);
      const unreadNotifications = data.filter(notification => notification.is_read === 0);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);


  const markAllAsRead = async () => {
    try {
      await fetch(`http://localhost:5000/dashboard/notifications/mark-read/${userId}`, {
        method: "PUT",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await fetch(`http://localhost:5000/dashboard/notifications/${id}`, {
        method: "DELETE",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleBellClick = () => {
    if (isOpen) {
      markAllAsRead();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button onClick={handleBellClick} className="text-gray-400 hover:text-white">
        <BellIcon className="h-6 w-6" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 rounded-full h-4 w-4 text-xs text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg z-10">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 border-b border-gray-200 flex items-start justify-between"
              >
                <div>
                  <p className={`text-sm ${notification.is_read ? "text-gray-400" : "text-black"}`}>
                    {notification.notification_text}
                  </p>
                  <p className="text-xs text-gray-500">{notification.created_at}</p>
                </div>
                <button onClick={() => deleteNotification(notification.id)} className="text-red-500">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))
          ) : (
            <div className="p-4 text-gray-500 text-sm">No notifications</div>
          )}
        </div>
      )}
    </div>
  );
}
