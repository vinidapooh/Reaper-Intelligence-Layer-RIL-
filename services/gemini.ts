
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, LogEntry, Attachment } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const REAPER_SYSTEM_INSTRUCTION = `
You are the Reaper Intelligence Layer (RIL) Brain. 
Your directive includes VOCAL GROOVE MATCHING, TIMING CORRECTION, and PROJECT AUTOMATION.

MULTIMODAL CAPABILITIES:
- You analyze images (JPEG, PNG, HEIC-converted-to-JPEG) of track layouts, plugin GUIs, or hardware routing.
- You process text/lua files to debug or optimize them.
- You interpret MIDI metadata or hex-encoded MIDI strings if provided.

WORKFLOW:
- If an image is provided, identify tracks, colors, and plugin names.
- If a .lua file is provided, analyze its logic against the REAPER API.
- Always wrap generated Lua in Undo blocks.

OUTPUT: Return valid JSON matching the requested schema.
`;

const sanitizeJsonResponse = (text: string): string => {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/g, '');
  return cleaned.trim();
};

const mapLogToParts = (log: LogEntry) => {
  const parts: any[] = [{ text: log.message }];
  
  if (log.attachments) {
    log.attachments.forEach(att => {
      if (att.isImage) {
        const base64Data = att.data.includes(',') ? att.data.split(',')[1] : att.data;
        parts.push({
          inlineData: {
            mimeType: att.type,
            data: base64Data
          }
        });
      } else {
        parts.push({ text: `[Source File: ${att.name}]\nContent:\n${att.data}` });
      }
    });
  }
  
  return parts;
};

export const generateChatTitle = async (firstMessage: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a 2-4 word technical title for a REAPER DAW session starting with this intent: "${firstMessage}". Return ONLY the title text.`,
    });
    return response.text?.trim().replace(/"/g, '') || "New Session";
  } catch {
    return "New Session";
  }
};

export const processCommand = async (prompt: string, history: LogEntry[], currentAttachments?: Attachment[]): Promise<AIResponse> => {
  try {
    const contents = history
      .filter(log => log.type === 'user' || log.type === 'ai')
      .map(log => ({
        role: log.type === 'user' ? 'user' : 'model',
        parts: mapLogToParts(log)
      }));

    const currentParts: any[] = [{ text: prompt }];
    if (currentAttachments) {
      currentAttachments.forEach(att => {
        if (att.isImage) {
          const base64Data = att.data.includes(',') ? att.data.split(',')[1] : att.data;
          currentParts.push({
            inlineData: {
              mimeType: att.type,
              data: base64Data
            }
          });
        } else {
          currentParts.push({ text: `[Attachment: ${att.name}]\nType: ${att.type}\nData:\n${att.data}` });
        }
      });
    }

    contents.push({ role: 'user', parts: currentParts });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: REAPER_SYSTEM_INSTRUCTION,
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            luaCode: { type: Type.STRING },
            actionIds: { type: Type.ARRAY, items: { type: Type.STRING } },
            manualSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            explanation: { type: Type.STRING },
            error: { type: Type.STRING },
            grooveLogic: { type: Type.BOOLEAN }
          },
          required: ["explanation"]
        }
      }
    });

    const rawText = response.text;
    if (!rawText) return { error: "Empty response" };
    return JSON.parse(sanitizeJsonResponse(rawText)) as AIResponse;
  } catch (error) {
    return { error: `Bridge Error: ${String(error)}` };
  }
};
