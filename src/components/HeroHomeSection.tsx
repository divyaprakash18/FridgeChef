import React from 'react';
import {
  Camera,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
  ChefHat,
  Smartphone,
  HelpCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { PRESET_FRIDGES, heroFridgeImg, culinaryHeroDishesImg } from '../data/presetScans';
import { PresetFridge } from '../types';

interface HeroHomeSectionProps {
  onScanClick: () => void;
  onSelectPreset: (preset: PresetFridge) => void;
  onOpenExplainer: () => void;
  onExploreCuisines: () => void;
  isAiAvailable: boolean;
}

export const HeroHomeSection: React.FC<HeroHomeSectionProps> = ({
  onScanClick,
  onSelectPreset,
  onOpenExplainer,
  onExploreCuisines,
  isAiAvailable,
}) => {
  return (
    <section className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-white shadow-2xl border border-stone-800">
      {/* Background Graphic / Overlay */}
      <div className="absolute inset-0 z-0 opacity-20 mix-blend-luminosity">
        <img
          src={culinaryHeroDishesImg}
          alt="Culinary spread"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-radial-at-t from-emerald-950/40 via-transparent to-black/80 z-1 pointer-events-none" />

      <div className="relative z-10 px-6 sm:px-10 lg:px-12 py-12 sm:py-16 space-y-10 max-w-7xl mx-auto">
        {/* Top Tagline Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Multimodal Vision + 100% Offline Engine</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-stone-300 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Food Waste · Zero Extra API Fees</span>
          </div>
        </div>

        {/* Main Headline & Pitch */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] text-balance">
              What’s in your fridge? <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-100 to-amber-200">
                We’ll turn it into dinner.
              </span>
            </h1>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Snap a photo of your shelves or pick your ingredients. FridgeChef instantly recognizes produce, proteins & condiments, then calculates exact dishes matched to your favorite cuisine—whether <strong className="text-white">Indian</strong>, <strong className="text-white">American</strong>, <strong className="text-white">Italian</strong>, <strong className="text-white">Mexican</strong>, or <strong className="text-white">Asian</strong>—with full nutritional values.
            </p>

            {/* Main Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onScanClick}
                className="px-6 py-3.5 text-xs sm:text-sm font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Camera className="w-4 h-4 text-stone-950" />
                <span>Snap / Upload Fridge Photo</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                type="button"
                onClick={onExploreCuisines}
                className="px-5 py-3.5 text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all flex items-center gap-2 cursor-pointer backdrop-blur-sm"
              >
                <ChefHat className="w-4 h-4 text-emerald-300" />
                <span>Choose Regional Cuisine</span>
              </button>

              <button
                type="button"
                onClick={onOpenExplainer}
                className="text-stone-400 hover:text-stone-200 text-xs underline cursor-pointer px-2 py-1"
              >
                How free mode works
              </button>
            </div>
          </div>

          {/* Interactive Hero Before / After Interactive Showcase Card */}
          <div className="lg:col-span-5">
            <div className="bg-stone-800/80 backdrop-blur-md rounded-2xl border border-stone-700 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between text-xs border-b border-stone-700/80 pb-3">
                <span className="font-semibold text-stone-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Transformation Demo
                </span>
                <span className="text-[11px] text-emerald-300 font-mono">100% Match</span>
              </div>

              {/* Two Column Visual Comparison */}
              <div className="grid grid-cols-2 gap-3">
                {/* Before: Fridge */}
                <div className="space-y-2">
                  <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-stone-600 shadow-inner group">
                    <img
                      src={heroFridgeImg}
                      alt="Inside open fridge"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/70 backdrop-blur rounded text-[10px] font-semibold text-white">
                      1. Fridge Photo
                    </div>
                  </div>
                  <div className="text-[11px] text-stone-300 space-y-0.5">
                    <div className="font-semibold text-white">Detected Items:</div>
                    <p className="text-stone-400 truncate">Eggs, cheese, spinach, peppers...</p>
                  </div>
                </div>

                {/* After: Dish */}
                <div className="space-y-2">
                  <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-stone-600 shadow-inner group">
                    <img
                      src={culinaryHeroDishesImg}
                      alt="Cooked dish"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-emerald-900/90 backdrop-blur rounded text-[10px] font-semibold text-emerald-200">
                      2. Matched Dish
                    </div>
                  </div>
                  <div className="text-[11px] text-stone-300 space-y-0.5">
                    <div className="font-semibold text-white">Dinner Ready:</div>
                    <p className="text-emerald-300 truncate font-medium">320 kcal · 20g protein · 15m</p>
                  </div>
                </div>
              </div>

              {/* 1-Click Try Preset Samples Pill Strip */}
              <div className="pt-2 border-t border-stone-700/80">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-2">
                  Or test with 1-click sample fridges:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_FRIDGES.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onSelectPreset(preset)}
                      className="p-2 bg-stone-700/60 hover:bg-emerald-950/60 hover:border-emerald-500/60 border border-stone-600/80 rounded-xl text-left transition-all cursor-pointer group"
                    >
                      <div className="w-full aspect-16/9 rounded-lg overflow-hidden mb-1.5 border border-stone-600">
                        <img
                          src={preset.image}
                          alt={preset.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <span className="text-[11px] font-bold text-stone-200 group-hover:text-emerald-200 block truncate">
                        {preset.title.split(' ')[0]}
                      </span>
                      <span className="text-[9px] text-stone-400 block truncate">
                        {preset.ingredients.length} items
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Three-Step Visual Guide Bar */}
        <div className="pt-6 border-t border-stone-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/5 border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
              1
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Snap or Upload</h4>
              <p className="text-[11px] text-stone-400 mt-0.5">
                AI Vision or Standalone Tagger extracts ingredients instantly from your fridge shelves.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/5 border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
              2
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Select Regional Cuisine</h4>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Pick Indian, American, Italian, Mexican, Asian, or Mediterranean with custom heat levels.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/5 border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0">
              3
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Cook with Zero Waste</h4>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Follow hands-free voice cooking steps, scaled nutrition facts & smart grocery checklists.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
