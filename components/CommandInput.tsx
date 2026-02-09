
import React, { useState, useRef } from 'react';
import { Attachment } from '../types';
import heic2any from 'heic2any';

interface CommandInputProps {
  onSend: (cmd: string, attachments: Attachment[]) => void;
  disabled?: boolean;
}

export const CommandInput: React.FC<CommandInputProps> = ({ onSend, disabled }) => {
  const [value, setValue] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((value.trim() || attachments.length > 0) && !disabled) {
      onSend(value, attachments);
      setValue('');
      setAttachments([]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsProcessingFiles(true);
    const newAttachments: Attachment[] = [];

    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      const nameLower = file.name.toLowerCase();
      const isHeic = nameLower.endsWith('.heic');
      const isMidi = nameLower.endsWith('.mid') || nameLower.endsWith('.midi');
      
      try {
        if (isHeic) {
          const convertedBlob = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.8
          });
          const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
          file = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
        }

        const isImage = file.type.startsWith('image/');
        const reader = new FileReader();

        const promise = new Promise<void>((resolve) => {
          reader.onload = () => {
            let data = reader.result as string;
            
            if (isMidi && reader.result instanceof ArrayBuffer) {
              const uint8 = new Uint8Array(reader.result);
              let hex = '';
              const limit = Math.min(uint8.length, 4096);
              for (let j = 0; j < limit; j++) {
                hex += uint8[j].toString(16).padStart(2, '0') + ' ';
              }
              data = `MIDI DATA (HEX): ${hex}${uint8.length > 4096 ? '...[truncated]' : ''}`;
            }

            newAttachments.push({
              name: file.name,
              type: file.type || (isImage ? 'image/jpeg' : 'text/plain'),
              data: data,
              isImage: isImage
            });
            resolve();
          };
          
          if (isImage) {
            reader.readAsDataURL(file);
          } else if (isMidi) {
            reader.readAsArrayBuffer(file);
          } else {
            reader.readAsText(file);
          }
        });

        await promise;
      } catch (err) {
        console.error(`Error processing file ${file.name}:`, err);
      }
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    setIsProcessingFiles(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-0 mt-auto bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden focus-within:border-[#52bf22] transition-all shadow-2xl relative">
      {/* File Preview Bar - Enhanced for high visibility */}
      {attachments.length > 0 && (
        <div className="flex flex-col border-b border-[#333] bg-[#0f0f0f] animate-in slide-in-from-bottom-2 duration-300">
          <div className="px-4 py-1.5 flex items-center justify-between border-b border-[#222]">
             <span className="text-[10px] font-black text-[#52bf22] uppercase tracking-[0.2em] flex items-center gap-2">
               <i className="fas fa-paperclip"></i>
               {attachments.length} {attachments.length === 1 ? 'FILE' : 'FILES'} READY
             </span>
             <button onClick={() => setAttachments([])} className="text-[9px] text-[#666] hover:text-red-500 uppercase font-bold transition-colors">Clear All</button>
          </div>
          <div className="flex gap-4 px-4 py-4 overflow-x-auto custom-scrollbar scroll-smooth">
            {attachments.map((att, i) => (
              <div key={i} className="relative group shrink-0">
                <div className="w-20 h-20 bg-[#050505] border border-[#333] rounded-lg overflow-hidden flex items-center justify-center group-hover:border-[#52bf22] transition-all shadow-xl">
                  {att.isImage ? (
                    <img src={att.data} alt={att.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <i className={`fas ${att.name.endsWith('.mid') ? 'fa-music' : 'fa-file-code'} text-lg text-[#52bf22]`}></i>
                      <span className="text-[8px] text-[#666] px-1 truncate w-16 text-center font-bold">{att.name}</span>
                    </div>
                  )}
                  {/* Overlay for non-image files for better readability */}
                  {!att.isImage && <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>}
                </div>
                <button 
                  onClick={() => removeAttachment(i)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 border border-black/20"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative flex items-center p-1.5 ${disabled ? 'opacity-50' : ''}`}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isProcessingFiles}
            className={`pl-3 pr-2 font-black transition-colors ${disabled || isProcessingFiles ? 'text-[#222]' : 'text-[#555] hover:text-[#52bf22]'}`}
            title="Attach REAPER Files (MIDI, Text, Image, HEIC)"
          >
            {isProcessingFiles ? <i className="fas fa-circle-notch fa-spin text-[#52bf22]"></i> : <i className="fas fa-plus-circle text-xl"></i>}
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple 
            className="hidden" 
            accept=".txt,.lua,.lua.txt,.csv,.mid,.midi,.jpg,.jpeg,.png,.gif,.webp,.heic"
          />

          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={disabled}
            placeholder={disabled ? "Synthesizing multimodal data..." : "Ask RIL or attach project files..."}
            className="w-full bg-transparent border-none focus:ring-0 text-[#f0f0f0] px-3 py-3 placeholder-[#3a3a3a] text-sm font-medium"
          />
          
          <button 
            type="submit"
            disabled={disabled || isProcessingFiles || (!value.trim() && attachments.length === 0)}
            className={`bg-[#222] hover:bg-[#52bf22] disabled:opacity-20 text-[#ccc] hover:text-black w-10 h-10 rounded-lg flex items-center justify-center transition-all mr-1 shadow-inner group`}
          >
            <i className={`fas ${disabled ? 'fa-spinner fa-spin' : 'fa-arrow-up group-hover:scale-110'}`}></i>
          </button>
        </div>
      </form>
    </div>
  );
};
