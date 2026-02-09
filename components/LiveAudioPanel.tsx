
import React, { useEffect, useRef, useState } from 'react';

interface LiveAudioPanelProps {
  isActive: boolean;
  onTranscription: (text: string) => void;
}

export const LiveAudioPanel: React.FC<LiveAudioPanelProps> = ({ isActive, onTranscription }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rms, setRms] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    let audioCtx: AudioContext;
    let analyser: AnalyserNode;
    let dataArray: Uint8Array;
    let animationId: number;

    const setupAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        const draw = () => {
          animationId = requestAnimationFrame(draw);
          analyser.getByteFrequencyData(dataArray);

          if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d')!;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;
            let currentSum = 0;

            for (let i = 0; i < bufferLength; i++) {
              barHeight = dataArray[i] / 2;
              currentSum += barHeight;
              ctx.fillStyle = `rgb(82, 191, 34, ${barHeight / 100})`;
              ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
              x += barWidth + 1;
            }
            setRms(currentSum / bufferLength);
          }
        };
        draw();
      } catch (err) {
        console.error("Audio Input Denied", err);
      }
    };

    setupAudio();
    return () => {
      cancelAnimationFrame(animationId);
      if (audioCtx) audioCtx.close();
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-x-0 bottom-full mb-2 p-4 bg-black/80 border border-[#52bf22]/30 rounded-t-xl backdrop-blur-md animate-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_red]"></div>
          <span className="text-[10px] text-[#52bf22] font-black uppercase tracking-[0.2em]">Capture Mode: Vocal Analysis</span>
        </div>
        <div className="text-[9px] text-[#444] font-mono">Input: Mic 1 | RMS: -{Math.max(0, 60 - Math.floor(rms)).toFixed(1)}dB</div>
      </div>
      <canvas ref={canvasRef} className="w-full h-12" width={600} height={48} />
      <div className="mt-3 text-center">
        <p className="text-[11px] text-[#888] italic">"Sing or speak the pattern you want to match..."</p>
      </div>
    </div>
  );
};
