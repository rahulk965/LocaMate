import React from 'react';
import { UserIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Message = ({ message, isUser = false, timestamp, isLoading = false }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <SparklesIcon className="h-5 w-5 text-primary-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-900">LocaNate AI</span>
              <span className="text-xs text-gray-500">{formatTime(timestamp)}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="animate-bounce w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="animate-bounce w-2 h-2 bg-gray-400 rounded-full" style={{ animationDelay: '0.1s' }}></div>
              <div className="animate-bounce w-2 h-2 bg-gray-400 rounded-full" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <SparklesIcon className="h-5 w-5 text-primary-600" />
          </div>
        )}
      </div>
      
      <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block max-w-xs lg:max-w-md xl:max-w-lg rounded-lg p-4 shadow-sm ${
          isUser 
            ? 'bg-primary-600 text-white' 
            : 'bg-white border'
        }`}>
          <div className={`flex items-center gap-2 mb-2 ${isUser ? 'justify-end' : ''}`}>
            <span className={`text-sm font-medium ${
              isUser ? 'text-primary-100' : 'text-gray-900'
            }`}>
              {isUser ? 'You' : 'LocaNate AI'}
            </span>
            <span className={`text-xs ${
              isUser ? 'text-primary-200' : 'text-gray-500'
            }`}>
              {formatTime(timestamp)}
            </span>
          </div>
          
          <div className={`text-sm leading-relaxed ${
            isUser ? 'text-white' : 'text-gray-700'
          }`}>
            {message}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
