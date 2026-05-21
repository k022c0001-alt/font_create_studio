import React from 'react';

interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info' }) => {
  return <div className={`toast toast--${type}`}>{message}</div>;
};
