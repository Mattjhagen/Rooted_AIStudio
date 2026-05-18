import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Chrome, Apple, Loader2 } from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn } = useFirebase();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSignIn = async (provider: 'google' | 'apple') => {
    setLoading(provider);
    await signIn(provider);
    setLoading(null);
    onClose();
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
            className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed inset-0 z-[160] m-auto h-fit w-[90%] max-w-md overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl text-center"
          >
            <button 
              onClick={onClose} 
              className="absolute right-6 top-6 rounded-full p-2 hover:bg-neutral-100 transition-colors"
            >
              <X size={20} className="text-neutral-400" />
            </button>

            <div className="mb-8 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/20">
                <BookOpen size={32} />
              </div>
            </div>

            <h2 className="text-3xl font-black tracking-tight text-neutral-900">Welcome to Rooted</h2>
            <p className="mt-3 text-neutral-500 font-medium">
              Join a community growing in faith and truth.
            </p>

            <div className="mt-10 space-y-4">
              <button
                onClick={() => handleSignIn('google')}
                disabled={!!loading}
                className="flex w-full items-center justify-center space-x-4 rounded-2xl border-2 border-neutral-100 bg-white py-4 transition-all hover:bg-neutral-50 hover:border-emerald-100 active:scale-95 disabled:opacity-50"
              >
                {loading === 'google' ? (
                  <Loader2 className="animate-spin text-emerald-600" size={20} />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50">
                    <Chrome size={18} className="text-blue-600" />
                  </div>
                )}
                <span className="font-bold text-neutral-800">Continue with Google</span>
              </button>

              <button
                onClick={() => handleSignIn('apple')}
                disabled={!!loading}
                className="flex w-full items-center justify-center space-x-4 rounded-2xl bg-neutral-900 py-4 text-white shadow-xl shadow-neutral-900/10 transition-all hover:bg-neutral-800 active:scale-95 disabled:opacity-50"
              >
                {loading === 'apple' ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Apple size={20} />
                )}
                <span className="font-bold">Continue with Apple</span>
              </button>
            </div>

            <p className="mt-8 text-xs text-neutral-400 font-medium leading-relaxed">
              By continuing, you agree to Rooted's <br />
              <a href="#" className="underline decoration-emerald-200 underline-offset-2">Terms of Use</a> and <a href="#" className="underline decoration-emerald-200 underline-offset-2">Privacy Policy</a>
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
