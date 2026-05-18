import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFirebase } from '../context/FirebaseContext';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { UserPlus, UserMinus, MessageSquare, Shield, Share2, ChevronLeft, Loader2, Link as LinkIcon, Check } from 'lucide-react';

export default function UserProfile() {
  const { userId } = useParams();
  const { user } = useFirebase();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [friendship, setFriendship] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      const docRef = doc(db, 'users', userId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setProfile({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    };

    fetchProfile();

    if (user && userId !== user.uid) {
      const q = query(
        collection(db, 'friendships'),
        where('user1Id', 'in', [user.uid, userId]),
        where('user2Id', 'in', [user.uid, userId])
      );
      const unsub = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          setFriendship({ id: snap.docs[0].id, ...snap.docs[0].data() });
        } else {
          setFriendship(null);
        }
      });
      return () => unsub();
    }
  }, [userId, user]);

  const toggleFriend = async () => {
    if (!user || !userId) return;
    try {
      if (friendship) {
        await deleteDoc(doc(db, 'friendships', friendship.id));
      } else {
        await addDoc(collection(db, 'friendships'), {
          user1Id: user.uid,
          user2Id: userId,
          status: 'accepted', // Auto-accepting for MVP, usually would be pending
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex justify-center p-40"><Loader2 className="animate-spin" /></div>;
  if (!profile) return <div className="p-40 text-center">User not found</div>;

  const isOwnProfile = user?.uid === userId;

  return (
    <div className="mx-auto max-w-2xl px-6 py-24 md:py-32">
      <Link to="/social" className="mb-8 flex items-center text-sm font-bold text-neutral-400 hover:text-emerald-600">
        <ChevronLeft size={16} />
        <span>Community</span>
      </Link>

      <div className="relative overflow-hidden rounded-[3rem] bg-white p-10 shadow-2xl">
        <div className="absolute right-0 top-0 h-40 w-40 translate-x-12 translate-y--12 rounded-full bg-emerald-50" />
        
        <div className="relative flex flex-col items-center text-center">
          <img 
            src={profile.photoURL} 
            alt={profile.displayName} 
            className="h-32 w-32 rounded-[2rem] border-4 border-white shadow-xl"
          />
          <h1 className="mt-6 text-3xl font-black tracking-tight text-neutral-900">{profile.displayName}</h1>
          <p className="text-neutral-400 font-medium tracking-wide">@{profile.username || 'rooted_servant'}</p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {!isOwnProfile && (
              <>
                <button 
                  onClick={toggleFriend}
                  className={`flex items-center space-x-2 rounded-2xl px-8 py-3.5 font-bold transition-all active:scale-95 ${
                    friendship 
                      ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200' 
                      : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700'
                  }`}
                >
                  {friendship ? <UserMinus size={18} /> : <UserPlus size={18} />}
                  <span>{friendship ? 'Unfriend' : 'Add Friend'}</span>
                </button>
                <Link 
                  to={`/social/chat/dm/${userId}`}
                  className="flex items-center space-x-2 rounded-2xl bg-neutral-900 px-8 py-3.5 font-bold text-white shadow-lg active:scale-95 transition-all hover:bg-neutral-800"
                >
                  <MessageSquare size={18} />
                  <span>Message</span>
                </Link>
              </>
            )}
            
            <button 
              onClick={handleShare}
              className="flex items-center space-x-2 rounded-2xl border-2 border-neutral-100 bg-white px-8 py-3 font-bold text-neutral-600 transition-all hover:border-emerald-100 hover:bg-emerald-50 active:scale-95"
            >
              {copied ? <Check size={18} className="text-emerald-600" /> : <LinkIcon size={18} />}
              <span>{copied ? 'Copied' : 'Share Profile'}</span>
            </button>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 border-t border-neutral-100 pt-10">
          <div className="text-center">
            <p className="text-sm font-black text-neutral-900">42</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Chapters Read</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-black text-neutral-900">128</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Verses Rooted</p>
          </div>
        </div>
      </div>
    </div>
  );
}
