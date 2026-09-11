import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Palette, 
  X, 
  GripHorizontal, 
  Check, 
  Sparkles, 
  Minimize2, 
  Maximize2,
  Compass
} from "lucide-react";
import { SIHADIR_THEMES, ThemeId, ThemeDefinition } from "../utils/themeConfig";

interface DraggableThemeWidgetProps {
  currentTheme: ThemeId;
  onThemeChange: (newTheme: ThemeId) => void;
  className?: string;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
}

export function DraggableThemeWidget({
  currentTheme,
  onThemeChange,
  className = "",
  isOpenExternal,
  onCloseExternal
}: DraggableThemeWidgetProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = isOpenExternal !== undefined ? (isOpenExternal || internalIsOpen) : internalIsOpen;

  const handleSetOpen = (open: boolean) => {
    setInternalIsOpen(open);
    if (!open && onCloseExternal) {
      onCloseExternal();
    }
  };

  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  const themesList = Object.values(SIHADIR_THEMES) as ThemeDefinition[];
  const currentThemeDef = SIHADIR_THEMES[currentTheme] || SIHADIR_THEMES.blue;

  const categories = ["Semua", "Warna Solid (Bukan Gradasi)", "Gradasi Keren", "Gelap & Cyber", "Klasik & Elegan"];

  const filteredThemes = selectedCategory === "Semua" 
    ? themesList 
    : themesList.filter(t => t.category === selectedCategory);

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
      whileDrag={{ scale: 1.02, cursor: "grabbing" }}
      className={`fixed z-50 select-none ${className}`}
      style={{ touchAction: "none" }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      id="draggable-theme-widget"
    >
      {/* Collapsed Pill Button */}
      {!isOpen ? (
        <div className="flex items-center gap-1.5 bg-slate-950/85 hover:bg-slate-900/95 text-white backdrop-blur-xl border border-white/20 p-1.5 pr-3 rounded-full shadow-2xl transition-all group cursor-grab active:cursor-grabbing hover:border-indigo-400">
          <div 
            className="p-1 text-white/50 group-hover:text-white/90 transition-colors"
            title="Geser / Tarik untuk memindahkan posisi widget tema ini"
          >
            <GripHorizontal className="w-4 h-4" />
          </div>

          <button
            type="button"
            onClick={() => handleSetOpen(true)}
            className="flex items-center gap-2 text-xs font-bold focus:outline-hidden cursor-pointer"
            title="Klik untuk memilih variasi tema latar dan gradasi"
          >
            <div className={`w-4 h-4 rounded-full shadow-xs ${currentThemeDef.previewClass} ring-2 ring-white/30`} />
            <span className="text-[11px] font-black tracking-wide text-white flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>Tema: {currentThemeDef.name}</span>
            </span>
          </button>
        </div>
      ) : (
        /* Expanded Theme Selection Window */
        <motion.div 
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          className="w-[340px] sm:w-[380px] bg-slate-950/95 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[85vh]"
        >
          {/* Header with Drag Handle */}
          <div className="p-3.5 px-4 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border-b border-white/10 flex items-center justify-between cursor-grab active:cursor-grabbing">
            <div className="flex items-center gap-2">
              <div className="text-white/40 hover:text-white transition-colors" title="Tahan dan geser untuk memindahkan">
                <GripHorizontal className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  Pilih Tema Latar & Gradasi
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleSetOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                title="Tutup / Kecilkan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hint bar */}
          <div className="px-4 py-1.5 bg-indigo-950/40 border-b border-white/5 flex items-center justify-between text-[10px] text-indigo-200">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Widget ini dapat digeser bebas ke mana saja</span>
            </span>
            <span className="font-mono text-white/60">
              {themesList.length} Tema
            </span>
          </div>

          {/* Category Tabs */}
          <div className="p-2 px-3 flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-white/5 bg-slate-900/40">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Theme List */}
          <div className="p-3 space-y-2 overflow-y-auto max-h-[380px] custom-scrollbar">
            {filteredThemes.map(theme => {
              const isSelected = currentTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    onThemeChange(theme.id);
                  }}
                  className={`w-full text-left p-2.5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? "bg-white/15 border-indigo-400 shadow-md ring-1 ring-indigo-400/50"
                      : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Visual Color Circle Preview */}
                    <div 
                      className={`w-8 h-8 rounded-xl shrink-0 shadow-md ${theme.previewClass} ring-1 ring-white/30 flex items-center justify-center`}
                    >
                      {isSelected && (
                        <Check className="w-4 h-4 text-white drop-shadow-md stroke-[3]" />
                      )}
                    </div>

                    {/* Text Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white group-hover:text-sky-300 transition-colors truncate">
                          {theme.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-white/10 text-white/70 border border-white/10 shrink-0">
                          {theme.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/60 truncate mt-0.5">
                        {theme.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    <span 
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all ${
                        isSelected 
                          ? "bg-indigo-500 text-white shadow-xs" 
                          : "text-white/40 group-hover:text-white/80"
                      }`}
                    >
                      {isSelected ? "Aktif" : "Pilih"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="p-2.5 px-4 bg-slate-900/80 border-t border-white/10 flex items-center justify-between text-[10px] text-white/60">
            <span>Tema aktif tersimpan otomatis</span>
            <button
              type="button"
              onClick={() => handleSetOpen(false)}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
