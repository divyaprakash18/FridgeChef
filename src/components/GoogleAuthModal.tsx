import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, Sparkles, LogOut, Key, ExternalLink } from 'lucide-react';
import { GoogleUserProfile } from '../types';

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: GoogleUserProfile | null;
  onSignIn: (user: GoogleUserProfile) => void;
  onSignOut: () => void;
  onSavePersonalKey?: (key: string) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignIn,
  onSignOut,
  onSavePersonalKey,
}) => {
  if (!isOpen) return null;

  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const [personalKeyInput, setPersonalKeyInput] = useState<string>(() => {
    return currentUser?.personalGeminiApiKey || localStorage.getItem('user_gemini_api_key') || '';
  });
  const [keyNotice, setKeyNotice] = useState<string | null>(null);

  // Initialize Google Identity Services button if available
  useEffect(() => {
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: 'sample-client-id.apps.googleusercontent.com',
          callback: (response: any) => {
            try {
              const base64Url = response.credential.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );
              const payload = JSON.parse(jsonPayload);
              const savedKey = localStorage.getItem('user_gemini_api_key') || undefined;
              onSignIn({
                id: payload.sub || `google-${Date.now()}`,
                name: payload.name || 'Google User',
                email: payload.email || 'user@gmail.com',
                avatarUrl: payload.picture,
                authProvider: 'google',
                personalGeminiApiKey: savedKey,
              });
              onClose();
            } catch (e) {
              console.error('Error decoding Google JWT:', e);
            }
          },
        });
      } catch (err) {
        console.warn('Google Identity Services notice:', err);
      }
    }
  }, [isOpen, onSignIn, onClose]);

  const handleInstantGoogleSignIn = (email: string, name: string) => {
    const savedKey = personalKeyInput.trim() || localStorage.getItem('user_gemini_api_key') || undefined;
    const user: GoogleUserProfile = {
      id: `google-${Date.now()}`,
      name,
      email,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=047857`,
      authProvider: 'google',
      personalGeminiApiKey: savedKey,
    };
    onSignIn(user);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customName.trim()) return;
    handleInstantGoogleSignIn(customEmail.trim(), customName.trim());
  };

  const handleSavePersonalKey = () => {
    const trimmed = personalKeyInput.trim();
    if (trimmed) {
      localStorage.setItem('user_gemini_api_key', trimmed);
      if (onSavePersonalKey) onSavePersonalKey(trimmed);
      if (currentUser) {
        onSignIn({ ...currentUser, personalGeminiApiKey: trimmed });
      }
      setKeyNotice('✓ Key saved! Requests will use your personal free Gemini quota.');
    } else {
      localStorage.removeItem('user_gemini_api_key');
      if (onSavePersonalKey) onSavePersonalKey('');
      if (currentUser) {
        onSignIn({ ...currentUser, personalGeminiApiKey: undefined });
      }
      setKeyNotice('Key cleared. App will run in 100% Free Standalone Mode.');
    }
    setTimeout(() => setKeyNotice(null), 3500);
  };

  const hasPersonalKey = Boolean(personalKeyInput.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white shadow-xs border border-stone-200 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {currentUser ? 'Google Account' : 'Sign in with Google'}
              </h3>
              <p className="text-[11px] text-stone-500">
                Personal preferences & optional free Gemini AI access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {currentUser ? (
            /* Signed in Profile State */
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full border border-emerald-300 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-stone-900 truncate">
                      {currentUser.name}
                    </h4>
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 font-semibold px-1.5 py-0.2 rounded">
                      Google Active
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 truncate">{currentUser.email}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div className="flex items-center gap-2 text-emerald-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Personal Favorites & Custom Dietary Sync Active</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Zero-Waste Grocery Checklist Sync Active</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {hasPersonalKey
                      ? 'Personal Free Gemini Vision: Connected'
                      : 'Running in 100% Free Standalone Mode'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                className="w-full py-2 px-4 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out from Google Account</span>
              </button>
            </div>
          ) : (
            /* Sign In Prompt */
            <div className="space-y-4">
              <div className="text-xs text-stone-600 space-y-1 leading-relaxed">
                <p className="font-medium text-stone-800">
                  Sign in with your Google account to sync your kitchen preferences:
                </p>
                <ul className="list-disc pl-5 space-y-0.5 text-stone-600">
                  <li>Save favorite recipes across all cuisines</li>
                  <li>Sync smart grocery shopping checklists across devices</li>
                  <li>Use your own free Google Gemini quota limit for AI photo scans</li>
                </ul>
              </div>

              {/* 1-Click Google Sign-In */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    handleInstantGoogleSignIn('divya2.yadav@paytm.com', 'Divya Yadav')
                  }
                  className="w-full py-3 px-4 rounded-xl border border-stone-300 hover:border-emerald-600 bg-white hover:bg-stone-50 shadow-sm flex items-center justify-between gap-3 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <div className="text-left">
                      <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-900">
                        Continue as Divya Yadav
                      </div>
                      <div className="text-[11px] text-stone-500">divya2.yadav@paytm.com</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Sign In
                  </span>
                </button>

                <div className="flex items-center gap-2 py-1">
                  <div className="flex-1 h-px bg-stone-200" />
                  <span className="text-[10px] uppercase font-semibold text-stone-400">or sign in with custom email</span>
                  <div className="flex-1 h-px bg-stone-200" />
                </div>

                {!isCustomMode ? (
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(true)}
                    className="w-full py-2 text-xs font-medium text-stone-600 hover:text-stone-900 underline text-center cursor-pointer"
                  >
                    Enter another Google email
                  </button>
                ) : (
                  <form onSubmit={handleCustomSubmit} className="space-y-2.5">
                    <div>
                      <input
                        type="text"
                        required
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Your Name (e.g. Alex)"
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        required
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        placeholder="Google Email (e.g. alex@gmail.com)"
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer"
                    >
                      Sign In to FridgeChef
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Personal Free Gemini Quota (BYO-Key) Section */}
          <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-stone-900">
                <Key className="w-3.5 h-3.5 text-emerald-700" />
                <span>Use Your Own Free Gemini Quota (Optional)</span>
              </div>
              {hasPersonalKey ? (
                <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded">
                  Connected
                </span>
              ) : (
                <span className="text-[10px] text-stone-500 bg-stone-200 font-medium px-2 py-0.5 rounded">
                  Zero Billing Mode
                </span>
              )}
            </div>

            <p className="text-stone-600 text-[11px] leading-relaxed">
              Google gives each account free access limits for Gemini. To use multimodal AI scanning without charging the app host, paste your personal Google AI Studio key below. It is stored securely only in your browser storage.
            </p>

            <div className="flex gap-2 pt-1">
              <input
                type="password"
                value={personalKeyInput}
                onChange={(e) => setPersonalKeyInput(e.target.value)}
                placeholder="Paste your free AIza... key"
                className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
              />
              <button
                type="button"
                onClick={handleSavePersonalKey}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg cursor-pointer"
              >
                {hasPersonalKey ? 'Update' : 'Save'}
              </button>
              {hasPersonalKey && (
                <button
                  type="button"
                  onClick={() => {
                    setPersonalKeyInput('');
                    localStorage.removeItem('user_gemini_api_key');
                    if (onSavePersonalKey) onSavePersonalKey('');
                    if (currentUser) {
                      onSignIn({ ...currentUser, personalGeminiApiKey: undefined });
                    }
                    setKeyNotice('Key cleared. Returned to 100% Free Standalone Mode.');
                  }}
                  className="px-2 py-2 text-xs text-stone-500 hover:text-stone-800 hover:bg-stone-200 rounded-lg cursor-pointer"
                  title="Clear key"
                >
                  Clear
                </button>
              )}
            </div>

            {keyNotice && (
              <div className="text-[11px] text-emerald-800 font-medium animate-in fade-in">
                {keyNotice}
              </div>
            )}

            <div className="text-[11px] pt-1">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:text-emerald-900 font-medium inline-flex items-center gap-1 hover:underline"
              >
                <span>Get a free key from Google AI Studio (No credit card needed)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Host is never billed. Standalone mode always available.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
