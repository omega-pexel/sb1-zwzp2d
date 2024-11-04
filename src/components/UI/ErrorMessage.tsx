import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message?: string;
}

export function ErrorMessage({ message = 'An error occurred while processing your request.' }: ErrorMessageProps) {
  return (
    <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
      <AlertCircle className="h-5 w-5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}