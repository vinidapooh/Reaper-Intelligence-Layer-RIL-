
import React from 'react';
import { ViewMode } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onNewChat }) => {
  const items = [
    { id: ViewMode.DASHBOARD, icon: 'fa-terminal', label: 'Current Session' },
    { id: ViewMode.CHATS, icon: 'fa-history', label: 'History' },
    { id: ViewMode.ROADMAP, icon: 'fa-map-signs', label: 'Roadmap' },
    { id: ViewMode.KNOWLEDGE, icon: 'fa-book-open', label: 'Knowledge' },
    { id: ViewMode.SETTINGS, icon: 'fa-cog', label: 'Settings' },
  ];

  return (
    <aside className="w-16 bg-[#1a1a1a] border-r border-[#333] flex flex-col items-center py-6 gap-6">
      <div className="w-10 h-10 bg-[#52bf22] rounded flex items-center justify-center text-black font-black text-xl mb-4 shadow-[0_0_15px_rgba(82,191,34,0.3)] shrink-0 cursor-pointer">
        R
      </div>

      <button
        onClick={onNewChat}
        className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-[#52bf22] text-black hover:scale-105 transition-all shadow-[0_0_10px_rgba(82,191,34,0.2)] mb-4"
        title="New Chat"
      >
        <i className="fas fa-plus"></i>
        <span className="absolute left-16 bg-black text-[#52bf22] px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none uppercase tracking-widest border border-[#52bf22]/30">
          New Channel
        </span>
      </button>

      <div className="w-8 h-px bg-[#333] mb-4"></div>
      
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          className={`group relative flex items-center justify-center w-12 h-12 rounded-lg transition-all ${
            currentView === item.id 
              ? 'bg-[#52bf22]/10 text-[#52bf22]' 
              : 'text-[#555] hover:text-[#e0e0e0] hover:bg-[#333]'
          }`}
          title={item.label}
        >
          <i className={`fas ${item.icon} text-lg`}></i>
          <span className="absolute left-16 bg-black text-white px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none uppercase tracking-widest border border-[#333]">
            {item.label}
          </span>
        </button>
      ))}
    </aside>
  );
};
