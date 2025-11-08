import React, { useRef, useEffect } from 'react';

interface EventLogProps {
  messages: string[];
}

const EventLog: React.FC<EventLogProps> = ({ messages }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to the bottom when new messages are added
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      className="flex-1 h-[68px] bg-black/70 rounded-md border border-green-500/40 shadow-lg z-20 cursor-default"
      onClick={(e) => e.stopPropagation()}
    >
      <div ref={logContainerRef} className="h-full overflow-y-auto p-2 text-sm scrollbar-thin scrollbar-thumb-green-800 scrollbar-track-black/50">
        {messages.length === 0 ? (
          <p className="text-green-600 italic font-mono">
            <span className="text-green-700 mr-2 select-none">&gt;</span>Журнал событий...
          </p>
        ) : (
          messages.map((msg, index) => (
            <p key={index} className="text-green-400 leading-relaxed font-mono">
              <span className="text-green-700 mr-2 select-none">&gt;</span>{msg}
            </p>
          ))
        )}
      </div>
    </div>
  );
};

export default EventLog;