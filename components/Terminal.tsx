
import React from 'react';
import { LogEntry } from '../types';

interface TerminalProps {
  logs: LogEntry[];
  scrollRef: React.RefObject<HTMLDivElement>;
  onExecute: (id: string) => void;
  isExecuting?: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({ logs, scrollRef, onExecute, isExecuting }) => {
  return (
    <div className="space-y-8 font-mono text-sm pb-12">
      {logs.map((log) => (
        <div key={log.id} className="animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="flex items-start gap-4">
            <span className="text-[#333] shrink-0 text-[9px] pt-1.5 font-black tracking-tighter tabular-nums">
              {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <div className="flex-1">
              <span className={`uppercase font-black text-[10px] px-2 py-0.5 rounded-sm mr-3 tracking-[0.15em] ${
                log.type === 'system' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                log.type === 'user' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                log.type === 'ai' ? 'bg-[#52bf22]/10 text-[#52bf22] border border-[#52bf22]/20 shadow-[0_0_10px_rgba(82,191,34,0.1)]' :
                log.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                log.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                'bg-gray-800 text-gray-500'
              }`}>
                {log.type === 'ai' ? 'COGNITIVE_CORE' : log.type.replace('-', '_').toUpperCase()}
              </span>
              <span className={`text-[#d0d0d0] leading-relaxed break-words whitespace-pre-wrap ${log.type === 'user' ? 'text-white font-bold' : ''}`}>
                {log.message}
              </span>
              
              {/* Multimodal Diagnostic Display */}
              {log.attachments && log.attachments.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-5">
                  {log.attachments.map((att, i) => (
                    <div key={i} className="group relative bg-[#0d0d0d] border border-[#222] rounded-md overflow-hidden max-w-[280px] shadow-2xl transition-all hover:border-[#52bf22]/50">
                      {att.isImage ? (
                        <div className="relative">
                          <img src={att.data} alt={att.name} className="w-full h-auto max-h-[180px] object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute top-0 left-0 bg-black/60 px-2 py-1 border-b border-r border-[#333] text-[8px] text-[#52bf22] font-black uppercase">
                            IMAGE_DATA
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                            <span className="text-[9px] text-[#888] truncate block font-bold">{att.name}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 flex flex-col gap-2 min-w-[200px]">
                          <div className="flex items-center gap-2 text-[#52bf22]">
                            <i className={`fas ${att.name.endsWith('.mid') ? 'fa-music' : 'fa-file-code'} text-lg`}></i>
                            <span className="text-[10px] font-black truncate uppercase tracking-widest">{att.name}</span>
                          </div>
                          <div className="bg-black/50 p-2 rounded border border-[#1a1a1a] max-h-24 overflow-hidden relative">
                            <pre className="text-[8px] text-[#444] leading-tight font-mono">
                              {att.data.substring(0, 500)}
                              {att.data.length > 500 && '...'}
                            </pre>
                            <div className="absolute bottom-0 right-0 left-0 h-4 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
                          </div>
                          <div className="text-[8px] text-[#333] font-black uppercase tracking-widest border-t border-[#1a1a1a] pt-2 flex justify-between">
                            <span>{att.type.toUpperCase()}</span>
                            <span>{Math.round(att.data.length / 1024)} KB LOADED</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-start relative">
                {/* Complex Workflow Section */}
                {log.actionIds && log.actionIds.length > 0 && (
                  <div className="bg-[#0f1710] border border-[#52bf22]/30 rounded-lg overflow-hidden col-span-full shadow-2xl">
                    <div className="bg-[#1a2e1c] px-4 py-2 flex justify-between items-center border-b border-[#52bf22]/30">
                      <span className="text-[10px] text-[#52bf22] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                        <i className="fas fa-layer-group"></i> Action Sequence Array
                      </span>
                    </div>
                    <div className="p-4 flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar bg-black/40">
                      {log.actionIds.map((id, idx) => (
                        <div key={idx} className="bg-black border border-[#222] px-3 py-1.5 rounded-md text-[11px] text-[#52bf22] font-bold font-mono hover:border-[#52bf22] transition-colors cursor-default">
                          {id}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Automated Path Box */}
                {log.code && (
                  <div className={`bg-[#080808] border rounded-lg flex flex-col max-h-[500px] shadow-2xl transition-all ${log.isExecuted ? 'border-green-500/50' : 'border-[#222]'}`}>
                    <div className="bg-[#111] px-4 py-2 flex justify-between items-center border-b border-[#222] shrink-0">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-[#52bf22] font-black uppercase tracking-widest">
                          <i className="fas fa-microchip mr-2"></i>Synthesized Lua
                        </span>
                        {log.isExecuted && <span className="text-[9px] text-green-500 font-bold uppercase tracking-widest bg-green-500/10 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(34,197,94,0.2)]">Deployed</span>}
                      </div>
                      <div className="flex gap-2">
                        {!log.isExecuted && (
                          <button 
                            onClick={() => onExecute(log.id)}
                            disabled={isExecuting}
                            className="bg-[#52bf22] text-black text-[10px] px-3 py-1.5 rounded-md font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(82,191,34,0.3)]"
                          >
                            {isExecuting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-play"></i>}
                            Run
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="overflow-auto custom-scrollbar relative p-4 group bg-[#050505]">
                      <div className="scan-line pointer-events-none opacity-5"></div>
                      <pre className="text-[#a5d6ff] text-[11px] leading-relaxed font-mono">
                        <code>{log.code}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {/* Manual Path Box */}
                {log.manualSteps && log.manualSteps.length > 0 && (
                  <div className="bg-[#080808] border border-[#222] rounded-lg flex flex-col max-h-[500px] shadow-2xl">
                    <div className="bg-[#111] px-4 py-2 flex justify-between items-center border-b border-[#222] shrink-0">
                      <span className="text-[10px] text-orange-500 font-black uppercase tracking-widest">
                        <i className="fas fa-mouse-pointer mr-2"></i>Operator Manual
                      </span>
                      <span className="text-[9px] text-[#444] font-black uppercase tracking-tighter">UI Instructions</span>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                      {log.manualSteps.map((step, idx) => (
                        <div key={idx} className="flex gap-4 text-[12px] text-[#aaa] group">
                          <span className="text-[#52bf22] font-black shrink-0 w-6 h-6 rounded-full bg-[#52bf22]/10 flex items-center justify-center text-[10px] group-hover:bg-[#52bf22] group-hover:text-black transition-all">
                            {idx + 1}
                          </span>
                          <span className="leading-normal group-hover:text-white transition-colors">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      <div ref={scrollRef} />
    </div>
  );
};
