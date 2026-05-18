import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, Lock, Save, Loader2 } from 'lucide-react';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string, isPublic: boolean) => Promise<void>;
  selectedVerses: number[];
  initialText?: string;
  initialIsPublic?: boolean;
}

export default function NoteModal({
  isOpen,
  onClose,
  onSave,
  selectedVerses,
  initialText = '',
  initialIsPublic = false,
}: NoteModalProps) {
  const [text, setText] = useState(initialText);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await onSave(text, isPublic);
      onClose();
    } catch (err) {
      console.error('Save note error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="fixed inset-0 z-[110] m-auto h-fit w-[90%] max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
              <h3 className="text-lg font-bold">Add Note</h3>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-neutral-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
                  Selected Verses: {selectedVerses.join(', ')}
                </p>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What is God speaking to you through these verses?"
                  className="h-40 w-full resize-none rounded-2xl border border-neutral-200 bg-neutral-50 p-4 font-serif text-lg leading-relaxed focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsPublic(false)}
                    className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      !isPublic ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    <Lock size={14} />
                    <span>Private</span>
                  </button>
                  <button
                    onClick={() => setIsPublic(true)}
                    className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      isPublic ? 'bg-blue-100 text-blue-700' : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    <Globe size={14} />
                    <span>Public</span>
                  </button>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving || !text.trim()}
                  className="flex items-center space-x-2 rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  <span>{saving ? 'Saving...' : 'Save Note'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
