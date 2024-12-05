import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeNotification } from '../../redux/uiSlice';

const Notifications = () => {
  const notifications = useSelector(state => state.ui.notifications);
  const dispatch = useDispatch();

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {notifications.map((notification, index) => (
        <div
          key={index}
          className={`mb-2 p-4 rounded-md shadow-md ${
            notification.type === 'success' ? 'bg-green-500' :
            notification.type === 'error' ? 'bg-red-500' :
            'bg-blue-500'
          } text-white`}
        >
          <div className="flex justify-between items-center">
            <span className="font-bold">{notification.title}</span>
            <button
              onClick={() => dispatch(removeNotification(index))}
              className="text-white hover:text-gray-200"
            >
              &times;
            </button>
          </div>
          <p>{notification.message}</p>
        </div>
      ))}
    </div>
  );
};

export default Notifications;

