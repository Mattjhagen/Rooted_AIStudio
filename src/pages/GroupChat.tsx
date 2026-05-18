import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFirebase } from '../context/FirebaseContext';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, getDoc, limit } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Users, Shield, BookOpen, Zap, ChevronLeft, Loader2, Info, Copy, Check, MessageSquare } from 'lucide-react';

export default function GroupChat() {
  const { groupId } = useParams();
  const { user } = useFirebase();
  const [group, setGroup] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!groupId) return;

    const fetchGroup = async () => {
      const snap = await getDoc(doc(db, 'groups', groupId));
      if (snap.exists()) {
        setGroup({ id: snap.id, ...snap.data() });
      }
    };
    fetchGroup();

    const q = query(
      collection(db, 'groupMessages'),
      where('groupId', '==', groupId),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsub();
  }, [groupId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim() || !groupId) return;

    try {
      await addDoc(collection(db, 'groupMessages'), {
        groupId,
        senderId: user.uid,
        senderName: user.displayName,
        senderPhoto: user.photoURL,
        text: newMessage,
        createdAt: new Date().toISOString()
      });
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(group.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex justify-center p-40"><Loader2 className="animate-spin text-emerald-600" /></div>;
  if (!group) return <div className="p-40 text-center">Group not found</div>;

  return (
    <div className="flex h-screen flex-col bg-neutral-50 pt-16">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <Link to="/social" className="text-neutral-400 hover:text-neutral-900 transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <Shield size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900">{group.name}</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{group.members?.length || 0} Members</p>
          </div>
        </div>
        
        <button 
          onClick={copyCode}
          className="flex items-center space-x-2 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white shadow-lg active:scale-95 transition-all"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>Code: {group.joinCode}</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex flex-col items-center justify-center py-10 opacity-30 text-center">
            <Shield size={48} className="mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest">Beginning of {group.name}</p>
            <p className="mt-1 text-xs">{new Date(group.createdAt).toLocaleDateString()}</p>
          </div>

          {messages.map((msg, i) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[80%] items-end space-x-2 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {!isMe && (
                    <Link to={`/social/profile/${msg.senderId}`}>
                      <img src={msg.senderPhoto} className="h-8 w-8 rounded-full border border-neutral-100" />
                    </Link>
                  )}
                  
                  <div className="space-y-1">
                    {!isMe && <p className="ml-2 text-[10px] font-bold text-neutral-400">{msg.senderName}</p>}
                    <div className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      isMe ? 'bg-emerald-600 text-white shadow-emerald-600/10' : 'bg-white text-neutral-900 border border-neutral-100'
                    }`}>
                      {msg.verseData && (
                        <div className={`mb-3 rounded-xl p-3 text-xs leading-relaxed ${isMe ? 'bg-emerald-700/50' : 'bg-neutral-50 border border-neutral-100'}`}>
                          <div className="mb-1 flex items-center space-x-1 font-black uppercase tracking-tighter">
                            <BookOpen size={12} />
                            <span>{msg.verseData.book} {msg.verseData.chapter}:{msg.verseData.verse}</span>
                          </div>
                          {msg.verseData.text}
                          {msg.insightData && (
                             <div className="mt-2 border-t border-current/10 pt-2 italic opacity-80 flex items-start space-x-1">
                               <Zap size={10} className="mt-1 flex-shrink-0" />
                               <span>AI Insight: {msg.insightData}</span>
                             </div>
                          )}
                        </div>
                      )}
                      <p className="font-medium leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-neutral-200 bg-white px-6 py-6 pb-10">
        <form onSubmit={handleSendMessage} className="mx-auto flex max-w-3xl items-center space-x-3">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Speak life..." 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-4 text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-emerald-600 transition-colors">
               <BookOpen size={20} />
            </button>
          </div>
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Send size={24} />
          </button>
        </form>
      </div>
    </div>
  );
}
