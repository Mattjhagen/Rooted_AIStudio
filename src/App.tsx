/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Smartphone, LogOut, User as UserIcon } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import BibleIndex from './pages/BibleIndex';
import BibleReader from './pages/BibleReader';
import SocialDashboard from './pages/SocialDashboard';
import UserProfile from './pages/UserProfile';
import GroupChat from './pages/GroupChat';
import DirectChat from './pages/DirectChat';
import { useEffect, useState } from 'react';
import { getDownloadLink } from './lib/os';
import { FirebaseProvider, useFirebase } from './context/FirebaseContext';
import AuthModal from './components/AuthModal';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Header() {
  const { user, logout } = useFirebase();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <BookOpen size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight">Rooted Daily</span>
        </Link>
        <nav className="hidden space-x-8 md:flex">
          <Link to="/bible" className="text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">Bible</Link>
          <a href="#" className="text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">Habits</a>
          <Link to="/social" className="text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">Community</Link>
        </nav>
        <div className="flex items-center space-x-4">
          <a 
            href={getDownloadLink()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden sm:flex items-center space-x-1 rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 transition-all md:text-sm"
          >
            <Smartphone size={16} />
            <span>Get App</span>
          </a>
          
          {user ? (
            <div className="flex items-center space-x-3">
              <Link to={`/social/profile/${user.uid}`}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="h-8 w-8 rounded-full border border-neutral-200" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <UserIcon size={16} />
                  </div>
                )}
              </Link>
              <button 
                onClick={logout}
                className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-red-500 transition-all"
                title="Log Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-all md:text-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 selection:bg-emerald-100 selection:text-emerald-900">
      <Header />

      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={useLocation().pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-neutral-50 py-12">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="mb-6 flex justify-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-600 text-white">
              <BookOpen size={14} />
            </div>
            <span className="text-sm font-bold">Rooted Daily</span>
          </div>
          <p className="text-sm text-neutral-500">© {new Date().getFullYear()} Rooted Daily. All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-6 text-sm font-medium text-neutral-600">
            <a href="#" className="hover:text-emerald-600">Privacy</a>
            <a href="#" className="hover:text-emerald-600">Terms</a>
            <a href="#" className="hover:text-emerald-600">Support</a>
          </div>
          <p className="mt-8 text-[10px] uppercase tracking-widest text-neutral-400">Renewing hearts through daily truth</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/bible" element={<BibleIndex />} />
            <Route path="/bible/:bookId" element={<BibleReader />} />
            <Route path="/bible/:bookId/:chapter" element={<BibleReader />} />
            
            {/* Social Routes */}
            <Route path="/social" element={<SocialDashboard />} />
            <Route path="/social/profile/:userId" element={<UserProfile />} />
            <Route path="/social/group/:groupId" element={<GroupChat />} />
            <Route path="/social/chat/dm/:userId" element={<DirectChat />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </FirebaseProvider>
  );
}


