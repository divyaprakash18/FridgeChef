import React from 'react';
import { X, CheckCircle2, Zap, ShieldCheck, Globe, Cpu } from 'lucide-react';

interface ApiExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAiActive: boolean;
}

export const ApiExplainerModal: React.FC<ApiExplainerModalProps> = ({
  isOpen,
  onClose,
  isAiActive,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 bg-stone-50">
          <div>
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Can This Run Without APIs or Costs?
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Direct answers to your questions on photo identification, Google Search, and standalone offline usage.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-stone-700 leading-relaxed">
          {/* Section 1: The Core Technical Reality */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-emerald-950 text-base">
                  Yes, this app works both ways: 100% Free Standalone & Dual AI Vision!
                </h4>
                <p className="text-emerald-900/90 mt-1">
                  We engineered this app so you are never locked into paid services. You can use it as a 100% standalone, zero-cost pantry matcher, or activate free Google Gemini Vision multimodal scanning with zero extra charges.
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Points */}
          <div className="space-y-4">
            <div className="border border-stone-200 rounded-xl p-4 hover:border-stone-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-stone-100 text-stone-700 rounded-lg shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-stone-900">
                    1. Why can’t raw client-side JavaScript recognize messy fridges without a model?
                  </h4>
                  <p className="text-stone-600 mt-1">
                    Unlike barcodes or QR codes, a refrigerator is a 3D environment full of overlapping containers, half-cut vegetables in plastic wrap, condiments with turned labels, and dark corners. Standard offline HTML/JS algorithms have no visual intelligence to identify that a green object is half a zucchini. That requires computer vision.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-stone-200 rounded-xl p-4 hover:border-stone-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-50 text-amber-800 rounded-lg shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-stone-900">
                    2. What about Google Image Search or Google Lens?
                  </h4>
                  <p className="text-stone-600 mt-1">
                    Google Lens and Google Images are consumer web apps designed to reverse-search single products or web pages. Google does not offer an open, free, unauthenticated API for third-party websites to extract lists of multiple food items from one photo.
                  </p>
                  <p className="text-stone-600 mt-1.5 font-medium">
                    However, Google’s native Gemini 3.8 Flash model does this directly and is automatically connected in your Google AI Studio environment at no additional cost!
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-stone-200 rounded-xl p-4 hover:border-stone-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-stone-900">
                    3. How does the 100% Free Standalone Mode work?
                  </h4>
                  <p className="text-stone-600 mt-1">
                    If you don't want any network calls or external APIs:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-stone-600">
                    <li>
                      <strong>Visual Fridge Inventory Picker:</strong> Tap from 100+ common ingredients (vegetables, cheeses, dairy, meats, condiments) in 3 seconds.
                    </li>
                    <li>
                      <strong>3 Realistic Pre-scanned Fridges:</strong> One-click load complete realistic fridge photos (Family fridge, Student minimalist shelf, Farmers market fresh drawer).
                    </li>
                    <li>
                      <strong>Deterministic Recipe Matcher:</strong> Calculates 100% accurate match percentages, missing staples, prep times, and step-by-step cooking steps directly on your device.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Cost Summary */}
          <div className="flex items-center gap-2 text-xs text-stone-500 pt-2 border-t border-stone-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Zero tracking · No forced subscriptions · Works fully in your browser</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            Got it, let's cook!
          </button>
        </div>
      </div>
    </div>
  );
};
