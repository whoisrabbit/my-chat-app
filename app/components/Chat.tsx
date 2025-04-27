'use client';

import { useState, useEffect, useRef } from 'react';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const INBUDDY_SYSTEM_MESSAGE = {
  role: 'system' as const,
  content: `You are InBuddy, a LinkedIn AI career assistant. Your expertise includes:
• Career guidance and professional development
• LinkedIn platform navigation and best practices
• Professional networking strategies
• Job search and application advice
• Profile optimization and personal branding
• Message drafting and communication
• Industry insights and trends
• Professional relationship building

Communication style:
• Keep responses extremely concise (1-2 short paragraphs)
• Use bullet points for lists
• Limit lists to maximum 3 points
• Reference specific LinkedIn resources when relevant
• Ask one focused follow-up question
• When discussing industry trends or job market insights, quote relevant data from the [latest LinkedIn Workforce Report](https://economicgraph.linkedin.com/resources/linkedin-workforce-report-february-2025), including:
   - Job market trends and hiring rates
   - Industry growth rates and sector performance
   - Skill demand statistics and emerging skills
   - Regional market insights and metro area data
   - Salary trends and compensation insights
   - Always cite the source as a clickable link: [LinkedIn Workforce Report | United States | February 2025](https://economicgraph.linkedin.com/resources/linkedin-workforce-report-february-2025)
• When referencing URLs in responses, use descriptive phrases as clickable links instead of showing raw URLs. For example:
   - Instead of: "Check out https://example.com"
   - Use: "Check out [our latest report](https://example.com)"

Start with a clear, direct response.`
};

const WELCOME_MESSAGE = {
  role: 'assistant' as const,
  content: `Hey there! 👋 I'm InBuddy, your LinkedIn career buddy. I can help with your profile, job search, networking, or anything career-related. What's on your mind?`
};

// Helper function to format message content with proper bullet points and bold text
const formatMessageContent = (content: string) => {
  // Check if the content contains bullet points
  if (content.includes('- ') || content.includes('• ') || content.includes('* ')) {
    // Split the content into paragraphs
    const paragraphs = content.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Check if this paragraph contains bullet points
      if (paragraph.includes('- ') || paragraph.includes('• ') || paragraph.includes('* ')) {
        // Split into lines and format each bullet point
        const lines = paragraph.split('\n');
        return (
          <ul key={index} className="list-disc pl-5 space-y-1 my-2">
            {lines.map((line, lineIndex) => {
              // Remove the bullet point character and trim
              const bulletContent = line.replace(/^[-•*]\s+/, '').trim();
              if (bulletContent) {
                return <li key={lineIndex}>{formatLinks(bulletContent)}</li>;
              }
              return null;
            })}
          </ul>
        );
      }
      // Return regular paragraph with link formatting
      return <p key={index} className="my-2">{formatLinks(paragraph)}</p>;
    });
  }
  
  // If no bullet points, return the content with link formatting
  return formatLinks(content);
};

// Helper function to format markdown links
const formatLinks = (text: string) => {
  // Match markdown links [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = text.split(linkRegex);
  
  return parts.map((part, index) => {
    if (index % 3 === 1) { // This is the link text
      const url = parts[index + 1];
      return (
        <a 
          key={index} 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          {part}
        </a>
      );
    } else if (index % 3 === 2) { // This is the URL, skip it
      return null;
    }
    return part; // This is regular text
  });
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const testApiConnection = async () => {
      if (!isInitialized) {
        setIsLoading(true);
        setError(null);
        try {
          setMessages([WELCOME_MESSAGE]);
          setIsInitialized(true);
        } catch (error) {
          console.error('Error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          setError(errorMessage);
          setMessages([{ 
            role: 'assistant', 
            content: `Error: ${errorMessage}. Please check your API key in .env.local` 
          }]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    testApiConnection();
  }, [isInitialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [INBUDDY_SYSTEM_MESSAGE, ...messages, userMessage],
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from OpenAI');
      }

      if (data.message) {
        setMessages(prev => [...prev, data.message]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${errorMessage}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 px-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`p-4 rounded-2xl max-w-[85%] text-[15px] leading-relaxed ${
                message.role === 'user'
                  ? 'bg-black text-white rounded-br-none'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'
              }`}
            >
              {message.role === 'assistant' ? formatMessageContent(message.content) : message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white p-4 rounded-2xl rounded-bl-none max-w-[85%] text-[15px]">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="sticky bottom-0 bg-transparent p-4">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-900 to-transparent h-16 -top-16"></div>
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask InBuddy about your career, LinkedIn, or professional development..."
                className="w-full p-4 border-0 focus:outline-none focus:ring-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none text-[15px]"
                rows={2}
                style={{
                  minHeight: '80px',
                  maxHeight: '200px'
                }}
              />
              <div className="absolute bottom-0 right-0 p-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="p-2 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-50 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 