
import React, { useState } from 'react';
import { Chat } from '../types';

interface ChatListProps {
  chats: Chat[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onExportAll: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({ chats, activeId, onSelect, onDelete, onRename, onExportAll }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleStartRename = (e: React.MouseEvent, chat: Chat) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditValue(chat.title);
  };

  const handleSaveRename = (id: string) => {
    if (editValue.trim()) {
      onRename(id, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 overflow-hidden">
      <div className="mb-8 flex justify-between items-end border-b border-[#222] pb-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Workflow Channels</h2>
          <p className="text-[10px] text-[#555] mt-1 uppercase tracking-widest">Segregated context sessions</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onExportAll}
            className="text-[9px] text-[#888] hover:text-[#52bf22] border border-[#222] hover:border-[#52bf22] px-3 py-1.5 rounded uppercase font-black tracking-widest transition-all"
            title="Export all chats to a single text file"
          >
            <i className="fas fa-file-export mr-2"></i>Full Backup
          </button>
          <div className="text-[10px] text-[#444] uppercase tracking-widest font-bold">
            {chats.length} Persistent Channels
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
        {chats.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-[#222] border-2 border-dashed border-[#1a1a1a] rounded-xl uppercase text-[10px] tracking-[0.2em]">
            <i className="fas fa-folder-open text-4xl mb-4"></i>
            Database empty
          </div>
        ) : (
          chats.map((chat) => (
            <div 
              key={chat.id}
              className={`group relative flex items-center p-4 rounded-lg border transition-all cursor-pointer ${
                activeId === chat.id 
                ? 'bg-[#1a1a1a] border-[#52bf22]/40 shadow-[0_0_20px_rgba(82,191,34,0.08)]' 
                : 'bg-[#111] border-[#222] hover:border-[#333] hover:bg-[#151515]'
              }`}
              onClick={() => onSelect(chat.id)}
            >
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-3 mb-1">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeId === chat.id ? 'bg-[#52bf22] animate-pulse shadow-[0_0_5px_#52bf22]' : 'bg-[#333]'}`}></div>
                  
                  {editingId === chat.id ? (
                    <input
                      autoFocus
                      className="bg-[#0d0d0d] border border-[#52bf22] text-white text-sm px-2 py-0.5 rounded w-full outline-none"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(chat.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onBlur={() => handleSaveRename(chat.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <h3 className={`text-sm font-bold truncate flex-1 ${activeId === chat.id ? 'text-white' : 'text-[#888]'}`}>
                      {chat.title}
                    </h3>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-[9px] text-[#444] uppercase tracking-wider font-medium ml-4">
                  <span className="flex items-center gap-1">
                    <i className="fas fa-comment-alt text-[8px]"></i>
                    {chat.logs.filter(l => l.type === 'user').length} Turns
                  </span>
                  <span className="w-1 h-1 bg-[#222] rounded-full"></span>
                  <span>Synced {chat.updatedAt.toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => handleStartRename(e, chat)}
                  className="p-2 text-[#444] hover:text-[#52bf22] transition-colors"
                  title="Label Channel"
                >
                  <i className="fas fa-pen text-[10px]"></i>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(chat.id); }}
                  className="p-2 text-[#444] hover:text-red-500 transition-colors"
                  title="Archive Session"
                >
                  <i className="fas fa-trash-alt text-[10px]"></i>
                </button>
                <div className="w-px h-4 bg-[#222] mx-2"></div>
                <button className="bg-[#1a1a1a] border border-[#333] text-[#888] px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest hover:border-[#52bf22] hover:text-[#52bf22] transition-all">
                  Open
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
