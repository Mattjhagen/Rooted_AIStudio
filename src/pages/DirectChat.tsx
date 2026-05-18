import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFirebase } from '../context/FirebaseContext';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, getDoc, limit } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Send, ChevronLeft, Loader2, MessageSquare, User as UserIcon } from 'lucide-react';

export default function DirectChat() {
  const { userId } = useParams();
  const { user } = useFirebase();
  const [recipient, setRecipient] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId || !user) return;

    const fetchRecipient = async () => {
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists()) {
        setRecipient({ id: snap.id, ...snap.data() });
      }
    };
    fetchRecipient();

    const q = query(
      collection(db, 'directMessages'),
      where('senderId', 'in', [user.uid, userId]),
      where('receiverId', 'in', [user.uid, userId]),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsub();
  }, [userId, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !recipient || !newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'directMessages'), {
        senderId: user.uid,
        receiverId: recipient.id,
        text: newMessage,
        createdAt: new Date().toISOString()
      });
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center p-40"><Loader2 className="animate-spin text-emerald-600" /></div>;
  if (!recipient) return <div className="p-40 text-center">User not found</div>;

  return (
    <div className="flex h-screen flex-col bg-neutral-50 pt-16">
      {/* Header */}
      <div className="flex items-center space-x-4 border-b border-neutral-200 bg-white px-6 py-4 shadow-sm">
        <Link to={`/social/profile/${recipient.id}`} className="text-neutral-400 hover:text-neutral-900 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <img src={recipient.photoURL} alt={recipient.displayName} className="h-10 w-10 rounded-full border border-neutral-100" />
        <div>
          <h2 className="text-lg font-bold text-neutral-900">{recipient.displayName}</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((msg) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  isMe ? 'bg-emerald-600 text-white' : 'bg-white text-neutral-900 border border-neutral-100'
                }`}>
                  <p className="font-medium">{msg.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-neutral-200 bg-white px-6 py-6 pb-10">
        <form onSubmit={handleSendMessage} className="mx-auto flex max-w-2xl items-center space-x-3">
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-4 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
