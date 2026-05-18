import { motion, AnimatePresence } from 'motion/react';
import { Type, Moon, Sun, Monitor, X } from 'lucide-react';

export type BackgroundTheme = 'white' | 'tan' | 'black';
export type FontFamily = 'sans' | 'serif' | 'mono' | 'display';

interface ReadingSettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    theme: BackgroundTheme;
    fontFamily: FontFamily;
    fontSize: number;
  };
  onUpdate: (settings: any) => void;
}

export default function ReadingSettingsMenu({ isOpen, onClose, settings, onUpdate }: ReadingSettingsMenuProps) {
  const themes: { id: BackgroundTheme; label: string; bg: string; text: string }[] = [
    { id: 'white', label: 'Light', bg: 'bg-white', text: 'text-neutral-900' },
    { id: 'tan', label: 'Sepia', bg: 'bg-[#f4ecd8]', text: 'text-[#5b4636]' },
    { id: 'black', label: 'Dark', bg: 'bg-neutral-900', text: 'text-neutral-100' },
  ];

  const fonts: { id: FontFamily; label: string; class: string }[] = [
    { id: 'sans', label: 'Inter', class: 'font-sans' },
    { id: 'serif', label: 'Literata', class: 'font-serif' },
    { id: 'display', label: 'Outfit', class: 'font-display' },
    { id: 'mono', label: 'Mono', class: 'font-mono' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] mx-auto max-w-2xl rounded-t-3xl border-t border-neutral-200 bg-white p-6 shadow-2xl md:bottom-8 md:rounded-3xl md:border"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold">Reading Settings</h3>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-neutral-100">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-8">
              {/* Background Theme */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-400">Background</p>
                <div className="grid grid-cols-3 gap-3">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onUpdate({ ...settings, theme: t.id })}
                      className={`flex flex-col items-center justify-center rounded-xl border-2 py-4 transition-all ${
                        settings.theme === t.id ? 'border-emerald-500 ring-2 ring-emerald-50' : 'border-neutral-100'
                      } ${t.bg} ${t.text}`}
                    >
                      <span className="text-sm font-medium">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-400">Font</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {fonts.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => onUpdate({ ...settings, fontFamily: f.id })}
                      className={`rounded-xl border-2 py-3 text-sm transition-all ${
                        settings.fontFamily === f.id ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-neutral-100'
                      } ${f.class}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Size</p>
                  <span className="text-sm font-medium text-neutral-600">{settings.fontSize}px</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-neutral-400">A</span>
                  <input
                    type="range"
                    min="14"
                    max="24"
                    step="1"
                    value={settings.fontSize}
                    onChange={(e) => onUpdate({ ...settings, fontSize: parseInt(e.target.value) })}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-100 accent-emerald-600"
                  />
                  <span className="text-xl text-neutral-800">A</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
