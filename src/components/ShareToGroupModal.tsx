import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Send, Loader2, BookOpen, Zap } from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

interface ShareToGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVerses: number[];
  verseText: string;
  bookName: string;
  chapter: string;
  insightText?: string | null;
}

export default function ShareToGroupModal({
  isOpen,
  onClose,
  selectedVerses,
  verseText,
  bookName,
  chapter,
  insightText
}: ShareToGroupModalProps) {
  const { user } = useFirebase();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isOpen) return;

    const fetchGroups = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'groups'),
          where('members', 'arrayContains', user.uid)
        );
        const snap = await getDocs(q);
        setGroups(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user, isOpen]);

  const handleShare = async (groupId: string) => {
    if (!user) return;
    setSharing(groupId);
    try {
      await addDoc(collection(db, 'groupMessages'), {
        groupId,
        senderId: user.uid,
        senderName: user.displayName,
        senderPhoto: user.photoURL,
        text: `Shared a passage from ${bookName} ${chapter}`,
        verseData: {
          book: bookName,
          chapter: chapter,
          verse: selectedVerses.join(', '),
          text: verseText
        },
        insightData: insightText,
        createdAt: new Date().toISOString()
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSharing(null);
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
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed inset-0 z-[210] m-auto h-fit w-[90%] max-w-sm overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
              <h3 className="text-xl font-black italic">Share to Group</h3>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-neutral-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
               <div className="mb-6 rounded-2xl bg-neutral-50 p-4 border border-neutral-100">
                  <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">
                    <BookOpen size={12} />
                    <span>{bookName} {chapter}:{selectedVerses.join(', ')}</span>
                  </div>
                  <p className="text-xs text-neutral-500 line-clamp-2 italic">"{verseText}"</p>
                  {insightText && (
                    <div className="mt-2 text-[8px] font-bold text-neutral-300 flex items-center space-x-1">
                      <Zap size={10} />
                      <span>INCLUDES AI INSIGHT</span>
                    </div>
                  )}
               </div>

               <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-neutral-400">Select Church/Group</p>
               
               {loading ? (
                 <div className="flex justify-center py-8"><Loader2 className="animate-spin text-emerald-600" /></div>
               ) : groups.length > 0 ? (
                 <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {groups.map(g => (
                      <button 
                        key={g.id}
                        onClick={() => handleShare(g.id)}
                        disabled={!!sharing}
                        className="flex w-full items-center justify-between rounded-2xl bg-white border border-neutral-200 p-4 transition-all hover:border-emerald-500 hover:bg-emerald-50 group"
                      >
                        <div className="flex items-center space-x-3">
                           <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                              <Shield size={16} />
                           </div>
                           <span className="text-sm font-bold text-neutral-900">{g.name}</span>
                        </div>
                        {sharing === g.id ? <Loader2 className="animate-spin text-emerald-600" size={16} /> : <Send size={16} className="text-neutral-300 group-hover:text-emerald-600" />}
                      </button>
                    ))}
                 </div>
               ) : (
                 <div className="py-8 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                    <Users size={32} className="mx-auto mb-2 text-neutral-300" />
                    <p className="text-xs font-medium text-neutral-400 px-4">You aren't in any groups yet. Join one in the Community tab!</p>
                 </div>
               )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
