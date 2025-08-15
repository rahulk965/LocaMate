import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';
import Message from './Message';
import Button from '../ui/Button';

const ChatInterface = ({ 
  messages = [], 
  onSendMessage, 
  onQuickResponse,
  loading = false,
  className = '' 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Quick response suggestions
  const quickResponses = [
    "What are the best restaurants nearby?",
    "Show me popular tourist attractions",
    "I need a coffee shop",
    "What's the weather like?",
    "Create an itinerary for today"
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !loading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleQuickResponse = (response) => {
    onQuickResponse?.(response);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    // TODO: Implement voice recording
  };

  const stopRecording = () => {
    setIsRecording(false);
    // TODO: Implement voice recording stop
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
            <p className="text-gray-600 mb-6">
              Ask me about places to visit, restaurants, attractions, or anything travel-related!
            </p>
            
            {/* Quick Response Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
              {quickResponses.map((response, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickResponse(response)}
                  className="p-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  {response}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <Message
                key={index}
                message={msg.content}
                isUser={msg.isUser}
                timestamp={msg.timestamp}
              />
            ))}
            
            {loading && (
              <Message
                message=""
                isUser={false}
                timestamp={new Date()}
                isLoading={true}
              />
            )}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about places, restaurants, or travel recommendations..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows="1"
              style={{ minHeight: '44px', maxHeight: '120px' }}
              disabled={loading}
            />
          </div>
          
          <div className="flex gap-2">
            {/* Voice Recording Button */}
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={loading}
              className="p-3"
            >
              {isRecording ? (
                <StopIcon className="h-5 w-5 text-red-600" />
              ) : (
                <MicrophoneIcon className="h-5 w-5" />
              )}
            </Button>
            
            {/* Send Button */}
            <Button
              type="submit"
              disabled={!inputValue.trim() || loading}
              loading={loading}
              className="p-3"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </Button>
          </div>
        </form>
        
        {/* Quick Tips */}
        <div className="mt-3 text-xs text-gray-500">
          <p>💡 Try asking: "What's the best pizza place near me?" or "Create a day trip itinerary"</p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
