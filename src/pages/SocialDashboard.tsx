import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFirebase } from '../context/FirebaseContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Users, UserPlus, MessageSquare, Shield, ChevronRight, Plus, Search, Loader2, Copy, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function SocialDashboard() {
  const { user, signIn } = useFirebase();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'friends' | 'groups'>('friends');
  
  const [friends, setFriends] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Load Friendships
    const friendQuery = query(
      collection(db, 'friendships'),
      where('status', '==', 'accepted'),
      where('user1Id', '==', user.uid)
    );
    const friendQuery2 = query(
      collection(db, 'friendships'),
      where('status', '==', 'accepted'),
      where('user2Id', '==', user.uid)
    );

    // Load Groups
    const groupQuery = query(
      collection(db, 'groups'),
      where('members', 'arrayContains', user.uid)
    );

    const unsubGroups = onSnapshot(groupQuery, (snap) => {
      setGroups(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // For friendships, we'd ideally use a unified collection or merge streams
    // For this MVP, we'll just handle groups mostly and basic friend list
    
    return () => unsubGroups();
  }, [user]);

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('displayName', '>=', searchQuery),
        where('displayName', '<=', searchQuery + '\uf8ff')
      );
      const snap = await getDocs(q);
      setSearchResults(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(u => u.id !== user?.uid));
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!user || !newGroupName.trim()) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      const docRef = await addDoc(collection(db, 'groups'), {
         name: newGroupName,
         joinCode: code,
         createdBy: user.uid,
         members: [user.uid],
         createdAt: new Date().toISOString()
      });
      setIsCreateGroupOpen(false);
      setNewGroupName('');
      navigate(`/social/group/${docRef.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinGroup = async () => {
    if (!user || !joinCode.trim()) return;
    try {
      const q = query(collection(db, 'groups'), where('joinCode', '==', joinCode.trim().toUpperCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const groupDoc = snap.docs[0];
        await updateDoc(doc(db, 'groups', groupDoc.id), {
          members: arrayUnion(user.uid)
        });
        setIsJoinGroupOpen(false);
        setJoinCode('');
        navigate(`/social/group/${groupDoc.id}`);
      } else {
        alert('Invalid join code');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <Users size={64} className="text-neutral-200 mb-6" />
        <h2 className="text-2xl font-bold">Community Awaits</h2>
        <p className="mt-2 text-neutral-500 mb-8">Sign in to connect with friends and join groups.</p>
        <button onClick={signIn} className="rounded-full bg-emerald-600 px-8 py-3 font-bold text-white shadow-lg">Sign In</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-24 md:py-32">
      <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-neutral-900">Community</h1>
          <p className="mt-2 text-neutral-500 font-medium">Connect with brothers and sisters in Christ.</p>
        </div>
        
        <div className="mt-6 flex items-center space-x-3 md:mt-0">
          <button 
            onClick={() => setIsJoinGroupOpen(true)}
            className="flex items-center space-x-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-bold shadow-sm hover:bg-neutral-50 transition-all"
          >
            <Shield size={18} />
            <span>Join Group</span>
          </button>
          <button 
            onClick={() => setIsCreateGroupOpen(true)}
            className="flex items-center space-x-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-neutral-800 transition-all"
          >
            <Plus size={18} />
            <span>Create Group</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex border-b border-neutral-200">
        <button 
          onClick={() => setActiveTab('friends')}
          className={`px-6 py-4 text-sm font-bold transition-all ${activeTab === 'friends' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-neutral-500 hover:text-neutral-800'}`}
        >
          Friends
        </button>
        <button 
          onClick={() => setActiveTab('groups')}
          className={`px-6 py-4 text-sm font-bold transition-all ${activeTab === 'groups' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-neutral-500 hover:text-neutral-800'}`}
        >
          Groups
        </button>
      </div>

      {activeTab === 'friends' ? (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Find friends by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
              className="w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 pl-12 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <button 
              onClick={handleSearchUsers}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm"
            >
              Search
            </button>
          </div>

          {searching && <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-600" /></div>}

          {searchResults.length > 0 && (
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
              <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-neutral-400">Search Results</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {searchResults.map(u => (
                  <Link 
                    key={u.id}
                    to={`/social/profile/${u.id}`}
                    className="flex items-center space-x-3 rounded-xl bg-white p-3 shadow-sm hover:shadow-md transition-all"
                  >
                    <img src={u.photoURL} alt={u.displayName} className="h-10 w-10 rounded-full border border-neutral-100" />
                    <div>
                      <p className="text-sm font-bold text-neutral-900">{u.displayName}</p>
                      <p className="text-[10px] font-medium text-neutral-500">View Profile</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Connected Friends List would go here */}
          <div className="flex flex-col items-center justify-center p-20 text-center opacity-50">
            <UserPlus size={48} className="mb-4" />
            <p className="text-sm font-medium">Your friend list is empty. Start finding friends!</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {loading ? (
            <div className="col-span-full py-20 text-center"><Loader2 className="mx-auto animate-spin text-emerald-600" /></div>
          ) : groups.length > 0 ? (
            groups.map(g => (
              <Link 
                key={g.id}
                to={`/social/group/${g.id}`}
                className="group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 transition-all hover:border-emerald-200 hover:shadow-xl"
              >
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full bg-emerald-50 opacity-0 transition-all group-hover:opacity-100" />
                <div className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <Shield size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900">{g.name}</h3>
                  <div className="mt-4 flex items-center justify-between text-xs font-bold text-neutral-400">
                    <span className="flex items-center space-x-1">
                      <Users size={14} />
                      <span>{g.members?.length || 0} Members</span>
                    </span>
                    <span className="flex items-center space-x-1 uppercase tracking-widest text-emerald-600">
                      <span>View Chat</span>
                      <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 text-center opacity-50">
              <Shield size={48} className="mx-auto mb-4" />
              <p className="text-sm font-medium">No groups yet. Create one for your church or family!</p>
            </div>
          )}
        </div>
      )}

      {/* Create Group Modal */}
      <AnimatePresence>
        {isCreateGroupOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateGroupOpen(false)} className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="fixed inset-0 z-[210] m-auto h-fit w-full max-w-sm overflow-hidden rounded-3xl bg-white p-8 shadow-2xl">
              <h3 className="text-2xl font-black">Create Group</h3>
              <p className="mt-1 text-sm text-neutral-500">Start a spiritual home for your circle.</p>
              <div className="mt-6 space-y-4">
                <input 
                  type="text" 
                  placeholder="Group Name (e.g. Calvary Youth)" 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm font-bold focus:border-emerald-500 focus:outline-none"
                />
                <button 
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim()}
                  className="w-full rounded-xl bg-emerald-600 py-4 font-bold text-white shadow-lg active:scale-95 transition-all disabled:opacity-50"
                >
                  Create & Get Invite Code
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Join Group Modal */}
      <AnimatePresence>
        {isJoinGroupOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsJoinGroupOpen(false)} className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="fixed inset-0 z-[210] m-auto h-fit w-full max-w-sm overflow-hidden rounded-3xl bg-white p-8 shadow-2xl">
              <h3 className="text-2xl font-black">Join Group</h3>
              <p className="mt-1 text-sm text-neutral-500">Enter the 6-digit code from your leader.</p>
              <div className="mt-6 space-y-4">
                <input 
                  type="text" 
                  placeholder="Invite Code (e.g. AB12CD)" 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="w-full text-center text-2xl tracking-[0.5em] rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-black focus:border-emerald-500 focus:outline-none"
                />
                <button 
                  onClick={handleJoinGroup}
                  disabled={joinCode.length < 6}
                  className="w-full rounded-xl bg-neutral-900 py-4 font-bold text-white shadow-lg active:scale-95 transition-all disabled:opacity-50"
                >
                  Join Group
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
