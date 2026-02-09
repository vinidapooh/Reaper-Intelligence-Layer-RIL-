
import React from 'react';

const steps = [
  { day: 1, title: 'Knowledge Engine & Ingestion', tasks: ['Parse reascripthelp.html', 'Chunk & Embed via SentenceTransformers', 'Load into DuckDB/LanceDB'], status: 'completed' },
  { day: 2, title: 'Action Bridge Hub', tasks: ['FastAPI skeleton', 'Reapy/Lua bridge setup', 'Gemini client integration'], status: 'completed' },
  { day: 3, title: 'Context-Aware Prompting', tasks: ['RAG pipeline (Context + Intent)', 'Few-shot Lua code generation', 'Hallucination defense (Undo blocks)'], status: 'completed' },
  { day: 4, title: 'The UI/UX Dashboard', tasks: ['React Dark Mode Interface', 'Terminal visualization', 'Multi-channel chat persistence'], status: 'completed' },
  { day: 5, title: 'REAPER Execution Layer', tasks: ['Handle multi-step actions', 'Project state inspection via API', 'Safety checks (Undo points)'], status: 'completed' },
  { day: 6, title: 'Vibecoding & Polish', tasks: ['Natural language sound design', 'Workflow presets generation', 'Performance optimization'], status: 'in-progress' },
  { day: 7, title: 'Deployment & Packaging', tasks: ['PyInstaller standalone builds', 'REAPER extension integration', 'User manual generation'], status: 'pending' },
];

export const RoadmapView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-12 overflow-y-auto h-full custom-scrollbar bg-[#0d0d0d]">
      <div className="mb-16 relative">
        <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic">Sprint Roadmap</h2>
        <div className="flex items-center gap-4 mt-4">
          <div className="h-1 flex-1 bg-[#222] rounded-full overflow-hidden">
            <div className="h-full bg-[#52bf22] w-[72%] shadow-[0_0_15px_#52bf22]"></div>
          </div>
          <p className="text-[#52bf22] font-black font-mono text-sm">72% TOTAL OPS</p>
        </div>
      </div>
      
      <div className="space-y-16">
        {steps.map((step, idx) => (
          <div key={idx} className="relative flex gap-12 group">
            <div className="absolute left-[24px] top-[48px] bottom-[-48px] w-[2px] bg-gradient-to-b from-[#333] to-transparent last:hidden"></div>
            <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center shrink-0 z-10 transition-all duration-500 ${
              step.status === 'completed' ? 'bg-[#52bf22] border-[#52bf22] text-black shadow-[0_0_20px_#52bf22] rotate-12' :
              step.status === 'in-progress' ? 'bg-[#1a1a1a] border-[#52bf22] text-[#52bf22] animate-pulse scale-110 shadow-[0_0_30px_rgba(82,191,34,0.4)]' :
              'bg-[#0d0d0d] border-[#222] text-[#222]'
            }`}>
              {step.status === 'completed' ? <i className="fas fa-check text-xl"></i> : <span className="font-black text-xl">{step.day}</span>}
            </div>
            
            <div className="pb-4 flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h3 className={`text-xl font-black uppercase tracking-tight ${
                  step.status === 'completed' ? 'text-white' : 
                  step.status === 'in-progress' ? 'text-[#52bf22]' : 
                  'text-[#333]'
                }`}>
                  Day {step.day}: {step.title}
                </h3>
                {step.status === 'completed' && <span className="text-[8px] border border-[#52bf22]/40 text-[#52bf22] px-2 py-0.5 rounded font-black uppercase tracking-[0.2em] shadow-inner bg-[#52bf22]/5">Verified</span>}
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {step.tasks.map((task, tidx) => (
                  <li key={tidx} className={`flex items-center gap-3 text-sm font-bold transition-all duration-300 ${
                    step.status === 'completed' ? 'text-[#888] group-hover:text-white' : 
                    step.status === 'in-progress' ? 'text-[#52bf22] opacity-80' : 
                    'text-[#222]'
                  }`}>
                    <div className={`w-2 h-2 rounded-full transition-all ${
                      step.status === 'completed' ? 'bg-[#52bf22]' : 
                      step.status === 'in-progress' ? 'bg-[#52bf22] animate-ping' : 
                      'bg-[#222]'
                    }`}></div>
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
