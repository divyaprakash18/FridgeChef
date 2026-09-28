import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, CheckCircle2 } from 'lucide-react';

export const AndroidInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user has dismissed before in this session
      const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setIsVisible(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install on Android: Tap the three dots (⋮) in Chrome, then tap "Add to Home screen" or "Install App".');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (installed || !isVisible) return null;

  return (
    <div className="bg-emerald-900 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-emerald-800 border border-emerald-700 p-1 shrink-0 flex items-center justify-center">
          <Smartphone className="w-4 h-4 text-emerald-300" />
        </div>
        <div className="min-w-0">
          <span className="font-semibold block truncate text-white">
            Install FridgeChef for Android
          </span>
          <span className="text-[11px] text-emerald-200 block truncate">
            Fast access right from your home screen with offline scanning
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 bg-white text-emerald-950 font-bold rounded-lg hover:bg-emerald-50 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 text-emerald-300 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
