
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dashboard } from './components/Dashboard';
import { Terminal } from './components/Terminal';
import { Sidebar } from './components/Sidebar';
import { CommandInput } from './components/CommandInput';
import { RoadmapView } from './components/RoadmapView';
import { ChatList } from './components/ChatList';
import { LiveAudioPanel } from './components/LiveAudioPanel';
import { processCommand, generateChatTitle } from './services/gemini';
import { LogEntry, ViewMode, Chat, Attachment } from './types';

const STORAGE_KEY = 'ril_saved_chats_v3';

const App: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hydrated = parsed.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          logs: c.logs.map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) }))
        }));
        setChats(hydrated);
        if (hydrated.length > 0) setActiveChatId(hydrated[0].id);
      } catch (e) {
        createNewChat();
      }
    } else {
      createNewChat();
    }
  }, []);

  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    }
  }, [chats]);

  const createNewChat = useCallback(() => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newChat: Chat = {
      id: newId,
      title: 'New Session',
      createdAt: new Date(),
      updatedAt: new Date(),
      projectState: { tracks: ['Vocals', 'Reference Drums', 'Bass', 'Pad'], selectedCount: 0, lastAction: 'None' },
      logs: [
        { id: '1', type: 'system', message: 'RIL Intelligence Layer initialized.', timestamp: new Date() },
        { id: '2', type: 'system', message: 'Vocal Analysis Engine: READY.', timestamp: new Date() }
      ]
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newId);
    setViewMode(ViewMode.DASHBOARD);
  }, []);

  const activeChat = chats.find(c => c.id === activeChatId);

  const updateChatState = useCallback((id: string, updates: Partial<Chat>) => {
    setChats(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const exportCurrentChat = useCallback(() => {
    if (!activeChat) return;
    const content = activeChat.logs.map(log => {
      const time = log.timestamp.toISOString();
      let entry = `[${time}] ${log.type.toUpperCase()}:\n${log.message}\n`;
      if (log.code) entry += `\nLUA CODE:\n${log.code}\n`;
      if (log.attachments) entry += `\nATTACHMENTS: ${log.attachments.map(a => a.name).join(', ')}\n`;
      return entry + "-".repeat(40);
    }).join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RIL_Session_${activeChat.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeChat]);

  const exportAllChats = useCallback(() => {
    if (chats.length === 0) return;
    const content = chats.map(chat => {
      let chatSection = `=== SESSION: ${chat.title} (ID: ${chat.id}) ===\n`;
      chatSection += `Created: ${chat.createdAt.toISOString()}\n\n`;
      chatSection += chat.logs.map(log => {
        const time = log.timestamp.toISOString();
        let entry = `[${time}] ${log.type.toUpperCase()}: ${log.message}\n`;
        if (log.code) entry += `LUA CODE: ${log.code}\n`;
        return entry;
      }).join('\n');
      return chatSection + "\n" + "=".repeat(60) + "\n\n";
    }).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RIL_Full_Backup_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [chats]);

  const addLogToActiveChat = useCallback((message: string, type: LogEntry['type'] = 'info', code?: string, manualSteps?: string[], actionIds?: string[], attachments?: Attachment[]) => {
    if (!activeChatId) return;
    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        const newLog: LogEntry = {
          id: Math.random().toString(36).substr(2, 9),
          type,
          message,
          code,
          manualSteps,
          actionIds,
          timestamp: new Date(),
          attachments
        };
        return {
          ...chat,
          updatedAt: new Date(),
          logs: [...chat.logs, newLog]
        };
      }
      return chat;
    }));
  }, [activeChatId]);

  const handleCommand = async (command: string, attachments: Attachment[]) => {
    if ((!command.trim() && attachments.length === 0) || !activeChat || !activeChatId) return;
    setIsProcessing(true);

    const isFirstMessage = activeChat.logs.filter(l => l.type === 'user').length === 0;
    addLogToActiveChat(command || "Analyzed attached files", 'user', undefined, undefined, undefined, attachments);

    try {
      if (isFirstMessage && (command.trim() || attachments.length > 0)) {
        const titleSource = command.trim() || (attachments[0]?.name || "Attached Media Session");
        generateChatTitle(titleSource).then(title => updateChatState(activeChatId, { title }));
      }

      const result = await processCommand(command, activeChat.logs, attachments);
      if (result.explanation) {
        addLogToActiveChat(result.explanation, 'ai', result.luaCode, result.manualSteps, result.actionIds);
      }
    } catch (err) {
      addLogToActiveChat(`Cognitive Bridge Error: ${err}`, 'error');
    } finally {
      setIsProcessing(false);
      setIsLiveActive(false);
    }
  };

  const toggleLive = () => {
    setIsLiveActive(!isLiveActive);
    if (!isLiveActive) {
      addLogToActiveChat("Vocal Capture Bridge Engaged. Listening for groove reference...", 'system');
    }
  };

  return (
    <div className="flex h-screen bg-[#0d0d0d] font-mono selection:bg-[#52bf22] selection:text-black">
      <Sidebar currentView={viewMode} setView={setViewMode} onNewChat={createNewChat} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 border-b border-[#333] flex items-center justify-between px-6 bg-[#1a1a1a] shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isLiveActive ? 'bg-red-500 animate-ping' : 'bg-[#52bf22] animate-pulse'}`}></div>
              <span className="text-xs uppercase tracking-widest font-bold text-[#888]">
                {isLiveActive ? 'Audio Bridge: LIVE' : 'Bridge: SYNC'}
              </span>
            </div>
            {activeChat && (
              <span className="text-[10px] text-[#52bf22] bg-[#52bf22]/10 px-3 py-1 rounded border border-[#52bf22]/20 uppercase font-black tracking-widest animate-in fade-in">
                {activeChat.title}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={exportCurrentChat}
              className="text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded border border-[#333] text-[#666] hover:border-[#52bf22] hover:text-[#52bf22] transition-all flex items-center gap-2"
              title="Export current session to .txt"
            >
              <i className="fas fa-download"></i> Export Session
            </button>
            <button 
              onClick={toggleLive}
              className={`text-[10px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full transition-all flex items-center gap-2 ${isLiveActive ? 'bg-red-500 text-white' : 'text-[#555] border border-[#333] hover:border-[#52bf22]'}`}
            >
              <i className="fas fa-microphone"></i> {isLiveActive ? 'Stop Listening' : 'Analyze Vocal'}
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col p-4 overflow-hidden gap-4">
            {viewMode === ViewMode.DASHBOARD && activeChat && (
              <>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative">
                  <Terminal 
                    logs={activeChat.logs} 
                    scrollRef={terminalEndRef} 
                    onExecute={() => {}} 
                    isExecuting={isExecuting}
                  />
                </div>
                <div className="relative">
                  <LiveAudioPanel isActive={isLiveActive} onTranscription={() => {}} />
                  <CommandInput onSend={handleCommand} disabled={isProcessing} />
                </div>
              </>
            )}
            {viewMode === ViewMode.CHATS && (
              <ChatList 
                chats={chats} 
                activeId={activeChatId} 
                onSelect={(id) => { setActiveChatId(id); setViewMode(ViewMode.DASHBOARD); }} 
                onDelete={(id) => setChats(prev => prev.filter(c => c.id !== id))}
                onRename={(id, title) => updateChatState(id, { title })}
                onExportAll={exportAllChats}
              />
            )}
            {viewMode === ViewMode.ROADMAP && <RoadmapView />}
          </div>
          <Dashboard chat={activeChat} />
        </div>
      </main>
    </div>
  );
};

export default App;
