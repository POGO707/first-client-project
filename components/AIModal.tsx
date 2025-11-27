import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, Database, Bell } from 'lucide-react';
import { createChatSession } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Chat } from '@google/genai';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am Dr. Bhakat\'s AI Assistant. I can answer your questions or help you book an appointment. How can I assist you today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [systemAction, setSystemAction] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, systemAction]);

  // Initialize chat session when modal opens if not already initialized
  useEffect(() => {
    if (isOpen && !chatRef.current) {
      chatRef.current = createChatSession();
    }
  }, [isOpen]);

  const simulateBackendAction = async (action: string, delay: number) => {
    setSystemAction(action);
    await new Promise(resolve => setTimeout(resolve, delay));
    setSystemAction(null);
  };

  const handleSend = async () => {
    if (!input.trim() || !chatRef.current) return;

    const userText = input;
    const userMsg: ChatMessage = { role: 'user', text: userText, timestamp: new Date() };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Send user message
      let response = await chatRef.current.sendMessage({ message: userText });

      // Handle Function Calls (e.g., booking)
      if (response.functionCalls && response.functionCalls.length > 0) {
        // Prepare function responses
        const functionResponses = await Promise.all(response.functionCalls.map(async (call) => {
          if (call.name === 'bookAppointment') {
            const args = call.args as any;
            const bookingId = 'BK-' + Math.floor(1000 + Math.random() * 9000);
            
            // Simulate Backend Processes
            console.group("🏥 Appointment Backend Processes");
            
            // 1. Notify Doctor
            await simulateBackendAction("Notifying Dr. Bhakat...", 800);
            console.log(`[Notification Service] SMS sent to Doctor: "New Appointment: ${args.patientName} for ${args.preferredSlot}"`);
            
            // 2. Save to Notion
            await simulateBackendAction("Saving to Notion Database...", 800);
            const notionPageId = `notion-${Date.now()}`;
            console.log(`[Notion Integration] Created Page ID: ${notionPageId}`);
            console.log(`[Notion Data]`, {
              Database: "Clinic_Appointments_Master",
              Properties: {
                Name: args.patientName,
                Phone: args.phoneNumber,
                Reason: args.reason,
                Slot: args.preferredSlot,
                Status: "Scheduled",
                BookingID: bookingId
              }
            });
            console.groupEnd();

            return {
              functionResponse: {
                name: call.name,
                id: call.id,
                response: { 
                  status: 'confirmed', 
                  bookingId: bookingId,
                  notionEntryId: notionPageId,
                  doctorNotified: true,
                  message: 'Appointment successfully booked. Doctor notified and Notion database updated.'
                }
              }
            };
          }
          return {
            functionResponse: {
              name: call.name,
              id: call.id,
              response: { error: 'Unknown tool' }
            }
          };
        }));

        // Send function execution results back to the model to get the final natural language confirmation
        response = await chatRef.current.sendMessage({ message: functionResponses });
      }

      // Display model response
      const modelText = response.text || "I processed that, but I'm not sure what to say.";
      setMessages(prev => [...prev, { role: 'model', text: modelText, timestamp: new Date() }]);

    } catch (error) {
      console.error("Gemini Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to the system right now. Please try again later.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
      setSystemAction(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] pointer-events-auto" onClick={onClose} />
      
      <div className="pointer-events-auto w-full sm:w-[400px] h-[80vh] sm:h-[600px] bg-white shadow-2xl rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden animate-slide-up sm:mr-6 sm:mb-6 sm:ml-auto relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-700 to-primary-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-full">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm">AI Health Assistant</h3>
              <p className="text-xs text-primary-100">Powered by Gemini 2.5</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition">
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-primary-100 text-primary-700' : 'bg-accent-100 text-accent-700'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-tr-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          
          {/* System Action Indicator */}
          {systemAction && (
             <div className="flex justify-center w-full animate-fade-in">
               <div className="bg-gray-100 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-xs flex items-center gap-2 shadow-sm">
                 {systemAction.includes('Notifying') ? <Bell size={12} className="text-accent-500" /> : <Database size={12} className="text-blue-500" />}
                 {systemAction}
               </div>
             </div>
          )}

          {isLoading && !systemAction && (
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 px-4 py-2 text-[10px] text-yellow-800 border-t border-yellow-100 text-center">
          AI generated. Not a substitute for professional medical advice.
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Book appointment or ask a question..."
              className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:bg-white transition text-sm outline-none"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white p-2 rounded-full transition shadow-md"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIModal;