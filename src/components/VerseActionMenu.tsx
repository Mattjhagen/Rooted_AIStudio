import { motion, AnimatePresence } from 'motion/react';
import { Share2, FileEdit, Zap, Highlighter, X, Globe, Lock } from 'lucide-react';

interface VerseActionMenuProps {
  selectedVerses: number[];
  onClose: () => void;
  onHighlight: (color: string) => void;
  onAddNote: () => void;
  onShare: () => void;
  onShareToGroup: () => void;
  onAskAI: () => void;
}

export default function VerseActionMenu({
  selectedVerses,
  onClose,
  onHighlight,
  onAddNote,
  onShare,
  onShareToGroup,
  onAskAI,
}: VerseActionMenuProps) {
  if (selectedVerses.length === 0) return null;

  const colors = [
    { id: 'yellow', bg: 'bg-yellow-200', border: 'border-yellow-400' },
    { id: 'green', bg: 'bg-green-200', border: 'border-green-400' },
    { id: 'blue', bg: 'bg-blue-200', border: 'border-blue-400' },
    { id: 'pink', bg: 'bg-pink-200', border: 'border-pink-400' },
    { id: 'purple', bg: 'bg-purple-200', border: 'border-purple-400' },
  ];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 w-[90%] max-w-lg overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 px-4 py-2">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-tighter">
          {selectedVerses.length} {selectedVerses.length === 1 ? 'Verse' : 'Verses'} Selected
        </span>
        <button onClick={onClose} className="rounded-full p-1 hover:bg-neutral-200">
          <X size={14} />
        </button>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Highlight Colors */}
        <div className="flex justify-between items-center bg-neutral-50 p-3 rounded-xl">
          <div className="flex space-x-2">
            {colors.map((c) => (
              <button
                key={c.id}
                onClick={() => onHighlight(c.id)}
                className={`h-8 w-8 rounded-full border-2 ${c.bg} ${c.border} transition-transform hover:scale-110 active:scale-95`}
              />
            ))}
          </div>
          <div className="h-4 w-px bg-neutral-200 mx-2" />
          <button 
            onClick={() => onHighlight('transparent')}
            className="text-xs font-medium text-neutral-400 hover:text-neutral-600"
          >
            Clear
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={onAskAI}
            className="flex flex-col items-center justify-center space-y-1 rounded-xl bg-emerald-600 py-3 text-white shadow-md hover:bg-emerald-700 active:scale-95 transition-all"
          >
            <Zap size={18} />
            <span className="text-[10px] font-bold uppercase transition-all">Ask AI</span>
          </button>
          <button
            onClick={onAddNote}
            className="flex flex-col items-center justify-center space-y-1 rounded-xl bg-neutral-50 py-3 text-neutral-700 border border-neutral-100 hover:bg-neutral-100 active:scale-95 transition-all"
          >
            <FileEdit size={18} />
            <span className="text-[10px] font-bold uppercase">Note</span>
          </button>
          <button
            onClick={onShareToGroup}
            className="flex flex-col items-center justify-center space-y-1 rounded-xl bg-neutral-50 py-3 text-neutral-700 border border-neutral-100 hover:bg-neutral-100 active:scale-95 transition-all"
          >
            <Users size={18} />
            <span className="text-[10px] font-bold uppercase">Community</span>
          </button>
          <button
            onClick={onShare}
            className="flex flex-col items-center justify-center space-y-1 rounded-xl bg-neutral-50 py-3 text-neutral-700 border border-neutral-100 hover:bg-neutral-100 active:scale-95 transition-all"
          >
            <Share2 size={18} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Full Link</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
