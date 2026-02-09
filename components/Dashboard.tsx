
import React from 'react';
import { Chat } from '../types';

interface DashboardProps {
  chat?: Chat;
}

export const Dashboard: React.FC<DashboardProps> = ({ chat }) => {
  const hasGroove = chat?.logs.some(l => l.code?.includes('StretchMarker'));
  const projectState = chat?.projectState;

  return (
    <div className="w-80 border-l border-[#222] bg-[#0a0a0a] hidden lg:flex flex-col p-6 overflow-y-auto gap-8 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-20">
      <div>
        <h3 className="text-[10px] font-black text-[#52bf22] uppercase tracking-[0.3em] mb-5 border-b border-[#52bf22]/20 pb-2 flex justify-between items-center">
          Groove DNA Analysis
          {hasGroove && <span className="bg-[#52bf22]/10 text-[#52bf22] text-[8px] px-1 rounded animate-pulse">DETECTED</span>}
        </h3>
        
        {hasGroove ? (
          <div className="bg-[#111] p-4 border border-[#52bf22]/20 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-[#555] font-black uppercase tracking-widest">Alignment Confidence</span>
              <span className="text-[10px] text-white font-bold">89%</span>
            </div>
            <div className="h-1 bg-[#222] rounded-full overflow-hidden">
              <div className="h-full bg-[#52bf22] w-[89%] shadow-[0_0_8px_#52bf22]"></div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-black/50 p-2 border border-[#333] rounded">
                <div className="text-[8px] text-[#444] font-black uppercase">Plosive Sync</div>
                <div className="text-[11px] text-[#52bf22] font-bold">LATE (24ms)</div>
              </div>
              <div className="bg-black/50 p-2 border border-[#333] rounded">
                <div className="text-[8px] text-[#444] font-black uppercase">Vowel Center</div>
                <div className="text-[11px] text-[#52bf22] font-bold">QUANTIZED</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 border border-[#222] border-dashed rounded-lg text-center opacity-40">
            <i className="fas fa-drum text-2xl mb-3 text-[#333]"></i>
            <p className="text-[9px] text-[#444] font-black uppercase tracking-widest">No Groove Data in Pipe</p>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-[10px] font-black text-[#888] uppercase tracking-[0.3em] mb-5 border-b border-[#222] pb-2">Active Track Manifest</h3>
        <div className="space-y-2">
          {projectState?.tracks.map((name, i) => (
            <div key={i} className="flex items-center justify-between bg-[#111] px-4 py-2 rounded border border-[#222] hover:border-[#52bf22]/40 transition-all cursor-default group">
              <div className="flex items-center gap-3">
                <span className="text-[9px] text-[#333] font-black">{i + 1}</span>
                <span className="text-[10px] text-[#ccc] group-hover:text-white transition-colors">{name}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-[#333] group-hover:bg-[#52bf22]"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-[#222] space-y-4">
        <div className="flex justify-between items-center text-[9px] text-[#444] font-black uppercase">
          <span>Neural Engine: Gemini 3 Pro</span>
          <span className="text-[#52bf22]">ONLINE</span>
        </div>
        <div className="p-3 bg-[#111] border border-[#222] rounded text-[8px] text-[#666] leading-relaxed italic">
          RIL is listening for transient markers and frequency peaks to optimize your vocal pathways.
        </div>
      </div>
    </div>
  );
};
