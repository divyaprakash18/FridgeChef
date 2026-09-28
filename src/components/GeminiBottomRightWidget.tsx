import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Minimize2,
  Maximize2,
  MessageSquare,
  HelpCircle,
  Flame,
} from 'lucide-react';
import { GeminiChatMessage, GoogleUserProfile } from '../types';

interface GeminiBottomRightWidgetProps {
  currentIngredients: string[];
  activeRecipeTitle?: string;
  currentUser: GoogleUserProfile | null;
  onOpenAuth: () => void;
}

export const GeminiBottomRightWidget: React.FC<GeminiBottomRightWidgetProps> = ({
  currentIngredients,
  activeRecipeTitle,
  currentUser,
  onOpenAuth,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<GeminiChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'gemini',
      text: currentUser
        ? `Hi ${currentUser.name.split(' ')[0]}! I'm Gemini, your AI Sous-Chef. I can see you have ${currentIngredients.length} ingredients in your fridge. Ask me anything about substitutions, low-calorie variations, or zero-waste cooking!`
        : `Hi there! I'm Gemini, your interactive kitchen assistant. I'm connected to your fridge items. Ask me how to substitute ingredients, customize heat, or balance nutrition!`,
      timestamp: Date.now(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    const userMsg: GeminiChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          currentIngredients,
          activeRecipeTitle,
          userName: currentUser?.name,
        }),
      });

      const data = await response.json();
      const replyText = data.reply || 'Cook on medium heat, season well, and taste frequently!';

      const geminiMsg: GeminiChatMessage = {
        id: `gemini-${Date.now()}`,
        sender: 'gemini',
        text: replyText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, geminiMsg]);

      if (speechEnabled) {
        speakText(replyText);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `gemini-${Date.now()}`,
          sender: 'gemini',
          text: 'Chef Tip: If you need a substitute right now, swap butter with olive oil, yogurt with sour cream, or use whatever hearty vegetables you have on hand!',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const promptChips = [
    'What can I cook right now in 15 mins?',
    'Healthy low-carb dinner with my ingredients?',
    'What can I substitute for eggs?',
    'Zero-waste tip for leftover veggies',
  ];

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4 py-3 bg-stone-900 hover:bg-emerald-800 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer border border-stone-700"
          aria-label="Open Gemini Kitchen Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold tracking-wide">Ask Gemini Chef</div>
            <div className="text-[10px] text-stone-300">Live AI Sous-Chef</div>
          </div>
        </button>
      )}

      {/* Expanded Chat Drawer / Card */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 bg-stone-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold tracking-wide text-white">Gemini Sous-Chef</h3>
                  <span className="text-[9px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded">
                    3.8 Flash
                  </span>
                </div>
                <p className="text-[10px] text-stone-400">
                  {currentIngredients.length} fridge items linked
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSpeechEnabled(!speechEnabled)}
                title={speechEnabled ? 'Mute Speech' : 'Enable Voice Readout'}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  speechEnabled ? 'text-emerald-400 bg-stone-800' : 'text-stone-400 hover:text-white'
                }`}
              >
                {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Context Bar */}
          <div className="px-3.5 py-1.5 bg-stone-100 border-b border-stone-200 text-[11px] text-stone-600 flex items-center justify-between">
            <span className="truncate">
              {activeRecipeTitle ? `Viewing: ${activeRecipeTitle}` : 'Browsing fridge inventory'}
            </span>
            {!currentUser && (
              <button
                onClick={onOpenAuth}
                className="text-emerald-700 hover:text-emerald-900 font-semibold underline shrink-0 ml-2 cursor-pointer"
              >
                Sign in
              </button>
            )}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 max-h-[380px] bg-stone-50/40">
            {messages.map((msg) => {
              const isGemini = msg.sender === 'gemini';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isGemini ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed ${
                      isGemini
                        ? 'bg-white border border-stone-200 text-stone-800 rounded-tl-xs shadow-xs'
                        : 'bg-emerald-700 text-white rounded-tr-xs shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Footer inside message */}
                    {isGemini && (
                      <div className="mt-2 pt-1.5 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                        <span>Gemini Chef</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => speakText(msg.text)}
                            title="Read aloud"
                            className="hover:text-stone-700 transition-colors cursor-pointer"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(msg.id, msg.text)}
                            title="Copy response"
                            className="hover:text-stone-700 transition-colors cursor-pointer"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-stone-400 text-xs pl-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>Gemini Chef is typing advice...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-white border-t border-stone-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {promptChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap px-2.5 py-1 text-[11px] font-medium bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 border border-stone-200 rounded-full transition-colors shrink-0 cursor-pointer text-stone-700"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-stone-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Gemini: substitutions, heat, calories..."
                className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="p-2 bg-stone-900 hover:bg-emerald-700 disabled:bg-stone-300 text-white rounded-xl transition-colors cursor-pointer"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
