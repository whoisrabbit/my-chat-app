export default function Logo() {
  return (
    <div className="w-8 h-8 relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-6 h-6 relative">
          {/* Network/connection dots */}
          <div className="absolute top-0 left-0 w-2 h-2 bg-black dark:bg-white rounded-full"></div>
          <div className="absolute top-0 right-0 w-2 h-2 bg-black dark:bg-white rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-black dark:bg-white rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-black dark:bg-white rounded-full"></div>
          
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-black dark:bg-white rounded-full"></div>
          
          {/* Connection lines */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-black dark:border-white rounded-tl-full opacity-50"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-black dark:border-white rounded-tr-full opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-black dark:border-white rounded-bl-full opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-black dark:border-white rounded-br-full opacity-50"></div>
        </div>
      </div>
    </div>
  );
} 